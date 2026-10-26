import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Entrance/exit animation for every `[data-win]` element inside `scope`:
 * the window "zooms" open (stepped, chunky) as it scrolls into view, and
 * collapses back to a line when it scrolls out of the top. Re-runs when
 * `deps` change (e.g. after data loads).
 */
export function useWindowReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = scope.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-win]').forEach((el) => {
        const open = gsap.fromTo(
          el,
          { opacity: 0, scaleY: 0.04, scaleX: 0.9, transformOrigin: '50% 0%' },
          { opacity: 1, scaleY: 1, scaleX: 1, duration: 0.5, ease: 'steps(6)', paused: true }
        );
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          // layout height, not getBoundingClientRect: the collapsed (scaled) window must not shrink the trigger
          end: () => `top+=${el.offsetHeight} 12%`,
          onEnter: () => open.play(),
          onLeave: () => open.reverse(),
          onEnterBack: () => open.play(),
          onLeaveBack: () => open.reverse(),
        });
      });
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
