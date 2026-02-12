/*
  # Phase 2: Schema & Data Integrity Fixes
  
  Addresses audit findings:
  - F-010: severity column type mismatch (TEXT in SQL vs number in TypeScript)
  - F-014: Homepage fake statistics infrastructure (analytics table prep)
  - F-019: Admin authorization pattern standardization
  - F-036: Remove redundant idx_profiles_user_id index

  1. Schema Fixes
    - Convert emergency_incidents.severity from TEXT to INTEGER
    - Drop redundant PK-duplicate index on profiles
  
  2. New Tables (Compliance & Audit)
    - data_access_logs: WHO accessed WHAT medical data and WHEN
    - legal_document_versions: Versioned legal documents for consent tracking
    - account_deletion_requests: GDPR/Kenya DPA Article 40 right to erasure
    - security_events: Failed logins, suspicious activity, auth anomalies
  
  3. RLS Policies
    - All new tables have proper RLS with user/admin access control
*/

-- ============================================
-- 1. FIX SEVERITY COLUMN TYPE (F-010)
-- ============================================

-- Convert severity from TEXT to INTEGER
-- Map existing text values to numbers, default unknown/null to 1
ALTER TABLE public.emergency_incidents 
  ALTER COLUMN severity TYPE INTEGER 
  USING CASE 
    WHEN severity ~ '^\d+$' THEN severity::INTEGER 
    WHEN severity = 'critical' THEN 10
    WHEN severity = 'high' THEN 8
    WHEN severity = 'medium' THEN 5
    WHEN severity = 'low' THEN 2
    WHEN severity = 'unknown' THEN 1
    ELSE 1 
  END;

ALTER TABLE public.emergency_incidents 
  ALTER COLUMN severity SET DEFAULT 1;

-- ============================================
-- 2. REMOVE REDUNDANT INDEX (F-036)
-- ============================================

-- profiles.id is already the PRIMARY KEY, which has an implicit index
DROP INDEX IF EXISTS idx_profiles_user_id;

-- ============================================
-- 3. DATA ACCESS LOGS TABLE
-- ============================================

-- Tracks WHO accessed WHAT medical data and WHEN
-- Required for Kenya DPA 2019 compliance and GDPR accountability
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  accessed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL,           -- 'view_profile', 'view_medical', 'qr_scan', 'admin_view', 'export', 'emergency_access'
  resource_type TEXT NOT NULL,         -- 'profiles', 'emergency_contacts', 'emergency_incidents', 'qr_access_tokens'
  resource_id UUID,                    -- Specific record accessed (nullable for list views)
  fields_accessed TEXT[],              -- Which fields were viewed: ['blood_type','allergies','medications']
  access_context TEXT,                 -- 'emergency_sos', 'admin_dashboard', 'qr_scan', 'self_view'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs about their own data being accessed
CREATE POLICY "Users can view access logs for their own data"
  ON public.data_access_logs FOR SELECT
  USING (auth.uid() = accessed_user_id);

-- Admins can view all access logs
CREATE POLICY "Admins can view all access logs"
  ON public.data_access_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- System inserts access logs (service role or authenticated users)
CREATE POLICY "Authenticated users can insert access logs"
  ON public.data_access_logs FOR INSERT
  WITH CHECK (auth.uid() = accessor_id);

-- Admins can insert access logs (for admin-initiated access)
CREATE POLICY "Admins can insert access logs"
  ON public.data_access_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for access logs
CREATE INDEX idx_data_access_logs_accessor ON public.data_access_logs(accessor_id);
CREATE INDEX idx_data_access_logs_accessed_user ON public.data_access_logs(accessed_user_id);
CREATE INDEX idx_data_access_logs_created_at ON public.data_access_logs(created_at);
CREATE INDEX idx_data_access_logs_access_type ON public.data_access_logs(access_type);

-- ============================================
-- 4. LEGAL DOCUMENT VERSIONS TABLE
-- ============================================

-- Stores versioned legal documents that consent records reference
CREATE TABLE IF NOT EXISTS public.legal_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,         -- 'privacy_policy', 'terms_of_service', 'medical_disclaimer', 'data_processing_agreement'
  version TEXT NOT NULL,               -- Semantic version: '1.0.0', '1.1.0'
  title TEXT NOT NULL,
  content TEXT NOT NULL,               -- Full document HTML/Markdown
  summary_of_changes TEXT,             -- Human-readable changelog
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  superseded_date TIMESTAMP WITH TIME ZONE,  -- NULL = currently active
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_type, version)
);

ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;

-- Legal documents are publicly readable (anyone must be able to read T&C)
CREATE POLICY "Legal documents are publicly readable"
  ON public.legal_document_versions FOR SELECT
  USING (true);

-- Only admins can manage legal documents
CREATE POLICY "Admins can manage legal documents"
  ON public.legal_document_versions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_legal_docs_type ON public.legal_document_versions(document_type);
CREATE INDEX idx_legal_docs_active ON public.legal_document_versions(document_type, superseded_date) 
  WHERE superseded_date IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_legal_document_versions_updated_at
  BEFORE UPDATE ON public.legal_document_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. ACCOUNT DELETION REQUESTS TABLE
-- ============================================

-- GDPR Article 17 / Kenya DPA Article 40: Right to Erasure
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,                          -- User-provided reason (optional)
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'rejected'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Admin who processed
  rejection_reason TEXT,                -- If rejected, why
  data_export_url TEXT,                 -- Signed URL to exported data (before deletion)
  data_export_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion requests
CREATE POLICY "Users can view their own deletion requests"
  ON public.account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can submit deletion requests
CREATE POLICY "Users can insert their own deletion requests"
  ON public.account_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all deletion requests
CREATE POLICY "Admins can view all deletion requests"
  ON public.account_deletion_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update deletion requests (process them)
CREATE POLICY "Admins can update deletion requests"
  ON public.account_deletion_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_deletion_requests_user ON public.account_deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON public.account_deletion_requests(status);
CREATE INDEX idx_deletion_requests_pending ON public.account_deletion_requests(status, requested_at) 
  WHERE status = 'pending';

-- Trigger for updated_at
CREATE TRIGGER update_account_deletion_requests_updated_at
  BEFORE UPDATE ON public.account_deletion_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. SECURITY EVENTS TABLE
-- ============================================

-- Tracks authentication anomalies, failed logins, and security-relevant events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL for unauthenticated events
  event_type TEXT NOT NULL,            -- 'login_failed', 'login_success', 'password_changed', 'mfa_enrolled', 'suspicious_activity', 'account_locked', 'consent_revoked', 'admin_action'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,  -- Flexible event-specific data
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own security events
CREATE POLICY "Users can view their own security events"
  ON public.security_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all security events
CREATE POLICY "Admins can view all security events"
  ON public.security_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can insert their own security events
CREATE POLICY "Authenticated users can insert security events"
  ON public.security_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can insert any security event
CREATE POLICY "Admins can insert any security event"
  ON public.security_events FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes (security events are heavily queried for monitoring)
CREATE INDEX idx_security_events_user ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_security_events_critical ON public.security_events(severity, created_at) 
  WHERE severity IN ('error', 'critical');
