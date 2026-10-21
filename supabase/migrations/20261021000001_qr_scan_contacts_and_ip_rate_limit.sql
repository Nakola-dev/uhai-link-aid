-- QR scan function v2 (UI/UX transformation, Phase 0b)
--
-- Fixes:
--   1. Responders now see emergency contacts. Contacts live in public.emergency_contacts;
--      v1 returned profiles.emergency_contact_* columns that the app never writes.
--   2. Rate limiting works per real client. v1 keyed on the client-supplied _ip_address,
--      which the web app always sent as 'unknown', so 5 scans/minute was shared by every
--      responder on the platform. The IP now comes from the API gateway's request headers.
--   3. The client IP is stored pseudonymised (salted SHA-256), matching DPIA §2.1.
--      Optional salt:  ALTER DATABASE postgres SET app.settings.scan_ip_salt = '<random secret>';
--   4. Limits are per IP *and* per QR code (10/min), plus a broader per-IP cap (60/min),
--      so responders sharing one hospital network can still scan several patients.
--   5. The internal user id is no longer returned to the public.
--   6. SECURITY DEFINER with a pinned search_path.
--
-- The signature is unchanged, so deployed clients keep working.

CREATE INDEX IF NOT EXISTS idx_qr_scans_ip_created
  ON public.qr_scans (ip_address, created_at);

CREATE OR REPLACE FUNCTION public.check_and_log_qr_scan(
  _access_token TEXT,
  _ip_address TEXT DEFAULT 'unknown',
  _user_agent TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _token_record RECORD;
  _headers JSON;
  _client_ip TEXT;
  _ip_key TEXT;
  _token_scans INT;
  _ip_scans INT;
  _access_granted BOOLEAN;
  _denial_reason TEXT;
  _profile_data JSONB;
  _contacts JSONB;
BEGIN
  -- 1. Validate the QR access token
  SELECT qt.id, qt.user_id, qt.is_active
  INTO _token_record
  FROM qr_access_tokens qt
  WHERE qt.access_token = _access_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired QR code');
  END IF;

  IF NOT _token_record.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'This QR code has been deactivated');
  END IF;

  -- 2. Identify the client. Prefer headers the gateway sets itself (cf-connecting-ip,
  --    x-real-ip); the first X-Forwarded-For entry and the client argument are fallbacks.
  BEGIN
    _headers := current_setting('request.headers', true)::json;
  EXCEPTION WHEN others THEN
    _headers := NULL;
  END;

  _client_ip := COALESCE(
    NULLIF(trim(_headers ->> 'cf-connecting-ip'), ''),
    NULLIF(trim(_headers ->> 'x-real-ip'), ''),
    NULLIF(trim(split_part(COALESCE(_headers ->> 'x-forwarded-for', ''), ',', 1)), ''),
    NULLIF(trim(_ip_address), ''),
    'unknown'
  );

  _ip_key := encode(
    sha256(convert_to(COALESCE(current_setting('app.settings.scan_ip_salt', true), '') || _client_ip, 'UTF8')),
    'hex'
  );

  -- 3. Rate limits
  SELECT
    COUNT(*) FILTER (WHERE qr_token_id = _token_record.id),
    COUNT(*)
  INTO _token_scans, _ip_scans
  FROM qr_scans
  WHERE ip_address = _ip_key
    AND created_at > (NOW() - INTERVAL '1 minute');

  _access_granted := _token_scans < 10 AND _ip_scans < 60;
  _denial_reason := CASE
    WHEN _access_granted THEN NULL
    WHEN _token_scans >= 10 THEN 'Rate limit exceeded (10 scans/minute for this code from one network)'
    ELSE 'Rate limit exceeded (60 scans/minute from one network)'
  END;

  -- 4. Log every attempt (pseudonymised IP only)
  INSERT INTO qr_scans (qr_token_id, ip_address, user_agent, access_granted, denial_reason, created_at)
  VALUES (_token_record.id, _ip_key, left(COALESCE(_user_agent, ''), 512), _access_granted, _denial_reason, NOW());

  IF NOT _access_granted THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Too many scans from this network. Please try again in a moment.'
    );
  END IF;

  -- 5. Emergency subset of the profile
  SELECT jsonb_build_object(
    'full_name', p.full_name,
    'phone', p.phone,
    'gender', p.gender,
    'blood_type', p.blood_type,
    'allergies', p.allergies,
    'medications', p.medications,
    'chronic_conditions', p.chronic_conditions,
    'primary_hospital', p.primary_hospital,
    'updated_at', p.updated_at
  )
  INTO _profile_data
  FROM profiles p
  WHERE p.id = _token_record.user_id;

  IF _profile_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('name', ec.name, 'phone', ec.phone, 'relationship', ec.relationship)
      ORDER BY ec.priority NULLS LAST, ec.created_at
    ),
    '[]'::jsonb
  )
  INTO _contacts
  FROM emergency_contacts ec
  WHERE ec.user_id = _token_record.user_id;

  RETURN jsonb_build_object(
    'success', true,
    'profile', _profile_data || jsonb_build_object('emergency_contacts', _contacts)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_log_qr_scan(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_and_log_qr_scan(TEXT, TEXT, TEXT) TO authenticated;
