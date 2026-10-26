import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import PixelSprite from '@/components/ui/PixelSprite';
import { PET_FRAMES, type PetPose } from '@/lib/petCat';

const SPEED = 70; // px per second
const SCALE = 4;

/** Pixel cat that wanders along the bottom of the screen, naps, and meows when clicked. */
export default function DesktopPet() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLButtonElement>(null);
  const [pose, setPose] = useState<PetPose>('sit');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [step, setStep] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    gsap.set(wrap, { x: 24 });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: number;
    let tween: gsap.core.Tween | undefined;

    const wander = () => {
      const from = Number(gsap.getProperty(wrap, 'x'));
      const to = gsap.utils.random(16, Math.max(32, window.innerWidth - 100), 1);
      setFacing(to > from ? 1 : -1);
      setWalking(true);
      tween = gsap.to(wrap, {
        x: to,
        duration: Math.abs(to - from) / SPEED,
        ease: 'none',
        onComplete: () => {
          setWalking(false);
          setPose('sit');
          timer = window.setTimeout(wander, gsap.utils.random(2500, 6000));
        },
      });
    };

    timer = window.setTimeout(wander, 1800);
    return () => {
      window.clearTimeout(timer);
      tween?.kill();
    };
  }, []);

  // Alternate the two walk frames while moving
  useEffect(() => {
    if (!walking) return;
    const id = window.setInterval(() => setStep((s) => !s), 200);
    return () => window.clearInterval(id);
  }, [walking]);

  const meow = () => {
    setBubble(true);
    window.setTimeout(() => setBubble(false), 1300);
    if (bodyRef.current) {
      gsap.fromTo(bodyRef.current, { y: 0 }, { y: -22, yoyo: true, repeat: 1, duration: 0.15, ease: 'steps(3)' });
    }
  };

  const frame: PetPose = walking ? (step ? 'walkA' : 'walkB') : pose;

  return (
    <div ref={wrapRef} className="fixed bottom-0 left-0 z-[55] pointer-events-none">
      {bubble && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 b3 bg-beige-light text-ink border-2 border-ink px-2 whitespace-nowrap">
          mrrp!
        </span>
      )}
      <button
        ref={bodyRef}
        type="button"
        aria-label="Pet the cat"
        onClick={meow}
        className={`pointer-events-auto cursor-pointer block ${facing === -1 ? '-scale-x-100' : ''}`}
      >
        <PixelSprite grid={PET_FRAMES[frame]} scale={SCALE} />
      </button>
    </div>
  );
}
