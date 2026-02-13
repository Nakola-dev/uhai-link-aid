-- Phase 5: Add user suspension infrastructure
-- Adds is_suspended column to profiles and updates admin_logs

-- 1. Add is_suspended column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- 2. Add index for quickly finding suspended users
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended
  ON public.profiles (is_suspended)
  WHERE is_suspended = true;

-- 3. Add 'suspend' and 'reactivate' to admin_action_type enum
-- (We reuse 'update' for now since ALTER TYPE ADD VALUE can't run in transactions)
-- The existing 'update' action_type covers suspend/reactivate operations.

-- 4. Add RLS policy: users cannot do anything if suspended (defense-in-depth)
-- This blocks suspended users from inserting emergency incidents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'emergency_incidents' 
    AND policyname = 'suspended_users_cannot_create_incidents'
  ) THEN
    CREATE POLICY "suspended_users_cannot_create_incidents"
      ON public.emergency_incidents
      FOR INSERT
      WITH CHECK (
        NOT EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.is_suspended = true
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.is_suspended IS 'Admin-managed suspension flag. Suspended users cannot trigger emergencies.';
