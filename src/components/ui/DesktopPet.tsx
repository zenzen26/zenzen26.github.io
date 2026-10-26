import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { gsap } from 'gsap';
import { CAT_EVENT } from '@/lib/catEvent';

const SPEED = 60; // px per second
const SIZE = 88; // px; the 40×40 header icon drawn at 2.2×
const REST_BOTTOM = 4; // px above the viewport bottom
const GRAVITY = 2200; // px / s²
const DRAG_THRESHOLD = 4; // px before a press counts as a drag

type Mode = 'sit' | 'walk' | 'held' | 'fall';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The header's calico cat, as a desktop pet: waddles along the bottom facing the way it is
 * heading, can be picked up and dropped, and meows when clicked.
 */
export default function DesktopPet() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLButtonElement>(null);
  const tween = useRef<gsap.core.Tween | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);
  const wanderRef = useRef<() => void>(() => {});
  const grab = useRef({ x: 0, y: 0, moved: false });
  const [mode, setMode] = useState<Mode>('sit');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [step, setStep] = useState(false);
  const [bubble, setBubble] = useState(false);

  const settle = () => {
    setMode('sit');
    if (!prefersReducedMotion()) {
      timer.current = window.setTimeout(() => wanderRef.current(), gsap.utils.random(2500, 6000));
    }
  };

  // Walk to a random spot, always facing the way it is heading (no moonwalking).
  wanderRef.current = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const from = Number(gsap.getProperty(wrap, 'x'));
    const to = gsap.utils.random(16, Math.max(32, window.innerWidth - SIZE - 16), 1);
    setFacing(to > from ? 1 : -1);
    setMode('walk');
    tween.current = gsap.to(wrap, { x: to, duration: Math.abs(to - from) / SPEED, ease: 'none', onComplete: settle });
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    gsap.set(wrap, { x: 24, y: 0 });
    if (!prefersReducedMotion()) timer.current = window.setTimeout(() => wanderRef.current(), 1800);
    return () => {
      window.clearTimeout(timer.current);
      tween.current?.kill();
    };
  }, []);

  // Waddle: tilt side to side with a little hop while walking
  useEffect(() => {
    if (mode !== 'walk') return;
    const id = window.setInterval(() => setStep((s) => !s), 200);
    return () => window.clearInterval(id);
  }, [mode]);

  const meow = () => {
    setBubble(true);
    window.setTimeout(() => setBubble(false), 1300);
    if (hopRef.current) {
      gsap.fromTo(hopRef.current, { y: 0 }, { y: -22, yoyo: true, repeat: 1, duration: 0.15, ease: 'steps(3)', clearProps: 'transform' });
    }
  };

  // The Mac's `cat` command makes the pet say hi too.
  useEffect(() => {
    window.addEventListener(CAT_EVENT, meow);
    return () => window.removeEventListener(CAT_EVENT, meow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    window.clearTimeout(timer.current);
    tween.current?.kill();
    grab.current = { x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    if (!wrap || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    if (!grab.current.moved && Math.hypot(e.clientX - grab.current.x, e.clientY - grab.current.y) < DRAG_THRESHOLD) return;
    grab.current.moved = true;
    setMode('held');
    const restTop = window.innerHeight - REST_BOTTOM - SIZE;
    gsap.set(wrap, {
      x: Math.min(Math.max(e.clientX - SIZE / 2, 0), window.innerWidth - SIZE),
      y: Math.min(e.clientY - restTop - 8, 0), // held by the scruff, never below the floor
    });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!grab.current.moved) {
      meow();
      settle();
      return;
    }
    const height = -Number(gsap.getProperty(wrap, 'y'));
    if (height < 2 || prefersReducedMotion()) {
      gsap.set(wrap, { y: 0 });
      settle();
      return;
    }
    // Drop with gravity, then a little squash on landing
    setMode('fall');
    gsap.to(wrap, {
      y: 0,
      duration: Math.sqrt((2 * height) / GRAVITY),
      ease: 'power2.in',
      onComplete: () => {
        if (hopRef.current) {
          gsap.fromTo(hopRef.current, { scaleY: 0.7, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.25, ease: 'bounce.out', clearProps: 'transform,transformOrigin' });
        }
        settle();
      },
    });
  };

  // Tilt and hop live on an inner wrapper so GSAP (which owns the button transform) never fights them.
  const motion =
    mode === 'walk'
      ? `${step ? 'rotate-3 -translate-y-1' : '-rotate-3'}`
      : mode === 'held' || mode === 'fall'
        ? '-rotate-12'
        : '';

  return (
    <div ref={wrapRef} className="fixed left-0 z-[55] pointer-events-none" style={{ bottom: REST_BOTTOM }}>
      {bubble && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 b3 bg-beige-light text-ink border-2 border-ink px-2 whitespace-nowrap">
          mrrp!
        </span>
      )}
      <button
        ref={hopRef}
        type="button"
        aria-label="Pet the calico cat (drag to pick it up)"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`pointer-events-auto touch-none select-none block ${mode === 'held' ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className={`origin-bottom transition-transform duration-200 ${facing === -1 ? '-scale-x-100' : ''} ${motion}`}>
          {/* the icon's art sits above a transparent margin; pull it down so the paws touch the floor */}
          <img
            src="/favicon.png"
            alt=""
            draggable={false}
            width={SIZE}
            height={SIZE}
            className="translate-y-3 [image-rendering:pixelated]"
          />
        </div>
      </button>
    </div>
  );
}
