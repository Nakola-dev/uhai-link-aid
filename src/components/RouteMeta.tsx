import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { hasAuthRedirect, hasStoredSession, loadSupabase } from '@/lib/supabase-lazy';
import { purgeSensitiveCaches } from '@/lib/sensitive-cache';

const SITE = 'UhaiLink';

/** First matching prefix wins, so more specific paths come first. */
const TITLES: Array<[RegExp, string]> = [
  [/^\/$/, 'UhaiLink — Your medical identity, ready when seconds matter'],
  [/^\/auth/, 'Sign in or create an account'],
  [/^\/services/, 'Services'],
  [/^\/learn/, 'Learn first aid'],
  [/^\/about/, 'About'],
  [/^\/contact/, 'Contact'],
  [/^\/privacy-policy/, 'Privacy Policy'],
  [/^\/terms-of-service/, 'Terms of Service'],
  [/^\/medical-disclaimer/, 'Medical & Emergency Disclaimer'],
  [/^\/onboarding/, 'Set up your profile'],
  [/^\/profile\//, 'Emergency medical information'],
  [/^\/demo\/responder/, 'What a responder sees (demo)'],
  [/^\/offline/, 'You are offline'],
  [/^\/dashboard(\/user)?\/emergency/, 'Emergency SOS'],
  [/^\/dashboard(\/user)?\/qr/, 'My Medical ID'],
  [/^\/dashboard(\/user)?\/profile/, 'Medical profile'],
  [/^\/dashboard(\/user)?\/assistant/, 'AI first aid assistant'],
  [/^\/dashboard(\/user)?\/learn/, 'Learning centre'],
  [/^\/dashboard(\/user)?\/buy-qr/, 'Get a QR tag'],
  [/^\/dashboard(\/user)?\/settings/, 'Settings'],
  [/^\/(dashboard\/)?admin\/emergencies/, 'Emergency operations · Admin'],
  [/^\/(dashboard\/)?admin/, 'Admin dashboard'],
  [/^\/dashboard/, 'Dashboard'],
];

/** Medical, account and admin pages must never be indexed by search engines. */
const PRIVATE_ROUTES = /^\/(profile|dashboard|admin|onboarding)(\/|$)/;

function setRobots(content: string | null) {
  let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!content) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'robots';
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/** Per-route document titles, robots directives and session clean-up. */
const RouteMeta = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const match = TITLES.find(([pattern]) => pattern.test(pathname));
    const title = match ? match[1] : 'Page not found';
    document.title = title.startsWith(SITE) ? title : `${title} · ${SITE}`;
    setRobots(PRIVATE_ROUTES.test(pathname) ? 'noindex, nofollow, noarchive' : null);
  }, [pathname]);

  // supabase-js is only loaded when there is something to listen for: a stored session, the
  // sign-in page, or an auth redirect. Everyone else (e.g. first responders) never downloads it.
  const unsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubscribe.current) return;
    if (!hasStoredSession() && !hasAuthRedirect() && !pathname.startsWith('/auth')) return;
    let cancelled = false;
    loadSupabase().then((supabase) => {
      if (cancelled || unsubscribe.current) return;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
          purgeSensitiveCaches();
        }
        // A reset link may land on any page (Supabase falls back to the site URL when the
        // redirect isn't allow-listed); always send the user to the new-password form.
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/auth?mode=update-password', { replace: true });
        }
      });
      unsubscribe.current = () => subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, queryClient, navigate]);

  // Unsubscribe only when the component itself goes away, not on every route change.
  useEffect(
    () => () => {
      unsubscribe.current?.();
      unsubscribe.current = null;
    },
    []
  );

  return null;
};

export default RouteMeta;
