import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  medications: string[] | null;
  chronic_conditions: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  gender: string | null;
  date_of_birth: string | null;
  city: string | null;
  county: string | null;
  profile_photo_url: string | null;
  primary_hospital: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  updated_at: string | null;
}

interface UseAuthOptions {
  /** If true, redirects to /auth when not authenticated. Defaults to true. */
  requireAuth?: boolean;
}

interface UseAuthReturn {
  /** Supabase auth user object */
  user: User | null;
  /** User profile from the profiles table */
  profile: Profile | null;
  /** Whether the user has the 'admin' role */
  isAdmin: boolean;
  /** Whether the initial auth check is still loading */
  loading: boolean;
  /** Re-fetch the profile (e.g., after an edit) */
  refreshProfile: () => Promise<void>;
}

/**
 * Centralized auth hook that eliminates repeated auth-check boilerplate (F-029).
 * 
 * Handles:
 * - Session retrieval
 * - Profile fetching
 * - Admin role check via has_role() RPC
 * - Redirect to /auth if not authenticated (configurable)
 * 
 * Usage:
 * ```ts
 * const { user, profile, isAdmin, loading } = useAuth();
 * ```
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { requireAuth = true } = options;
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const [profileRes, adminRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
    }
    setIsAdmin(!!adminRes.data);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (requireAuth) {
            navigate('/auth');
          }
          if (mounted) setLoading(false);
          return;
        }

        if (mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth state changes (sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (!session) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          if (requireAuth) {
            navigate('/auth');
          }
          return;
        }

        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, requireAuth]);

  return { user, profile, isAdmin, loading, refreshProfile };
}
