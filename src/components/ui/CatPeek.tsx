import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

/**
 * Black-cat intro: pops up from the bottom edge, looks left/right, wiggles its
 * ears, then drops back down and unmounts. Re-plays on every route change
 * because the inner component is keyed by pathname.
 */
function CatPeekRun() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);

    const ctx = gsap.context(() => {
      gsap.set(q('[data-cat="body"]'), { yPercent: 100 });
      gsap.set(q('[data-cat="ear-l"]'), { svgOrigin: '88 86' });
      gsap.set(q('[data-cat="ear-r"]'), { svgOrigin: '172 86' });

      gsap.timeline({ onComplete: () => setPlaying(false) })
        .to(q('[data-cat="body"]'), { yPercent: 0, duration: 0.55, ease: 'back.out(1.7)' })
        .to(q('[data-cat="pupil"]'), { x: -7, duration: 0.25, ease: 'power1.inOut' }, '+=0.1')
        .to(q('[data-cat="pupil"]'), { x: 7, duration: 0.4, ease: 'power1.inOut' }, '+=0.15')
        .to(q('[data-cat="pupil"]'), { x: 0, duration: 0.25, ease: 'power1.inOut' }, '+=0.1')
        .to(q('[data-cat="ear-l"]'), { rotation: -14, duration: 0.09, yoyo: true, repeat: 5 }, '<')
        .to(q('[data-cat="ear-r"]'), { rotation: 14, duration: 0.09, yoyo: true, repeat: 5 }, '<0.05')
        .to(q('[data-cat="body"]'), { yPercent: 100, duration: 0.45, ease: 'power2.in' }, '+=0.35');
    }, root);

    return () => ctx.revert();
  }, []);

  if (!playing) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-x-0 bottom-0 z-[100] flex justify-center overflow-hidden pointer-events-none"
    >
      <svg data-cat="body" viewBox="0 0 260 190" className="w-52 sm:w-64 fill-black">
        {/* ears: filled + stroked so the tips stay soft */}
        <g data-cat="ear-l">
          <polygon points="62,100 58,38 110,74" className="stroke-black" strokeWidth="8" strokeLinejoin="round" />
          <polygon points="71,86 69,54 94,72" className="fill-white/20" />
        </g>
        <g data-cat="ear-r">
          <polygon points="198,100 202,38 150,74" className="stroke-black" strokeWidth="8" strokeLinejoin="round" />
          <polygon points="189,86 191,54 166,72" className="fill-white/20" />
        </g>

        {/* head */}
        <ellipse cx="130" cy="138" rx="80" ry="66" />

        {/* eyes: amber, pupils slide left/right */}
        <ellipse cx="100" cy="120" rx="17" ry="18" className="fill-amber" />
        <ellipse cx="160" cy="120" rx="17" ry="18" className="fill-amber" />
        <g data-cat="pupil">
          <ellipse cx="100" cy="120" rx="5" ry="13" className="fill-black" />
          <circle cx="97" cy="114" r="2.5" className="fill-white" />
        </g>
        <g data-cat="pupil">
          <ellipse cx="160" cy="120" rx="5" ry="13" className="fill-black" />
          <circle cx="157" cy="114" r="2.5" className="fill-white" />
        </g>

        {/* nose, "ω" mouth, whiskers */}
        <polygon points="124,142 136,142 130,150" className="fill-red/70" />
        <path
          d="M130 150 v4 M130 154 q-7 9 -14 2 M130 154 q7 9 14 2"
          className="fill-none stroke-white/70"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M82 146 l-30 -5 M82 153 l-32 4 M178 146 l30 -5 M178 153 l32 4"
          className="fill-none stroke-white/40"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* paws gripping the edge: ฅ ... ฅ */}
        <ellipse cx="30" cy="170" rx="25" ry="26" />
        <ellipse cx="230" cy="170" rx="25" ry="26" />
        <path
          d="M22 156 v8 M32 154 v10 M42 156 v8 M218 156 v8 M228 154 v10 M238 156 v8"
          className="fill-none stroke-white/30"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function CatPeek() {
  const { pathname } = useLocation();
  return <CatPeekRun key={pathname} />;
}
