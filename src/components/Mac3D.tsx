import { useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox, useCursor } from '@react-three/drei';
import { CanvasTexture, CatmullRomCurve3, Color, NearestFilter, Vector3, type Group, type Mesh } from 'three';
import { gsap } from 'gsap';
import PixelCat from '@/components/ui/PixelCat';
import { themeColor } from '@/lib/pixelCat';
import { RESET_VIEW_EVENT } from '@/lib/viewReset';
import { CAT_EVENT, JOY_EVENT } from '@/lib/catEvent';
import { SCREEN_W, SCREEN_H, createScreen, drawScreen, screenButtons, scrollTerm, submit, typeChar, TERM_PAGE, type ScreenState } from '@/lib/macScreen';
import type { Effect, TermData } from '@/lib/terminal';

/** Turn limit ±25° left/right, only ±8° up/down; resting poses snap to 12.5° / 4° steps. */
const LIMIT_Y = (25 * Math.PI) / 180;
const LIMIT_X = (8 * Math.PI) / 180;
const SNAP_STEP_Y = (12.5 * Math.PI) / 180;
const SNAP_STEP_X = (4 * Math.PI) / 180;
const IDLE_RETURN_MS = 5000;
const BRIGHTNESS = [0.55, 0.8, 1];
/** The floppy rests on the desk beside the Mac until INSERT is pressed. */
const DISK_DESK: [number, number, number] = [-2.35, -1.33, 0.9];
const DISK_SLOT_Y = -0.74;

interface Rotation { x: number; y: number }

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
const snap = (v: number, step: number, limit: number) => clamp(Math.round(v / step) * step, limit);

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

/** Soft blob shadow that lives in the model's frame, so it never slices through the case when tilted. */
function ShadowBlob() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gradient = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gradient;
    g.fillRect(0, 0, 256, 256);
    return new CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, -1.352, 0.7]} renderOrder={-1}>
      <planeGeometry args={[8.5, 6.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
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

type Glyph = 'power' | 'eject' | 'insert';

/** Paints a transparent-background icon (power symbol / eject or insert triangle) as a texture. */
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
    } else if (kind === 'eject') {
      g.beginPath();
      g.moveTo(64, 26);
      g.lineTo(104, 76);
      g.lineTo(24, 76);
      g.closePath();
      g.fill();
      g.fillRect(24, 92, 80, 16);
    } else {
      g.beginPath();
      g.moveTo(24, 22);
      g.lineTo(104, 22);
      g.lineTo(64, 72);
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
const KEY_PITCH = 0.26;
const KEY_DEPTH = 0.22;

/** Letter printed on a keycap, painted once the pixel font is ready. */
function useKeyLabel(text: string, aspect: number) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = Math.round(64 * aspect);
    c.height = 64;
    return new CanvasTexture(c);
  }, [aspect]);
  useEffect(() => {
    if (!text.trim()) return;
    const paint = () => {
      const c = texture.image as HTMLCanvasElement;
      const g = c.getContext('2d')!;
      g.clearRect(0, 0, c.width, c.height);
      g.fillStyle = themeColor('ink');
      g.font = `700 ${text.length > 1 ? 28 : 46}px "Pixelify Sans", monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text.toUpperCase(), c.width / 2, c.height / 2 + 2);
      texture.needsUpdate = true;
    };
    document.fonts.load('700 28px "Pixelify Sans"').finally(paint);
  }, [text, texture]);
  return texture;
}

/** One keycap. `char` is what it types ("\n" = Enter, "\b" = Delete); `label` is what is printed on it. */
function Key({ char, label = char, x, z, width = 0.22, onPress }: { char: string; label?: string; x: number; z: number; width?: number; onPress: (c: string) => void }) {
  const mesh = useRef<Mesh>(null);
  const [hover, setHover] = useState(false);
  const labelTexture = useKeyLabel(label, width / KEY_DEPTH);
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
      <boxGeometry args={[width, 0.08, KEY_DEPTH]} />
      <meshStandardMaterial color={hover ? themeColor('phosphor') : themeColor('beige-light')} roughness={0.6} />
      {label.trim() && (
        <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.9, KEY_DEPTH * 0.9]} />
          <meshBasicMaterial map={labelTexture} transparent toneMapped={false} />
        </mesh>
      )}
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

function MacModel({ data }: { data: TermData }) {
  const ui = useRef<ScreenState>(null as unknown as ScreenState);
  if (!ui.current) ui.current = createScreen();
  const dataRef = useRef(data);
  dataRef.current = data;
  const { texture } = useScreen(ui);
  const [power, setPower] = useState(true);
  const [bright, setBright] = useState(2);
  const [screenHover, setScreenHover] = useState(false);
  const [knobHover, setKnobHover] = useState(false);
  const disk = useRef<Group>(null);
  const knob = useRef<Mesh>(null);
  const diskBusy = useRef(false);
  const [diskIn, setDiskIn] = useState(false);
  useCursor(screenHover || knobHover);

  const beige = themeColor('plastic');
  const shade = themeColor('plastic-dark');
  const ink = themeColor('ink');
  const light = themeColor('beige-light');

  const hitButton = (e: ThreeEvent<MouseEvent | PointerEvent>) => {
    if (!e.uv || !ui.current.on) return null;
    const px = e.uv.x * SCREEN_W;
    const py = (1 - e.uv.y) * SCREEN_H;
    return screenButtons(ui.current).find((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) ?? null;
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

  /**
   * INSERT lifts the floppy off the desk and pushes it into the drive (the CRT then plays the
   * disk); EJECT pops it out and sets it back on the desk. The button label alternates.
   */
  const toggleDisk = () => {
    const group = disk.current;
    if (!group || diskBusy.current) return;
    diskBusy.current = true;
    const done = () => { diskBusy.current = false; };
    if (!diskIn) {
      gsap
        .timeline({ onComplete: done })
        .to(group.position, { x: 0, y: DISK_SLOT_Y, z: 2.2, duration: 0.6, ease: 'power2.inOut' })
        .to(group.position, { z: 1.1, duration: 0.35, ease: 'power1.in' })
        .add(() => {
          ui.current.disk = true;
          setDiskIn(true);
        });
    } else {
      ui.current.disk = false;
      setDiskIn(false);
      gsap
        .timeline({ onComplete: done })
        .to(group.position, { z: 2.0, duration: 0.4, ease: 'back.out(1.6)' })
        .to(group.position, { x: DISK_DESK[0], y: DISK_DESK[1], z: DISK_DESK[2], duration: 0.7, ease: 'power2.inOut' });
    }
  };

  const goTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });

  const runEffects = (effects: Effect[]) => {
    effects.forEach((fx) => {
      if (fx.type === 'scroll') goTo(fx.selector);
      else if (fx.type === 'joy') window.dispatchEvent(new Event(JOY_EVENT));
      else if (fx.type === 'cat') {
        ui.current.catUntil = performance.now() + 5000;
        window.dispatchEvent(new Event(CAT_EVENT));
      }
    });
  };

  /** A key from the 3D keyboard or the real one. ENTER runs the line, DEL erases. */
  const type = (c: string) => {
    const state = ui.current;
    if (!state.on) return;
    if (c === '\n') runEffects(submit(state, dataRef.current));
    else typeChar(state, c);
  };

  /** Click on a button painted on the CRT. */
  const pressScreenButton = (id: string) => {
    const detail = ui.current.detail;
    if (id === 'home-projects') goTo('#projects');
    else if (id === 'home-contact') goTo('#footer');
    else if (id === 'detail' && detail?.button) {
      const { url, scrollTo } = detail.button;
      if (scrollTo) goTo(scrollTo);
      else if (url?.startsWith('mailto:')) window.location.href = url;
      else if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Real keyboard: click the screen to start typing, ESC or a click elsewhere to stop.
  const typeRef = useRef(type);
  typeRef.current = type;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ui.current.focus) return;
      if (e.key === 'Escape') {
        ui.current.focus = false;
        document.getElementById('mac-input')?.blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const scrollKeys: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: TERM_PAGE, PageDown: -TERM_PAGE };
      if (e.key in scrollKeys) {
        e.preventDefault();
        scrollTerm(ui.current, scrollKeys[e.key]);
        return;
      }
      const c = e.key === 'Enter' ? '\n' : e.key === 'Backspace' ? '\b' : e.key.length === 1 ? e.key : null;
      if (c === null) return;
      e.preventDefault();
      typeRef.current(c);
    };
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('canvas')) ui.current.focus = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  const level = BRIGHTNESS[bright];

  return (
    <group>
      <ShadowBlob />
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
          if (b) {
            pressScreenButton(b.id);
          } else if (ui.current.on) {
            ui.current.focus = true;
            ui.current.catUntil = 0;
            // phones: focusing a hidden input brings up the on-screen keyboard
            document.getElementById('mac-input')?.focus();
          }
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
      {/* the floppy: on the desk by default, slides into the slot on INSERT */}
      <group ref={disk} position={DISK_DESK}>
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
      <PushButton position={[0.95, -0.96, 1.24]} size={0.3} glyph={diskIn ? 'eject' : 'insert'} color={light} onPress={toggleDisk} />
      <Caption text={diskIn ? 'EJECT' : 'INSERT'} position={[0.95, -1.14, 1.225]} />
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
      <group position={[-0.25, -1.28, 2.75]}>
        {/* base is larger than the key field on every side */}
        <RoundedBox args={[3.5, 0.14, 1.5]} radius={0.02} position={[0.25, 0, 0.1]}>
          <meshStandardMaterial color={beige} roughness={0.7} />
        </RoundedBox>
        {KEY_ROWS.map((row, r) =>
          [...row].map((ch, i) => (
            <Key key={ch} char={ch} x={(i - 4.5) * KEY_PITCH + r * 0.05} z={-0.32 + r * 0.26} onPress={type} />
          ))
        )}
        <Key char={'\b'} label="DEL" x={1.52} z={-0.32} width={0.4} onPress={type} />
        <Key char={'\n'} label="ENTER" x={1.6} z={-0.06} width={0.45} onPress={type} />
        <Key char=" " label=" " x={0.1} z={0.5} width={1.6} onPress={type} />
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

function Rig({ rot, dragging, data }: { rot: MutableRefObject<Rotation>; dragging: MutableRefObject<boolean>; data: TermData }) {
  const group = useRef<Group>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const width = useThree((s) => s.size.width);
  const camera = useThree((s) => s.camera);
  // Pull the camera back on narrow screens so the keyboard and mouse never get cropped.
  useEffect(() => {
    // Portrait phones: fill the width with the screen (case sides may crop); landscape: fit the whole desk.
    // (tablets in portrait are wide enough to show the whole desk, keyboard included)
    const z =
      aspect >= 1
        ? Math.max(9.4, 12.5 / aspect)
        : width < 600
          ? Math.max(7.2, 2.9 / (0.573 * aspect))
          : Math.max(8.2, 4.8 / (0.573 * aspect));
    camera.position.set(0, 0.4, z);
    camera.lookAt(0, -0.1, 0);
  }, [camera, aspect, width]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.set(rot.current.x, rot.current.y, 0);
    group.current.position.y = dragging.current ? 0 : Math.sin(clock.elapsedTime * 1.4) * 0.04;
  });
  return (
    <group ref={group}>
      <MacModel data={data} />
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

/** Draggable 3D Macintosh: turns ±25° sideways and ±8° up/down, snapping to small poses on release. */
export default function Mac3D({ className = '', projects, experiences }: { className?: string } & TermData) {
  const data = useMemo(() => ({ projects, experiences }), [projects, experiences]);
  const rot = useRef<Rotation>({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<number | undefined>(undefined);
  const [webgl] = useState(hasWebGL);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => () => { window.clearTimeout(idleTimer.current); gsap.killTweensOf(rot.current); }, []);

  const settle = (x: number, y: number, duration: number) =>
    gsap.to(rot.current, { x, y, duration, ease: 'back.out(1.6)', overwrite: true });

  useEffect(() => {
    const home = () => {
      window.clearTimeout(idleTimer.current);
      settle(0, 0, 0.6);
    };
    window.addEventListener(RESET_VIEW_EVENT, home);
    return () => window.removeEventListener(RESET_VIEW_EVENT, home);
  }, []);

  // Window-level listeners so r3f still receives its own click events on the canvas.
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    setGrabbing(true);
    last.current = { x: e.clientX, y: e.clientY };
    window.clearTimeout(idleTimer.current);
    gsap.killTweensOf(rot.current);

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - last.current.x;
      const dy = ev.clientY - last.current.y;
      last.current = { x: ev.clientX, y: ev.clientY };
      rot.current.y = clamp(rot.current.y + dx * 0.01, LIMIT_Y);
      // Touch keeps vertical gestures for page scroll, so only mouse/pen tilts on X.
      if (ev.pointerType !== 'touch') rot.current.x = clamp(rot.current.x + dy * 0.01, LIMIT_X);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      dragging.current = false;
      setGrabbing(false);
      settle(snap(rot.current.x, SNAP_STEP_X, LIMIT_X), snap(rot.current.y, SNAP_STEP_Y, LIMIT_Y), 0.6);
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
      className={`relative select-none touch-pan-y md:touch-none ${grabbing ? 'cursor-grabbing' : ''} ${className}`}
      onPointerDown={onDown}
      role="img"
      aria-label="Interactive 3D Macintosh showing my portfolio. Drag to rotate; click its buttons, keys and screen."
    >
      <Canvas camera={{ position: [0, 0.4, 9.4], fov: 32 }} dpr={[1, 1.75]} className="!absolute inset-0">
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <directionalLight position={[-5, 2, -3]} intensity={0.6} />
        <Rig rot={rot} dragging={dragging} data={data} />
      </Canvas>
      {/* hidden field: focusing it raises the on-screen keyboard on phones; keys are read from window keydown */}
      <input
        id="mac-input"
        aria-label="Type on the Mac"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="absolute bottom-0 left-0 size-px opacity-0 pointer-events-none"
        onInput={(e) => {
          // virtual keyboards that report key "Unidentified": replay the typed text as key presses
          const value = e.currentTarget.value;
          e.currentTarget.value = '';
          [...value].forEach((ch) => window.dispatchEvent(new KeyboardEvent('keydown', { key: ch })));
        }}
      />
      <p className="b3 hidden sm:block absolute top-1 inset-x-0 text-center text-beige-light/70 pointer-events-none">
        <span className="cursor-blink">▮</span> drag to rotate · press the buttons &amp; keys
      </p>
    </div>
  );
}
