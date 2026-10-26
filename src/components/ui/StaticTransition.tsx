import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const W = 192;
const H = 108;

/**
 * Old-Macintosh "no signal" TV static: a CRT-style sweep of noise that plays on first
 * load and on every route change (inner component is keyed by pathname). The sweep itself
 * is the `static-sweep` CSS animation in global.css; this only paints the noise.
 */
function StaticRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

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
    return () => window.clearInterval(id);
  }, [playing]);

  if (!playing) return null;

  return (
    <div
      aria-hidden="true"
      onAnimationEnd={() => setPlaying(false)}
      className="animate-static-sweep fixed inset-0 z-[100] pointer-events-none bg-black"
    >
      <canvas ref={canvasRef} width={W} height={H} className="size-full [image-rendering:pixelated]" />
      <div className="absolute inset-0 crt opacity-30" />
    </div>
  );
}

export default function StaticTransition() {
  const { pathname } = useLocation();
  return <StaticRun key={pathname} />;
}
