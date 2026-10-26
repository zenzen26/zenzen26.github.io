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
      gsap.set(q('[data-cat="ear-l"]'), { svgOrigin: '325 45' });
      gsap.set(q('[data-cat="ear-r"]'), { svgOrigin: '675 45' });

      gsap.timeline({ onComplete: () => setPlaying(false) })
        .to(q('[data-cat="body"]'), { yPercent: 0, duration: 0.55, ease: 'back.out(1.7)' })
        .to(q('[data-cat="pupil"]'), { x: -12, duration: 0.25, ease: 'power1.inOut' }, '+=0.1')
        .to(q('[data-cat="pupil"]'), { x: 12, duration: 0.4, ease: 'power1.inOut' }, '+=0.15')
        .to(q('[data-cat="pupil"]'), { x: 0, duration: 0.25, ease: 'power1.inOut' }, '+=0.1')
        .to(q('[data-cat="ear-l"]'), { rotation: -8, duration: 0.09, yoyo: true, repeat: 5 }, '<')
        .to(q('[data-cat="ear-r"]'), { rotation: 8, duration: 0.09, yoyo: true, repeat: 5 }, '<0.05')
        .to(q('[data-cat="body"]'), { yPercent: 100, duration: 0.45, ease: 'power2.in' }, '+=0.35');
    }, root);

    return () => ctx.revert();
  }, []);

  if (!playing) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-x-0 -bottom-[4vw] z-[100] flex justify-center overflow-hidden pointer-events-none"
    >
      <svg data-cat="body" viewBox="0 -80 1000 340" className="w-full h-auto fill-black">
        {/* ears: filled + stroked so the tips stay soft */}
        <g data-cat="ear-l">
          <polygon points="245,80 285,-45 405,20" className="stroke-black" strokeWidth="16" strokeLinejoin="round" />
          <polygon points="272,60 290,-5 350,25" className="fill-white/20" />
        </g>
        <g data-cat="ear-r">
          <polygon points="755,80 715,-45 595,20" className="stroke-black" strokeWidth="16" strokeLinejoin="round" />
          <polygon points="728,60 710,-5 650,25" className="fill-white/20" />
        </g>

        {/* head: half-ellipse spanning the middle 70% of the width; outer 15% each side is paw area */}
        <path d="M150 260 V200 A350 190 0 0 1 850 200 V260 Z" />

        {/* eyes: phosphor, pupils slide left/right */}
        <ellipse cx="395" cy="120" rx="32" ry="34" className="fill-phosphor" />
        <ellipse cx="605" cy="120" rx="32" ry="34" className="fill-phosphor" />
        <g data-cat="pupil">
          <ellipse cx="395" cy="120" rx="9" ry="25" className="fill-black" />
          <circle cx="390" cy="109" r="4.5" className="fill-white" />
        </g>
        <g data-cat="pupil">
          <ellipse cx="605" cy="120" rx="9" ry="25" className="fill-black" />
          <circle cx="600" cy="109" r="4.5" className="fill-white" />
        </g>

        {/* nose, "ω" mouth, whiskers */}
        <polygon points="488,138 512,138 500,152" className="fill-grey" />
        <path
          d="M500 152 v8 M500 160 q-14 16 -28 4 M500 160 q14 16 28 4"
          className="fill-none stroke-white/70"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M370 150 L230 135 M370 165 L225 180 M630 150 L770 135 M630 165 L775 180"
          className="fill-none stroke-white/40"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* paws gripping the edge: ฅ ... ฅ */}
        <path d="M15 260 V170 a40 40 0 0 1 40 -40 H95 a40 40 0 0 1 40 40 V260 Z" />
        <path d="M865 260 V170 a40 40 0 0 1 40 -40 H945 a40 40 0 0 1 40 40 V260 Z" />
        <path
          d="M45 150 v24 M75 150 v24 M105 150 v24 M895 150 v24 M925 150 v24 M955 150 v24"
          className="fill-none stroke-white/30"
          strokeWidth="4"
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
