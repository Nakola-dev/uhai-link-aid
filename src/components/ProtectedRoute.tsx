import { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { hasRequiredConsents } from '@/lib/consent';

interface ProtectedRouteProps {
  /** Omit to use as a layout route (renders the matched child route). */
  children?: ReactNode;
  requireOnboarding?: boolean;
  requireAdmin?: boolean;
}

/**
 * Client-side gate for UX only — data access is enforced by Supabase RLS and
 * server-side role checks. Used as a layout route so the check runs once per
 * area, not on every navigation inside it.
 */
export const ProtectedRoute = ({ children, requireOnboarding = false, requireAdmin = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth', { replace: true, state: { from: location.pathname } });
          return;
        }

        if (requireAdmin) {
          const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
          if (!isAdmin) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        if (requireOnboarding) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          if (!profile?.onboarding_completed) {
            navigate('/onboarding', { replace: true });
            return;
          }

          // Accounts created before consent capture existed must give consent once.
          // If consent can't be checked (e.g. table unavailable), don't block access to emergency features.
          const consented = await hasRequiredConsents(session.user.id).catch(() => true);
          if (!consented) {
            navigate('/onboarding', { replace: true });
            return;
          }
        }

        if (!cancelled) setIsAuthorized(true);
      } catch {
        navigate('/auth', { replace: true });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
    // Re-check only when the guard's requirements change, not on every child navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, requireOnboarding, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Checking your account…</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
