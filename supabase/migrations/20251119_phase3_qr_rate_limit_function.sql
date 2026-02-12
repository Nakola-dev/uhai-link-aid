-- Phase 3: F-013 — Server-side QR scan rate limiting
-- Moves rate limiting from client-side JS to a PostgreSQL function
-- that atomically checks rate limits and logs scans.

CREATE OR REPLACE FUNCTION public.check_and_log_qr_scan(
  _access_token TEXT,
  _ip_address TEXT DEFAULT 'unknown',
  _user_agent TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _token_record RECORD;
  _recent_count INT;
  _access_granted BOOLEAN;
  _denial_reason TEXT;
  _profile_data JSONB;
BEGIN
  -- 1. Validate the QR access token
  SELECT qt.id, qt.user_id, qt.is_active
  INTO _token_record
  FROM qr_access_tokens qt
  WHERE qt.access_token = _access_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired QR code'
    );
  END IF;

  IF NOT _token_record.is_active THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This QR code has been deactivated'
    );
  END IF;

  -- 2. Rate limit: count scans from this IP in the last minute
  SELECT COUNT(*)
  INTO _recent_count
  FROM qr_scans
  WHERE ip_address = _ip_address
    AND created_at > (NOW() - INTERVAL '1 minute');

  _access_granted := _recent_count < 5;
  _denial_reason := CASE
    WHEN _access_granted THEN NULL
    ELSE 'Rate limit exceeded (5 scans/minute from IP ' || _ip_address || ')'
  END;

  -- 3. Log the scan attempt (always, even if denied)
  INSERT INTO qr_scans (qr_token_id, ip_address, user_agent, access_granted, denial_reason, created_at)
  VALUES (_token_record.id, _ip_address, _user_agent, _access_granted, _denial_reason, NOW());

  IF NOT _access_granted THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Too many scans from this location. Please try again in a moment.'
    );
  END IF;

  -- 4. Fetch the profile data for the token's user
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'phone', p.phone,
    'blood_type', p.blood_type,
    'allergies', p.allergies,
    'medications', p.medications,
    'chronic_conditions', p.chronic_conditions,
    'emergency_contact_name', p.emergency_contact_name,
    'emergency_contact_phone', p.emergency_contact_phone,
    'emergency_contact_relationship', p.emergency_contact_relationship,
    'primary_hospital', p.primary_hospital,
    'gender', p.gender,
    'updated_at', p.updated_at
  )
  INTO _profile_data
  FROM profiles p
  WHERE p.id = _token_record.user_id;

  IF _profile_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'profile', _profile_data
  );
END;
$$;

-- Allow anonymous access (public profile viewing doesn't require auth)
GRANT EXECUTE ON FUNCTION public.check_and_log_qr_scan TO anon;
GRANT EXECUTE ON FUNCTION public.check_and_log_qr_scan TO authenticated;
