import { lazy, Suspense, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { TermData } from '@/lib/terminal';

// three.js + react-three-fiber are ~1 MB: they are not part of the first load.
const Mac3D = lazy(() => import('@/components/Mac3D'));

/** Start the 3D Mac anyway after this long if the visitor has not touched the page. */
const IDLE_START_MS = 6000;
const WAKE_EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;

/** Browsers that expose the Save-Data hint (not in lib.dom). */
const savingData = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * The hero: a lightweight poster of the Mac paints first (that is the page's largest-contentful-paint),
 * and the real interactive 3D Mac loads on the first interaction, or after a few idle seconds, then
 * fades in over the poster. Keeps ~1 MB of JavaScript and the WebGL start-up off the critical path.
 *
 * On a first load of "/" the poster is the static #boot element from index.html (painted before any JS).
 * When arriving here client-side (no #boot), the same poster is rendered by React instead.
 */
export default function MacHero({ projects, experiences }: TermData) {
  const [hasBoot] = useState(() => document.getElementById('boot') !== null);
  const [wake, setWake] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (wake) return;
    const start = () => setWake(true);
    WAKE_EVENTS.forEach((type) => window.addEventListener(type, start, { once: true, passive: true }));
    const idle = savingData() ? undefined : window.setTimeout(start, IDLE_START_MS);
    return () => {
      WAKE_EVENTS.forEach((type) => window.removeEventListener(type, start));
      window.clearTimeout(idle);
    };
  }, [wake]);

  // fade the static poster out once the 3D Mac is showing; never leave it behind another page
  useEffect(() => {
    const boot = document.getElementById('boot');
    if (!ready || !boot) return;
    boot.style.opacity = '0';
    const timer = window.setTimeout(() => boot.remove(), 350);
    return () => window.clearTimeout(timer);
  }, [ready]);
  useEffect(() => () => document.getElementById('boot')?.remove(), []);

  return (
    <div className="relative size-full">
      {!hasBoot && (
        <picture
          aria-hidden={ready}
          className={`absolute inset-0 transition-opacity duration-300 ${ready ? 'pointer-events-none opacity-0' : ''}`}
        >
          <source media="(min-width: 1024px)" srcSet="/images/mac-poster-lg.webp" type="image/webp" />
          <source media="(min-width: 600px)" srcSet="/images/mac-poster-md.webp" type="image/webp" />
          <img
            src="/images/mac-poster-sm.webp"
            alt="A beige Macintosh whose screen reads ZENZEN, Web Developer and Bio Enthusiast"
            width={390}
            height={780}
            fetchPriority="high"
            decoding="async"
            className="size-full object-contain"
          />
        </picture>
      )}

      {wake && (
        // the 3D root sizes itself with size-full inside an absolutely positioned box (it must not be "absolute"
        // itself: it is "relative" for its overlays, and a zero-height canvas box never starts the renderer)
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Mac3D className="size-full" projects={projects} experiences={experiences} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}

      {wake && !ready && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 b2 text-beige-light/80" role="status">
          <LoaderCircle size={18} className="animate-spin text-phosphor" /> Loading model...
        </div>
      )}
    </div>
  );
}
