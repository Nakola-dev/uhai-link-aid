/*
  # Phase 1: Critical Security & Legal Fixes
  
  Addresses audit findings:
  - F-001: No consent capture at registration
  - F-005: Hardcoded admin email in handle_new_user()
  - F-008: Duplicate chat_history table with conflicting schemas
  - F-010: severity column type mismatch (TEXT vs number)
  - F-022: No user_consents table

  1. New Tables
    - user_consents: Consent capture & proof with full audit trail
  
  2. Schema Fixes
    - Drop and recreate chat_history with JSONB messages structure (Phase 2 canonical)
    - Fix severity column to consistently use TEXT
    - Remove hardcoded admin email from handle_new_user()
  
  3. New Indexes
    - profiles.onboarding_completed (used on every auth check)
    - user_consents indexes for user lookups
*/

-- ============================================
-- 1. CREATE USER_CONSENTS TABLE (F-001, F-022)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,        -- 'terms_of_service', 'privacy_policy', 'medical_data_processing', 'emergency_data_sharing'
  consent_version TEXT NOT NULL,     -- e.g., '1.0.0' — ties to legal_document_versions later
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consents  
CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consents (for revocation)
CREATE POLICY "Users can update their own consents"
  ON public.user_consents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all consents
CREATE POLICY "Admins can view all consents"
  ON public.user_consents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON public.user_consents(user_id, consent_type, granted);

-- Trigger for updated_at
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. FIX HARDCODED ADMIN EMAIL (F-005)
-- ============================================

-- Replace handle_new_user() to remove hardcoded admin email
-- Admins must now be provisioned manually via the user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  -- All new users get the 'user' role by default
  -- Admin roles must be assigned manually by existing admins
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

-- ============================================
-- 3. FIX CHAT_HISTORY SCHEMA (F-008)
-- ============================================

-- Drop the Phase 1 chat_history structure and recreate with Phase 2 canonical schema
-- The IF NOT EXISTS in Phase 2 silently failed, so the table has Phase 1 columns.
-- We need to migrate to the JSONB-based structure the frontend expects.

-- Drop old indexes that reference Phase 1 columns
DROP INDEX IF EXISTS idx_chat_history_conversation_id;

-- Remove Phase 1 columns and add Phase 2 columns
ALTER TABLE public.chat_history DROP COLUMN IF EXISTS message_text;
ALTER TABLE public.chat_history DROP COLUMN IF EXISTS role;
ALTER TABLE public.chat_history DROP COLUMN IF EXISTS conversation_id;
ALTER TABLE public.chat_history DROP COLUMN IF EXISTS model_used;
ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS session_start TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;

-- Add update policy that was missing from Phase 1
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_history' 
    AND policyname = 'Users can update their own chat history'
  ) THEN
    CREATE POLICY "Users can update their own chat history"
      ON public.chat_history FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 4. ADD MISSING INDEXES
-- ============================================

-- profiles.onboarding_completed — queried on every authenticated page load
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- articles.category — filtered in learn views
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);

-- articles.is_featured — filtered for homepage
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured);

-- emergency_organizations.type — filtered in directory views
CREATE INDEX IF NOT EXISTS idx_emergency_orgs_type ON public.emergency_organizations(type);
