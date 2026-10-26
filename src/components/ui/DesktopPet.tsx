import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { gsap } from 'gsap';
import { CAT_EVENT, JOY_EVENT } from '@/lib/catEvent';

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
const SULK_MS = 9000; // how long it sulks in its corner after being angry
const PURR_AFTER_MS = 900; // hover (or press and hold) this long and it starts to purr
const RANDOM_JOY = 0.1; // chance of a happy hop after finishing a walk

type Mode = 'sit' | 'walk' | 'crawl' | 'held' | 'fall' | 'hurt' | 'angry' | 'dizzy' | 'sulk' | 'purr' | 'joy';
type Wall = 'left' | 'right';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Dizzy cat: the icon redrawn at a very coarse resolution with sideways slice glitches
 * and colour tearing, like a corrupted sprite.
 */
function GlitchCat() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const N = canvas.width; // coarse on purpose: ~20 big pixels
    const img = new Image();
    img.src = '/favicon.png';
    let id = 0;

    const draw = () => {
      ctx.clearRect(0, 0, N, N);
      ctx.drawImage(img, 0, 0, N, N);
      for (let i = 0; i < 4; i++) {
        const y = Math.floor(Math.random() * N);
        const h = 1 + Math.floor(Math.random() * 3);
        const dx = Math.floor(Math.random() * 7) - 3;
        const slice = ctx.getImageData(0, y, N, h);
        ctx.clearRect(0, y, N, h);
        ctx.putImageData(slice, dx, y);
      }
      canvas.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg) saturate(${1 + Math.random() * 2})`;
    };

    const start = () => {
      draw();
      if (!prefersReducedMotion()) id = window.setInterval(draw, 90);
    };
    if (img.complete) start();
    else img.onload = start;
    return () => window.clearInterval(id);
  }, []);

  return <canvas ref={ref} width={20} height={20} className="size-22 translate-y-3 [image-rendering:pixelated]" />;
}

/**
 * The header's calico cat as a desktop pet. It waddles along the bottom facing the way it is
 * heading, sometimes crawls up the side of the screen, and can be picked up and dropped
 * (soft landing from low, "mew! >^<" from high, a glitchy dizzy spell if swung around).
 * Moods: meows when clicked, purrs when you hover or hold, hops for joy (resume downloads,
 * login, now and then), gets angry if spam-clicked and then sulks in a corner.
 */
export default function DesktopPet() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLButtonElement>(null);
  const tween = useRef<gsap.core.Animation | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);
  const holdTimer = useRef<number | undefined>(undefined);
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
    window.setTimeout(() => setBubble((b) => (b === text ? null : b)), ms);
  };

  /** Back to sitting; after a while it wanders off again. `canCelebrate` lets it do a happy hop first. */
  const settle = (canCelebrate = false) => {
    if (canCelebrate && !prefersReducedMotion() && Math.random() < RANDOM_JOY) {
      joy();
      return;
    }
    setMode('sit');
    if (!prefersReducedMotion()) {
      timer.current = window.setTimeout(() => wanderRef.current(), gsap.utils.random(2500, 6000));
    }
  };

  /** Three happy hops. */
  const joy = () => {
    const btn = hopRef.current;
    window.clearTimeout(timer.current);
    tween.current?.kill();
    setMode('joy');
    say('yay! \\(^o^)/', 2000);
    if (!btn || prefersReducedMotion()) {
      timer.current = window.setTimeout(() => settle(), 1200);
      return;
    }
    const hop = { y: -38, duration: 0.2, ease: 'power2.out' };
    tween.current = gsap
      .timeline({ onComplete: () => { gsap.set(btn, { clearProps: 'transform' }); settle(); } })
      .to(btn, hop).to(btn, { y: 0, duration: 0.2, ease: 'power2.in' })
      .to(btn, hop).to(btn, { y: 0, duration: 0.2, ease: 'power2.in' })
      .to(btn, { ...hop, y: -52 }).to(btn, { y: 0, duration: 0.26, ease: 'power2.in' });
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
      .timeline({ onComplete: () => settle() })
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
    tween.current = gsap.to(wrap, { x: to, duration: Math.abs(to - from) / SPEED, ease: 'none', onComplete: () => settle(true) });
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    gsap.set(wrap, { x: 24, y: 0, rotation: 0 });
    if (!prefersReducedMotion()) timer.current = window.setTimeout(() => wanderRef.current(), 1800);
    return () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(holdTimer.current);
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

  // The Mac's `cat` command says hi; resume downloads and `login` make it jump for joy.
  useEffect(() => {
    const hi = () => meow();
    const cheer = () => joy();
    window.addEventListener(CAT_EVENT, hi);
    window.addEventListener(JOY_EVENT, cheer);
    return () => {
      window.removeEventListener(CAT_EVENT, hi);
      window.removeEventListener(JOY_EVENT, cheer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Hover or hold still on the cat: it settles down and purrs until you stop. */
  const startPurr = () => {
    window.clearTimeout(timer.current);
    tween.current?.kill();
    setMode('purr');
    setBubble('purrr~ ♥');
  };

  const stopPurr = () => {
    setBubble(null);
    settle();
  };

  /** Too many clicks: shake, hiss, storm off to a corner and sulk there. */
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
      tween.current = gsap.to(wrap, {
        x: to,
        duration: Math.abs(to - from) / RUN_AWAY_SPEED,
        ease: 'none',
        onComplete: sulk,
      });
    }, 2300);
  };

  /** Faces the corner it ran to, goes grey and silent, and ignores you for a while. */
  const sulk = () => {
    setMode('sulk');
    setBubble('. . .');
    timer.current = window.setTimeout(() => {
      setBubble(null);
      settle();
    }, SULK_MS);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (mode === 'angry') return; // not in the mood to be touched
    if (mode === 'sulk') {
      say('hmph!', 1200);
      return;
    }
    window.clearTimeout(timer.current);
    tween.current?.kill();
    grab.current = { x: e.clientX, y: e.clientY, moved: false };
    swing.current = { dist: 0, x: e.clientX, y: e.clientY, dizzy: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    // press and hold without moving: purr (this is how touch screens pet it)
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      if (!grab.current.moved) startPurr();
    }, PURR_AFTER_MS);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    if (!wrap || mode === 'angry' || mode === 'sulk' || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    if (!grab.current.moved && Math.hypot(e.clientX - grab.current.x, e.clientY - grab.current.y) < DRAG_THRESHOLD) return;
    window.clearTimeout(holdTimer.current);
    if (!grab.current.moved) gsap.to(wrap, { rotation: 0, duration: 0.2 }); // let go of the wall
    grab.current.moved = true;
    setBubble((b) => (b === 'purrr~ ♥' ? null : b));
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

  /** Swung around too much: glitch out for a few seconds, then recover. */
  const daze = () => {
    swing.current.dizzy = false;
    setMode('dizzy');
    say('@_@', 3000);
    timer.current = window.setTimeout(() => settle(), 3200);
  };

  const land = (hard: boolean) => {
    const btn = hopRef.current;
    if (hard) {
      // ouch: mew, big squash, a dazed moment before getting up
      say('mew! >^<', 1500);
      setMode('hurt');
      if (btn) gsap.fromTo(btn, { scaleY: 0.55, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, ease: 'bounce.out', clearProps: 'transform,transformOrigin' });
      timer.current = window.setTimeout(swing.current.dizzy ? daze : () => settle(), 1300);
    } else {
      // landed on its paws: a soft little squash
      if (btn) gsap.fromTo(btn, { scaleY: 0.9, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.3, ease: 'power2.out', clearProps: 'transform,transformOrigin' });
      if (swing.current.dizzy) daze();
      else settle();
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    if (!wrap || mode === 'angry' || mode === 'sulk') return;
    window.clearTimeout(holdTimer.current);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!grab.current.moved) {
      if (mode === 'purr') {
        stopPurr(); // it was being stroked, not clicked
        return;
      }
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

  const onPointerEnter = () => {
    if (mode !== 'sit') return;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(startPurr, PURR_AFTER_MS);
  };

  const onPointerLeave = () => {
    window.clearTimeout(holdTimer.current);
    if (mode === 'purr') stopPurr();
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
              : mode === 'sulk'
                ? '[filter:grayscale(0.7)_brightness(0.75)] translate-y-1'
                : mode === 'purr'
                  ? 'animate-purr'
                  : '';

  return (
    <div ref={wrapRef} className="fixed left-0 z-[55] pointer-events-none" style={{ bottom: REST_BOTTOM }}>
      {bubble && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 b3 bg-beige-light text-ink border-2 border-ink px-2 whitespace-nowrap">
          {bubble}
        </span>
      )}
      {mode === 'purr' && (
        <>
          <span aria-hidden="true" className="animate-heart absolute left-1/4 top-0 text-white">♥</span>
          <span aria-hidden="true" className="animate-heart absolute right-1/4 top-2 text-white [animation-delay:0.6s]">♥</span>
        </>
      )}
      {/* soft floor shadow so the cat never disappears into whatever is behind it */}
      <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-black/40 blur-[2px]" />
      <button
        ref={hopRef}
        type="button"
        aria-label="Pet the calico cat (drag to pick it up)"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={`relative pointer-events-auto touch-none select-none block ${mode === 'held' ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className={`origin-bottom transition-transform duration-200 ${facing === -1 ? '-scale-x-100' : ''} ${motion}`}>
          {mode === 'dizzy' ? (
            <GlitchCat />
          ) : (
            // the icon's art sits above a transparent margin; pull it down so the paws touch the floor
            <img
              src="/favicon.png"
              alt=""
              draggable={false}
              width={SIZE}
              height={SIZE}
              className="translate-y-3 [image-rendering:pixelated]"
            />
          )}
        </div>
      </button>
    </div>
  );
}
