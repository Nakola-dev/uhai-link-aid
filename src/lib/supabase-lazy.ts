/**
 * supabase-js is the largest part of the entry bundle, and most visitors (first responders,
 * people reading the landing page) never need it. These helpers let shared components defer
 * loading it until there is a stored session or an auth flow in progress.
 */

/** True when the browser holds a stored Supabase session (key `sb-<ref>-auth-token`). */
export function hasStoredSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) return true;
    }
  } catch {
    // Storage blocked: behave as signed out.
  }
  return false;
}

/** True when the URL carries an auth redirect (email link, OAuth, password reset). */
export function hasAuthRedirect(): boolean {
  const { hash, search } = window.location;
  return /access_token=|type=recovery|error_description=/.test(hash) || /[?&]code=/.test(search);
}

export const loadSupabase = () => import('@/integrations/supabase/client').then((m) => m.supabase);
