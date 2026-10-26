import { useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, RoundedBox, useCursor } from '@react-three/drei';
import { CanvasTexture, CatmullRomCurve3, Color, NearestFilter, Vector3, type Group, type Mesh } from 'three';
import { gsap } from 'gsap';
import PixelCat from '@/components/ui/PixelCat';
import { PIXEL_CAT_GRID, themeColor } from '@/lib/pixelCat';

/** Rotation limit on each axis (±60°); resting poses snap to 30° steps. */
const LIMIT = (60 * Math.PI) / 180;
const SNAP_STEP = (30 * Math.PI) / 180;
const IDLE_RETURN_MS = 5000;
const BOOT_MS = 1600;
const BRIGHTNESS = [0.55, 0.8, 1];

const SCREEN_W = 800;
const SCREEN_H = 600;

interface Rotation { x: number; y: number }

/** Clickable regions painted on the screen, in canvas pixels. */
const SCREEN_BUTTONS = [
  { id: 'projects', label: 'VIEW PROJECTS', x: 40, y: 410, w: 300, h: 66, target: '#projects' },
  { id: 'contact', label: 'CONTACT ME', x: 360, y: 410, w: 250, h: 66, target: '#footer' },
] as const;

interface ScreenState {
  on: boolean;
  bootStart: number;
  typed: string;
  hover: string | null;
}

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
const snap = (v: number) => clamp(Math.round(v / SNAP_STEP) * SNAP_STEP, LIMIT);

/** Paints the CRT: boot log, then the hero content with clickable buttons and a typing prompt. */
function drawScreen(ctx: CanvasRenderingContext2D, s: ScreenState, cursorOn: boolean) {
  const forest = themeColor('forest');
  const phosphor = themeColor('phosphor');
  const ink = themeColor('ink');
  const light = themeColor('beige-light');
  const catColors: Record<string, string> = { '#': ink, g: phosphor, p: themeColor('grey'), w: '#ffffff' };
  const W = SCREEN_W;
  const H = SCREEN_H;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  if (!s.on) {
    ctx.fillStyle = '#050805';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(85,242,139,0.55)';
    ctx.font = '40px "VT323", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('screen off', W / 2, H / 2 - 10);
    ctx.fillText('press the POWER button below', W / 2, H / 2 + 36);
    return;
  }

  ctx.fillStyle = forest;
  ctx.fillRect(0, 0, W, H);

  const elapsed = performance.now() - s.bootStart;
  if (elapsed < BOOT_MS) {
    const lines = ['ZEN OS 1.0', 'checking memory.......OK', 'mounting portfolio....OK', 'feeding the cat.......OK', 'welcome.'];
    ctx.fillStyle = phosphor;
    ctx.font = '40px "VT323", monospace';
    const shown = Math.floor((elapsed / BOOT_MS) * (lines.length + 1));
    lines.slice(0, shown).forEach((line, i) => ctx.fillText(`> ${line}`, 40, 90 + i * 52));
  } else {
    // menu bar
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, W, 44);
    ctx.fillStyle = ink;
    ctx.fillRect(0, 44, W, 3);
    ctx.font = '30px "Pixelify Sans", monospace';
    ctx.fillText('File   Edit   View   Special', 20, 32);

    // pixel cat
    const s8 = 11;
    PIXEL_CAT_GRID.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (!catColors[c]) return;
        ctx.fillStyle = catColors[c];
        ctx.fillRect(610 + x * s8, 90 + y * s8, s8, s8);
      })
    );
    ctx.fillStyle = light;
    ctx.fillRect(606, 90 + PIXEL_CAT_GRID.length * s8 + 6, 14 * s8 + 8, 4);

    // status tag
    ctx.fillStyle = phosphor;
    ctx.fillRect(40, 78, 270, 40);
    ctx.fillStyle = ink;
    ctx.font = '30px "VT323", monospace';
    ctx.fillText('■ OPEN TO WORK', 54, 108);

    // title + role + blurb
    ctx.font = '700 118px "Pixelify Sans", monospace';
    ctx.fillStyle = light;
    ctx.fillText('ZEN', 40, 240);
    ctx.fillStyle = phosphor;
    ctx.fillText('ZEN', 40 + ctx.measureText('ZEN').width, 240);

    ctx.fillStyle = phosphor;
    ctx.font = '42px "VT323", monospace';
    ctx.fillText('Web Developer & Server Engineer', 40, 296);
    ctx.fillStyle = light;
    ctx.font = '32px "VT323", monospace';
    ctx.fillText('Full-stack web, servers and AI automation.', 40, 346);
    ctx.fillText('I build and ship reliable systems end to end.', 40, 382);

    // buttons
    SCREEN_BUTTONS.forEach((b) => {
      const hot = s.hover === b.id;
      ctx.fillStyle = ink;
      ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);
      ctx.fillStyle = hot ? phosphor : light;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = ink;
      ctx.font = '34px "Pixelify Sans", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + 44);
      ctx.textAlign = 'left';
    });

    // typing prompt
    ctx.fillStyle = phosphor;
    ctx.font = '34px "VT323", monospace';
    ctx.fillText(`> ${s.typed}${cursorOn ? '_' : ' '}`, 40, 550);
    if (!s.typed) {
      ctx.fillStyle = 'rgba(236,233,221,0.45)';
      ctx.fillText('(try the keyboard)', 150, 550);
    }
  }

  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}

function useScreen(ui: MutableRefObject<ScreenState>) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = SCREEN_W;
    c.height = SCREEN_H;
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
    let cursor = true;
    let tick = 0;
    const redraw = () => {
      drawScreen(ctx, ui.current, cursor);
      texture.needsUpdate = true;
    };
    // Fonts must be ready before the first draw, otherwise canvas falls back to monospace.
    Promise.all([
      document.fonts.load('40px "VT323"'),
      document.fonts.load('700 40px "Pixelify Sans"'),
    ]).finally(redraw);
    const id = window.setInterval(() => {
      if (++tick % 6 === 0) cursor = !cursor;
      redraw();
    }, 80);
    return () => window.clearInterval(id);
  }, [canvas, texture, ui]);

  return { canvas, texture };
}

/** A wire as a thin tube along a smooth curve. */
function Wire({ points, radius = 0.03 }: { points: [number, number, number][]; radius?: number }) {
  const curve = useMemo(() => new CatmullRomCurve3(points.map((p) => new Vector3(...p))), [points]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 48, radius, 8, false]} />
      <meshStandardMaterial color={themeColor('ink')} roughness={0.6} />
    </mesh>
  );
}

type Glyph = 'power' | 'eject';

/** Paints a transparent-background icon (power symbol / eject triangle) as a texture. */
function useGlyphTexture(kind: Glyph) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    g.strokeStyle = themeColor('ink');
    g.fillStyle = themeColor('ink');
    g.lineWidth = 14;
    g.lineCap = 'round';
    if (kind === 'power') {
      g.beginPath();
      g.arc(64, 72, 36, -Math.PI / 2 + 0.65, (3 * Math.PI) / 2 - 0.65);
      g.stroke();
      g.beginPath();
      g.moveTo(64, 20);
      g.lineTo(64, 68);
      g.stroke();
    } else {
      g.beginPath();
      g.moveTo(64, 26);
      g.lineTo(104, 76);
      g.lineTo(24, 76);
      g.closePath();
      g.fill();
      g.fillRect(24, 92, 80, 16);
    }
    return new CanvasTexture(c);
  }, [kind]);
}

/** Small engraved caption under a control ("POWER", "EJECT", ...). */
function Caption({ text, position }: { text: string; position: [number, number, number] }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    return new CanvasTexture(c);
  }, []);
  useEffect(() => {
    const paint = () => {
      const g = (texture.image as HTMLCanvasElement).getContext('2d')!;
      g.clearRect(0, 0, 256, 64);
      g.fillStyle = themeColor('ink');
      g.font = '700 38px "Pixelify Sans", monospace';
      g.textAlign = 'center';
      g.fillText(text, 128, 44);
      texture.needsUpdate = true;
    };
    document.fonts.load('700 38px "Pixelify Sans"').finally(paint);
  }, [text, texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={[0.62, 0.155]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];

function Key({ char, x, z, width = 0.22, onPress }: { char: string; x: number; z: number; width?: number; onPress: (c: string) => void }) {
  const mesh = useRef<Mesh>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);

  const press = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 5 || !mesh.current) return;
    onPress(char);
    gsap.fromTo(mesh.current.position, { y: 0.1 }, { y: 0.1 - 0.04, yoyo: true, repeat: 1, duration: 0.07 });
  };

  return (
    <mesh
      ref={mesh}
      position={[x, 0.1, z]}
      onClick={press}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[width, 0.08, 0.22]} />
      <meshStandardMaterial color={hover ? themeColor('phosphor') : themeColor('beige-light')} roughness={0.6} />
    </mesh>
  );
}

/** Small clickable push-button on the case. */
function PushButton({ position, size = 0.18, color, glyph, onPress }: { position: [number, number, number]; size?: number; color: string; glyph?: Glyph; onPress: () => void }) {
  const mesh = useRef<Mesh>(null);
  const [hover, setHover] = useState(false);
  const icon = useGlyphTexture(glyph ?? 'power');
  useCursor(hover);

  return (
    <mesh
      ref={mesh}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 5 || !mesh.current) return;
        onPress();
        gsap.fromTo(mesh.current.position, { z: position[2] }, { z: position[2] - 0.04, yoyo: true, repeat: 1, duration: 0.08 });
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[size, size, 0.08]} />
      <meshStandardMaterial color={hover ? themeColor('phosphor') : color} roughness={0.5} />
      {glyph && (
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[size * 0.8, size * 0.8]} />
          <meshBasicMaterial map={icon} transparent toneMapped={false} />
        </mesh>
      )}
    </mesh>
  );
}

function MacModel() {
  const ui = useRef<ScreenState>({ on: true, bootStart: performance.now(), typed: '', hover: null });
  const { texture } = useScreen(ui);
  const [power, setPower] = useState(true);
  const [bright, setBright] = useState(2);
  const [screenHover, setScreenHover] = useState(false);
  const [knobHover, setKnobHover] = useState(false);
  const disk = useRef<Group>(null);
  const knob = useRef<Mesh>(null);
  const ejected = useRef(false);
  useCursor(screenHover || knobHover);

  const beige = themeColor('plastic');
  const shade = themeColor('plastic-dark');
  const ink = themeColor('ink');
  const light = themeColor('beige-light');

  const hitButton = (e: ThreeEvent<MouseEvent | PointerEvent>) => {
    if (!e.uv || !ui.current.on) return null;
    const px = e.uv.x * SCREEN_W;
    const py = (1 - e.uv.y) * SCREEN_H;
    return SCREEN_BUTTONS.find((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) ?? null;
  };

  const togglePower = () => {
    ui.current.on = !ui.current.on;
    ui.current.bootStart = performance.now();
    setPower(ui.current.on);
  };

  const cycleBrightness = () => {
    const next = (bright + 1) % BRIGHTNESS.length;
    setBright(next);
    if (knob.current) gsap.to(knob.current.rotation, { y: next * (Math.PI / 3), duration: 0.25 });
  };

  const eject = () => {
    ejected.current = !ejected.current;
    if (disk.current) gsap.to(disk.current.position, { z: ejected.current ? 1.75 : 1.1, duration: 0.5, ease: 'back.out(1.6)' });
  };

  const type = (c: string) => {
    if (!ui.current.on) return;
    ui.current.typed = (ui.current.typed + c).slice(-26);
  };

  const level = BRIGHTNESS[bright];

  return (
    <group>
      {/* case: squarer CRT body + rear hump */}
      <RoundedBox args={[2.9, 2.7, 2.4]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color={beige} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[2.3, 2.1, 1.1]} radius={0.04} smoothness={2} position={[0, 0.1, -1.7]}>
        <meshStandardMaterial color={beige} roughness={0.75} />
      </RoundedBox>

      {/* screen bezel + CRT (clickable) */}
      <RoundedBox args={[2.4, 1.85, 0.1]} radius={0.02} position={[0, 0.4, 1.22]}>
        <meshStandardMaterial color={shade} roughness={0.6} />
      </RoundedBox>
      <mesh
        position={[0, 0.4, 1.285]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 5) return;
          const b = hitButton(e);
          if (b) document.querySelector(b.target)?.scrollIntoView({ behavior: 'smooth' });
        }}
        onPointerMove={(e) => {
          const b = hitButton(e);
          const id = b?.id ?? null;
          if (ui.current.hover !== id) ui.current.hover = id;
          setScreenHover(!!b);
        }}
        onPointerOut={() => { ui.current.hover = null; setScreenHover(false); }}
      >
        <planeGeometry args={[2.2, 1.65]} />
        <meshBasicMaterial map={texture} color={new Color(level, level, level)} toneMapped={false} />
      </mesh>

      {/* lower face: floppy drive + controls */}
      <mesh position={[0, -0.86, 1.2]}>
        <boxGeometry args={[2.4, 0.62, 0.04]} />
        <meshStandardMaterial color={shade} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.74, 1.23]}>
        <boxGeometry args={[1.2, 0.07, 0.04]} />
        <meshStandardMaterial color={ink} />
      </mesh>
      {/* floppy that slides out of the slot */}
      <group ref={disk} position={[0, -0.74, 1.1]}>
        <mesh>
          <boxGeometry args={[0.95, 0.04, 0.95]} />
          <meshStandardMaterial color={ink} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.025, 0.2]}>
          <boxGeometry args={[0.55, 0.01, 0.4]} />
          <meshStandardMaterial color={light} />
        </mesh>
      </group>

      {/* power button + LED, eject button, brightness knob */}
      <PushButton position={[-0.95, -0.96, 1.24]} size={0.3} glyph="power" color={power ? light : themeColor('phosphor')} onPress={togglePower} />
      <Caption text="POWER" position={[-0.95, -1.14, 1.225]} />
      <mesh position={[-0.62, -0.96, 1.23]}>
        <boxGeometry args={[0.1, 0.1, 0.04]} />
        <meshStandardMaterial color={power ? themeColor('phosphor') : ink} emissive={power ? themeColor('phosphor') : '#000000'} emissiveIntensity={power ? 1.5 : 0} />
      </mesh>
      <PushButton position={[0.95, -0.96, 1.24]} size={0.3} glyph="eject" color={light} onPress={eject} />
      <Caption text="EJECT" position={[0.95, -1.14, 1.225]} />
      <Caption text="BRIGHT" position={[0.5, -1.14, 1.225]} />
      <mesh
        ref={knob}
        position={[0.5, -0.96, 1.26]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); if (e.delta <= 5) cycleBrightness(); }}
        onPointerOver={(e) => { e.stopPropagation(); setKnobHover(true); }}
        onPointerOut={() => setKnobHover(false)}
      >
        <cylinderGeometry args={[0.11, 0.11, 0.1, 20]} />
        <meshStandardMaterial color={knobHover ? themeColor('phosphor') : ink} roughness={0.5} />
      </mesh>

      {/* keyboard (floor is y = -1.35) */}
      <group position={[0, -1.28, 2.75]}>
        <RoundedBox args={[3.1, 0.14, 1.15]} radius={0.02}>
          <meshStandardMaterial color={beige} roughness={0.7} />
        </RoundedBox>
        {KEY_ROWS.map((row, r) =>
          [...row].map((ch, i) => (
            <Key key={ch} char={ch} x={(i - 4.5) * 0.28 + r * 0.06} z={-0.32 + r * 0.26} onPress={type} />
          ))
        )}
        <Key char=" " x={0} z={0.5} width={1.6} onPress={type} />
      </group>

      {/* mouse */}
      <RoundedBox args={[0.4, 0.14, 0.62]} radius={0.03} position={[2.1, -1.28, 2.75]}>
        <meshStandardMaterial color={beige} roughness={0.7} />
      </RoundedBox>
      <mesh position={[2.1, -1.2, 2.58]}>
        <boxGeometry args={[0.22, 0.04, 0.2]} />
        <meshStandardMaterial color={ink} />
      </mesh>

      {/* fake wires: keyboard → Mac, mouse → keyboard, power cable off to a wall plug */}
      <Wire points={[[-1.1, -1.3, 2.25], [-1.0, -1.34, 1.85], [-0.6, -1.3, 1.5], [-0.35, -1.0, 1.24]]} />
      <Wire points={[[2.1, -1.3, 2.4], [1.9, -1.34, 2.15], [1.5, -1.33, 2.2], [1.58, -1.3, 2.55]]} radius={0.025} />
      <Wire points={[[0.7, -0.5, -2.25], [0.9, -1.1, -2.6], [1.8, -1.3, -2.45], [3.2, -1.3, -1.6], [4.0, -1.3, -0.6]]} radius={0.04} />
      <mesh position={[4.1, -1.25, -0.5]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color={beige} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Rig({ rot, dragging }: { rot: MutableRefObject<Rotation>; dragging: MutableRefObject<boolean> }) {
  const group = useRef<Group>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const camera = useThree((s) => s.camera);
  // Pull the camera back on narrow screens so the keyboard and mouse never get cropped.
  useEffect(() => {
    camera.position.set(0, 0.4, Math.max(9.4, 12.5 / aspect));
    camera.lookAt(0, -0.1, 0);
  }, [camera, aspect]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.set(rot.current.x, rot.current.y, 0);
    group.current.position.y = dragging.current ? 0 : Math.sin(clock.elapsedTime * 1.4) * 0.04;
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

/** Draggable 3D Macintosh: rotates up to ±60° per axis, snaps to 30° poses on release. */
export default function Mac3D({ className = '' }: { className?: string }) {
  const rot = useRef<Rotation>({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<number | undefined>(undefined);
  const [webgl] = useState(hasWebGL);

  useEffect(() => () => { window.clearTimeout(idleTimer.current); gsap.killTweensOf(rot.current); }, []);

  const settle = (x: number, y: number, duration: number) =>
    gsap.to(rot.current, { x, y, duration, ease: 'back.out(1.6)', overwrite: true });

  // Window-level listeners so r3f still receives its own click events on the canvas.
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    window.clearTimeout(idleTimer.current);
    gsap.killTweensOf(rot.current);

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - last.current.x;
      const dy = ev.clientY - last.current.y;
      last.current = { x: ev.clientX, y: ev.clientY };
      rot.current.y = clamp(rot.current.y + dx * 0.01, LIMIT);
      // Touch keeps vertical gestures for page scroll, so only mouse/pen tilts on X.
      if (ev.pointerType !== 'touch') rot.current.x = clamp(rot.current.x + dy * 0.01, LIMIT);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      dragging.current = false;
      settle(snap(rot.current.x), snap(rot.current.y), 0.6);
      idleTimer.current = window.setTimeout(() => settle(0, 0, 0.9), IDLE_RETURN_MS);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
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
      className={`relative select-none touch-pan-y md:touch-none ${className}`}
      onPointerDown={onDown}
      role="img"
      aria-label="Interactive 3D Macintosh showing my portfolio. Drag to rotate; click its buttons, keys and screen."
    >
      <Canvas camera={{ position: [0, 0.4, 9.4], fov: 32 }} dpr={[1, 1.75]} className="!absolute inset-0">
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <directionalLight position={[-5, 2, -3]} intensity={0.6} />
        <Rig rot={rot} dragging={dragging} />
        <ContactShadows position={[0, -1.36, 0]} opacity={0.5} scale={11} blur={2.5} far={4} />
      </Canvas>
      <p className="b3 absolute top-1 inset-x-0 text-center text-beige-light/70 pointer-events-none">
        <span className="cursor-blink">▮</span> drag to rotate · press the buttons &amp; keys
      </p>
    </div>
  );
}
