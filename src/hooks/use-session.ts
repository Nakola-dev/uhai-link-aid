import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasAuthRedirect, hasStoredSession, loadSupabase } from '@/lib/supabase-lazy';

/**
 * Lightweight signed-in check for public pages: reads the locally stored session
 * and follows auth changes, without fetching the profile or role.
 * Visitors with no stored session never download supabase-js for this check.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasStoredSession() && !hasAuthRedirect()) {
      setReady(true);
      return;
    }
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    loadSupabase().then((supabase) => {
      if (!mounted) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setReady(true);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
      unsubscribe = () => subscription.unsubscribe();
    });
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return { session, ready };
}
