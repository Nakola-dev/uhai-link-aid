import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = false, requireAdmin = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/auth');
          return;
        }

        // Check admin role if required
        if (requireAdmin) {
          const { data: isAdmin } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin',
          });

          if (!isAdmin) {
            navigate('/dashboard');
            return;
          }
        }

        if (requireOnboarding) {
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          if (!profile?.onboarding_completed) {
            navigate('/onboarding');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requireOnboarding, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent" />
          <p className="text-sm text-white/70">Verifying access…</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
