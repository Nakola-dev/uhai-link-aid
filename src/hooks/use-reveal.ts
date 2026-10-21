import { useEffect, useRef } from 'react';

/**
 * Reveals `.reveal` descendants as they scroll into view. Content is only hidden
 * once this runs (it adds `reveal-ready` to <html>), so pages stay fully visible
 * without JavaScript or IntersectionObserver; reduced-motion users see no transition.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    document.documentElement.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return ref;
}
