import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import PixelSprite from '@/components/ui/PixelSprite';
import { PET_FRAMES, type PetPose } from '@/lib/petCat';

const SPEED = 60; // px per second
const SCALE = 4;

/** Chubby side-view calico that waddles along the bottom of the screen, blinks, and meows when clicked. */
export default function DesktopPet() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLButtonElement>(null);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [step, setStep] = useState(false);
  const [blink, setBlink] = useState(false);
  const [bubble, setBubble] = useState(false);

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

  // Alternate the walk frames (and a little hop) while moving
  useEffect(() => {
    if (!walking) return;
    const id = window.setInterval(() => setStep((s) => !s), 220);
    return () => window.clearInterval(id);
  }, [walking]);

  // Blink now and then while sitting
  useEffect(() => {
    if (walking) return;
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 180);
    }, 2600);
    return () => window.clearInterval(id);
  }, [walking]);

  const meow = () => {
    setBubble(true);
    window.setTimeout(() => setBubble(false), 1300);
    if (bodyRef.current) {
      gsap.fromTo(bodyRef.current, { y: 0 }, { y: -22, yoyo: true, repeat: 1, duration: 0.15, ease: 'steps(3)' });
    }
  };

  const pose: PetPose = walking ? (step ? 'walkA' : 'walkB') : blink ? 'blink' : 'idle';

  return (
    <div ref={wrapRef} className="fixed bottom-1 left-0 z-[55] pointer-events-none">
      {bubble && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 b3 bg-beige-light text-ink border-2 border-ink px-2 whitespace-nowrap">
          mrrp!
        </span>
      )}
      <button
        ref={bodyRef}
        type="button"
        aria-label="Pet the calico cat"
        onClick={meow}
        className={`pointer-events-auto cursor-pointer block ${facing === -1 ? '-scale-x-100' : ''} ${walking && step ? '-translate-y-1' : ''}`}
      >
        <PixelSprite grid={PET_FRAMES[pose]} scale={SCALE} className="pixel-outline" />
      </button>
    </div>
  );
}
