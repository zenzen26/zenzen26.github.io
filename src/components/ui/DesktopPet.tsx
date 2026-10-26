import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { gsap } from 'gsap';
import { CAT_EVENT } from '@/lib/catEvent';

const SPEED = 60; // px per second along the floor
const CRAWL_SPEED = 45; // px per second up or down a screen edge
const SIZE = 88; // px; the 40×40 header icon drawn at 2.2×
const REST_BOTTOM = 4; // px above the viewport bottom
const MENU_BAR = 70; // keep wall-crawling below the menu bar
const GRAVITY = 2200; // px / s²
const HARD_FALL = 160; // px; drops higher than this hurt
const DRAG_THRESHOLD = 4; // px before a press counts as a drag
const ANGRY_CLICKS = 4; // this many clicks...
const ANGRY_WINDOW = 2000; // ...within this many ms make it angry
const RUN_AWAY_SPEED = 260; // px per second when it storms off
const DIZZY_DISTANCE = 1500; // px of swinging around while held before it gets dizzy

type Mode = 'sit' | 'walk' | 'crawl' | 'held' | 'fall' | 'hurt' | 'angry' | 'dizzy';
type Wall = 'left' | 'right';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The header's calico cat as a desktop pet: waddles along the bottom facing the way it is
 * heading, sometimes crawls up the side of the screen, can be picked up and dropped
 * (soft landing from low, a "mew! >^<" from high, dizzy if swung around), meows when clicked,
 * and gets angry if spam-clicked.
 */
export default function DesktopPet() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLButtonElement>(null);
  const tween = useRef<gsap.core.Animation | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);
  const wanderRef = useRef<() => void>(() => {});
  const grab = useRef({ x: 0, y: 0, moved: false });
  const clicks = useRef<number[]>([]);
  const swing = useRef({ dist: 0, x: 0, y: 0, dizzy: false });
  const [mode, setMode] = useState<Mode>('sit');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [step, setStep] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);

  const say = (text: string, ms = 1300) => {
    setBubble(text);
    window.setTimeout(() => setBubble(null), ms);
  };

  const settle = () => {
    setMode('sit');
    if (!prefersReducedMotion()) {
      timer.current = window.setTimeout(() => wanderRef.current(), gsap.utils.random(2500, 6000));
    }
  };

  /** Walk to the screen edge, turn onto the wall, crawl up, look around, crawl back down. */
  const climb = (wrap: HTMLDivElement, side: Wall) => {
    const from = Number(gsap.getProperty(wrap, 'x'));
    const wall = side === 'left' ? 0 : window.innerWidth - SIZE;
    const maxUp = Math.max(120, window.innerHeight - SIZE - MENU_BAR);
    const up = gsap.utils.random(maxUp * 0.4, maxUp);
    // facing is the cat's head direction in its own frame; after the wall rotation
    // "left" points up on the left wall and "right" points up on the right wall.
    const headUp: 1 | -1 = side === 'left' ? -1 : 1;

    setFacing(wall > from ? 1 : -1);
    setMode('walk');
    tween.current = gsap
      .timeline({ onComplete: settle })
      .to(wrap, { x: wall, duration: Math.abs(wall - from) / SPEED, ease: 'none' })
      .add(() => { setMode('crawl'); setFacing(headUp); })
      .to(wrap, { rotation: side === 'left' ? 90 : -90, duration: 0.35, ease: 'power2.out' })
      .to(wrap, { y: -up, duration: up / CRAWL_SPEED, ease: 'none' })
      .add(() => { setMode('sit'); say('mrrp!'); })
      .to({}, { duration: 1.4 })
      .add(() => { setMode('crawl'); setFacing(-headUp as 1 | -1); })
      .to(wrap, { y: 0, duration: up / CRAWL_SPEED, ease: 'none' })
      .to(wrap, { rotation: 0, duration: 0.35, ease: 'power2.out' });
  };

  // Walk to a random spot (or up a wall), always facing the way it is heading (no moonwalking).
  wanderRef.current = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (Math.random() < 0.3) {
      climb(wrap, Math.random() < 0.5 ? 'left' : 'right');
      return;
    }
    const from = Number(gsap.getProperty(wrap, 'x'));
    const to = gsap.utils.random(16, Math.max(32, window.innerWidth - SIZE - 16), 1);
    setFacing(to > from ? 1 : -1);
    setMode('walk');
    tween.current = gsap.to(wrap, { x: to, duration: Math.abs(to - from) / SPEED, ease: 'none', onComplete: settle });
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    gsap.set(wrap, { x: 24, y: 0, rotation: 0 });
    if (!prefersReducedMotion()) timer.current = window.setTimeout(() => wanderRef.current(), 1800);
    return () => {
      window.clearTimeout(timer.current);
      tween.current?.kill();
    };
  }, []);

  // Waddle: tilt side to side with a little hop while walking or crawling
  useEffect(() => {
    if (mode !== 'walk' && mode !== 'crawl' && mode !== 'dizzy') return;
    const id = window.setInterval(() => setStep((s) => !s), mode === 'dizzy' ? 160 : 200);
    return () => window.clearInterval(id);
  }, [mode]);

  const meow = (text = 'mrrp!') => {
    say(text);
    if (hopRef.current) {
      gsap.fromTo(hopRef.current, { y: 0 }, { y: -22, yoyo: true, repeat: 1, duration: 0.15, ease: 'steps(3)', clearProps: 'transform' });
    }
  };

  // The Mac's `cat` command makes the pet say hi too.
  useEffect(() => {
    const hi = () => meow();
    window.addEventListener(CAT_EVENT, hi);
    return () => window.removeEventListener(CAT_EVENT, hi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Too many clicks: shake, hiss, then storm off to the far side of the screen. */
  const getAngry = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    clicks.current = [];
    setMode('angry');
    say('>:(  hiss!', 2200);
    if (hopRef.current) {
      gsap.fromTo(hopRef.current, { x: -4 }, { x: 4, yoyo: true, repeat: 15, duration: 0.05, ease: 'none', clearProps: 'transform' });
    }
    timer.current = window.setTimeout(() => {
      const from = Number(gsap.getProperty(wrap, 'x'));
      const to = from > window.innerWidth / 2 ? 16 : window.innerWidth - SIZE - 16;
      setFacing(to > from ? 1 : -1);
      setMode('walk');
      tween.current = gsap.to(wrap, { x: to, duration: Math.abs(to - from) / RUN_AWAY_SPEED, ease: 'none', onComplete: settle });
    }, 2300);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (mode === 'angry') return; // not in the mood to be touched
    window.clearTimeout(timer.current);
    tween.current?.kill();
    grab.current = { x: e.clientX, y: e.clientY, moved: false };
    swing.current = { dist: 0, x: e.clientX, y: e.clientY, dizzy: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    if (!wrap || mode === 'angry' || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    if (!grab.current.moved && Math.hypot(e.clientX - grab.current.x, e.clientY - grab.current.y) < DRAG_THRESHOLD) return;
    if (!grab.current.moved) gsap.to(wrap, { rotation: 0, duration: 0.2 }); // let go of the wall
    grab.current.moved = true;
    setMode('held');
    const sw = swing.current;
    sw.dist += Math.hypot(e.clientX - sw.x, e.clientY - sw.y);
    sw.x = e.clientX;
    sw.y = e.clientY;
    if (!sw.dizzy && sw.dist > DIZZY_DISTANCE) {
      sw.dizzy = true;
      say('@_@', 1800);
    }
    const restTop = window.innerHeight - REST_BOTTOM - SIZE;
    gsap.set(wrap, {
      x: Math.min(Math.max(e.clientX - SIZE / 2, 0), window.innerWidth - SIZE),
      y: Math.min(e.clientY - restTop - 8, 0), // held by the scruff, never below the floor
    });
  };

  /** Swung around too much: stumble about for a few seconds, then recover. */
  const daze = () => {
    swing.current.dizzy = false;
    setMode('dizzy');
    say('@_@', 3000);
    timer.current = window.setTimeout(settle, 3200);
  };

  const land = (hard: boolean) => {
    const btn = hopRef.current;
    if (hard) {
      // ouch: mew, big squash, a dazed moment before getting up
      say('mew! >^<', 1500);
      setMode('hurt');
      if (btn) gsap.fromTo(btn, { scaleY: 0.55, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, ease: 'bounce.out', clearProps: 'transform,transformOrigin' });
      timer.current = window.setTimeout(swing.current.dizzy ? daze : settle, 1300);
    } else {
      // landed on its paws: a soft little squash
      if (btn) gsap.fromTo(btn, { scaleY: 0.9, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.3, ease: 'power2.out', clearProps: 'transform,transformOrigin' });
      if (swing.current.dizzy) daze();
      else settle();
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    if (!wrap || mode === 'angry') return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!grab.current.moved) {
      const now = performance.now();
      clicks.current = [...clicks.current.filter((t) => now - t < ANGRY_WINDOW), now];
      if (clicks.current.length >= ANGRY_CLICKS) {
        getAngry();
        return;
      }
      meow();
      settle();
      return;
    }
    const height = -Number(gsap.getProperty(wrap, 'y'));
    if (height < 2 || prefersReducedMotion()) {
      gsap.set(wrap, { y: 0 });
      if (swing.current.dizzy) daze();
      else settle();
      return;
    }
    const hard = height > HARD_FALL;
    const freeFall = Math.sqrt((2 * height) / GRAVITY);
    setMode('fall');
    tween.current = gsap.to(wrap, {
      y: 0,
      // a short drop is a slow, floaty one; a long drop is real gravity
      duration: hard ? freeFall : Math.max(0.55, freeFall * 2.4),
      ease: hard ? 'power2.in' : 'sine.inOut',
      onComplete: () => land(hard),
    });
  };

  // Tilt and hop live on an inner wrapper so GSAP (which owns the button transform) never fights them.
  const motion =
    mode === 'walk' || mode === 'crawl'
      ? step ? 'rotate-3 -translate-y-1' : '-rotate-3'
      : mode === 'held'
        ? '-rotate-12'
        : mode === 'dizzy'
          ? (step ? 'rotate-12' : '-rotate-12')
          : mode === 'hurt'
          ? 'rotate-6'
          : mode === 'angry'
            ? '[filter:saturate(2.5)_hue-rotate(-30deg)_brightness(0.9)]'
            : '';

  return (
    <div ref={wrapRef} className="fixed left-0 z-[55] pointer-events-none" style={{ bottom: REST_BOTTOM }}>
      {bubble && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 b3 bg-beige-light text-ink border-2 border-ink px-2 whitespace-nowrap">
          {bubble}
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
