import { useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import { CanvasTexture, NearestFilter, type Group } from 'three';
import { gsap } from 'gsap';
import PixelCat from '@/components/ui/PixelCat';
import { PIXEL_CAT_GRID, themeColor } from '@/lib/pixelCat';

/** Drag limit in radians: ±95° ≈ 190° of travel on each axis. */
const DRAG_LIMIT = (95 * Math.PI) / 180;
/** Resting poses snap to 45° steps, never past 90° (side / top / bottom views). */
const SNAP_STEP = Math.PI / 4;
const SNAP_LIMIT = Math.PI / 2;
const IDLE_RETURN_MS = 5000;

interface Rotation { x: number; y: number }

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
const snap = (v: number) => clamp(Math.round(v / SNAP_STEP) * SNAP_STEP, SNAP_LIMIT);

/** Draws the Mac's CRT: boot title, a pixel-cat "icon window", and a blinking prompt. */
function drawScreen(ctx: CanvasRenderingContext2D, cursorOn: boolean) {
  const W = 320;
  const H = 240;
  const forest = themeColor('forest');
  const phosphor = themeColor('phosphor');
  const ink = themeColor('ink');
  const light = themeColor('beige-light');
  const catColors: Record<string, string> = { '#': ink, g: phosphor, p: themeColor('grey'), w: '#ffffff' };

  ctx.fillStyle = forest;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = phosphor;
  ctx.font = '22px "Pixelify Sans", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ZEN OS 1.0', W / 2, 34);

  // icon window with the cat
  const s = 7;
  const cw = PIXEL_CAT_GRID[0].length * s;
  const ch = PIXEL_CAT_GRID.length * s;
  const wx = (W - cw) / 2 - 14;
  const wy = 52;
  ctx.fillStyle = light;
  ctx.fillRect(wx, wy, cw + 28, ch + 28);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(wx, wy, cw + 28, ch + 28);
  PIXEL_CAT_GRID.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (!catColors[c]) return;
      ctx.fillStyle = catColors[c];
      ctx.fillRect(wx + 14 + x * s, wy + 14 + y * s, s, s);
    })
  );

  ctx.fillStyle = phosphor;
  ctx.font = '22px "VT323", monospace';
  ctx.fillText(`hello, i'm zenzen${cursorOn ? '_' : ' '}`, W / 2, H - 28);

  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

function useScreenTexture() {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 240;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new CanvasTexture(canvas);
    t.magFilter = NearestFilter;
    t.minFilter = NearestFilter;
    return t;
  }, [canvas]);

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let on = true;
    const redraw = () => {
      drawScreen(ctx, on);
      texture.needsUpdate = true;
    };
    // Fonts must be ready before the first draw, otherwise canvas falls back to monospace.
    Promise.all([
      document.fonts.load('22px "Pixelify Sans"'),
      document.fonts.load('22px "VT323"'),
    ]).finally(redraw);
    const id = window.setInterval(() => { on = !on; redraw(); }, 600);
    return () => window.clearInterval(id);
  }, [canvas, texture]);

  return texture;
}

function MacModel() {
  const screen = useScreenTexture();
  const beige = themeColor('beige');
  const shade = themeColor('grey');
  const ink = themeColor('ink');

  return (
    <group>
      {/* main case + rear hump, like the 128K silhouette */}
      <RoundedBox args={[2, 2.8, 2.1]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color={beige} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[1.6, 2.2, 0.9]} radius={0.1} smoothness={4} position={[0, 0.2, -1.4]}>
        <meshStandardMaterial color={beige} roughness={0.75} />
      </RoundedBox>

      {/* screen bezel + CRT */}
      <RoundedBox args={[1.5, 1.2, 0.08]} radius={0.05} position={[0, 0.5, 1.07]}>
        <meshStandardMaterial color={shade} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.5, 1.115]}>
        <planeGeometry args={[1.3, 0.975]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>

      {/* floppy slot + drive face + logo */}
      <mesh position={[0, -0.55, 1.06]}>
        <boxGeometry args={[1.5, 0.5, 0.04]} />
        <meshStandardMaterial color={shade} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.5, 1.09]}>
        <boxGeometry args={[0.75, 0.05, 0.03]} />
        <meshStandardMaterial color={ink} />
      </mesh>
      <mesh position={[0.55, -0.7, 1.09]}>
        <boxGeometry args={[0.12, 0.12, 0.03]} />
        <meshStandardMaterial color={ink} />
      </mesh>

      {/* keyboard + mouse */}
      <RoundedBox args={[2.4, 0.14, 0.85]} radius={0.04} position={[0, -1.43, 2.1]}>
        <meshStandardMaterial color={beige} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, -1.35, 2.1]}>
        <boxGeometry args={[2.0, 0.04, 0.55]} />
        <meshStandardMaterial color={ink} roughness={0.8} />
      </mesh>
      <RoundedBox args={[0.3, 0.1, 0.46]} radius={0.04} position={[1.7, -1.45, 2.1]}>
        <meshStandardMaterial color={beige} roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function Rig({ rot, dragging }: { rot: MutableRefObject<Rotation>; dragging: MutableRefObject<boolean> }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.set(rot.current.x, rot.current.y, 0);
    group.current.position.y = dragging.current ? 0 : Math.sin(clock.elapsedTime * 1.4) * 0.05;
  });
  return (
    <group ref={group}>
      <MacModel />
    </group>
  );
}

const hasWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch {
    return false;
  }
};

/** Draggable 3D Macintosh: rotates up to ~190° per axis, snaps to 45° poses on release. */
export default function Mac3D({ className = '' }: { className?: string }) {
  const rot = useRef<Rotation>({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<number | undefined>(undefined);
  const [webgl] = useState(hasWebGL);

  useEffect(() => () => { window.clearTimeout(idleTimer.current); gsap.killTweensOf(rot.current); }, []);

  const settle = (x: number, y: number, duration: number) =>
    gsap.to(rot.current, { x, y, duration, ease: 'back.out(1.6)', overwrite: true });

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    window.clearTimeout(idleTimer.current);
    gsap.killTweensOf(rot.current);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    rot.current.y = clamp(rot.current.y + dx * 0.012, DRAG_LIMIT);
    // Touch keeps vertical gestures for page scroll, so only mouse/pen tilts on X.
    if (e.pointerType !== 'touch') rot.current.x = clamp(rot.current.x + dy * 0.012, DRAG_LIMIT);
  };

  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    settle(snap(rot.current.x), snap(rot.current.y), 0.6);
    idleTimer.current = window.setTimeout(() => settle(0, 0, 0.9), IDLE_RETURN_MS);
  };

  if (!webgl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <PixelCat scale={14} />
      </div>
    );
  }

  return (
    <div
      className={`relative cursor-grab active:cursor-grabbing select-none touch-pan-y md:touch-none ${className}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label="Interactive 3D Macintosh. Drag to rotate."
    >
      <Canvas camera={{ position: [0, 0.6, 10.5], fov: 32 }} dpr={[1, 1.75]} className="!absolute inset-y-0 -inset-x-[35%] !w-auto pointer-events-none">
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 5]} intensity={2} />
        <directionalLight position={[-5, 2, -3]} intensity={0.6} />
        <Rig rot={rot} dragging={dragging} />
        <ContactShadows position={[0, -1.9, 0]} opacity={0.35} scale={9} blur={2.5} far={4} />
      </Canvas>
      <p className="b3 absolute bottom-0 inset-x-0 text-center text-ink/60 pointer-events-none">
        <span className="cursor-blink">▮</span> drag to rotate
      </p>
    </div>
  );
}
