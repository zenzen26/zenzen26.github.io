import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const W = 192;
const H = 108;

/**
 * Old-Macintosh "no signal" TV static: a CRT-style sweep of noise that plays on first
 * load and on every route change (inner component is keyed by pathname).
 */
function StaticRun() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const root = rootRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!root || !ctx) return;

    const img = ctx.createImageData(W, H);
    const draw = () => {
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = d[i + 1] = d[i + 2] = (Math.random() * 255) | 0;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    draw();
    const id = window.setInterval(draw, 60);

    const tl = gsap
      .timeline({ onComplete: () => setPlaying(false) })
      .fromTo(root, { scaleY: 0.01, opacity: 1 }, { scaleY: 1, duration: 0.18, ease: 'steps(4)' })
      .to({}, { duration: 0.35 })
      .to(root, { opacity: 0, duration: 0.3, ease: 'steps(5)' });

    return () => {
      window.clearInterval(id);
      tl.kill();
    };
  }, []);

  if (!playing) return null;

  return (
    <div ref={rootRef} aria-hidden="true" className="fixed inset-0 z-[100] pointer-events-none bg-black">
      <canvas ref={canvasRef} width={W} height={H} className="size-full [image-rendering:pixelated]" />
      <div className="absolute inset-0 crt opacity-30" />
    </div>
  );
}

export default function StaticTransition() {
  const { pathname } = useLocation();
  return <StaticRun key={pathname} />;
}
