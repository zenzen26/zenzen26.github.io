import { themeColor } from '@/lib/pixelCat';
import { pathOf, promptFor, runTerminal, type Detail, type Dir, type Effect, type TermData } from '@/lib/terminal';

/** Everything the 3D Mac's CRT shows and reacts to, painted on a 2D canvas texture. */
export const SCREEN_W = 800;
export const SCREEN_H = 600;
export const BOOT_MS = 1600;

const TERM_LINES = 12;
const MAX_TYPED = 44;

export interface ScreenButton {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ScreenState {
  on: boolean;
  bootStart: number;
  /** "home" = hero content, "term" = full-screen terminal. */
  mode: 'home' | 'term';
  cwd: Dir;
  typed: string;
  /** Terminal scrollback (prompt lines + output). */
  lines: string[];
  /** Lines scrolled up from the bottom of the scrollback (arrow / page keys). */
  scroll: number;
  /** Overview card from `cat <file>`, shown instead of scrollback. */
  detail: Detail | null;
  /** Real-keyboard typing is on (after clicking the screen). */
  focus: boolean;
  /** A disk is in the drive (INSERT pressed): the CRT plays the Rick-roll. */
  disk: boolean;
  /** Show the "it's a cat!" popup until this timestamp. */
  catUntil: number;
  hover: string | null;
}

export const createScreen = (): ScreenState => ({
  on: true,
  bootStart: performance.now(),
  mode: 'home',
  cwd: '~',
  typed: '',
  lines: [],
  scroll: 0,
  detail: null,
  focus: false,
  disk: false,
  catUntil: 0,
  hover: null,
});

const HOME_BUTTONS: ScreenButton[] = [
  { id: 'home-projects', label: 'VIEW PROJECTS', x: 40, y: 410, w: 300, h: 66 },
  { id: 'home-contact', label: 'CONTACT ME', x: 360, y: 410, w: 250, h: 66 },
];

/** Buttons currently painted on the screen (also used for click hit-testing). */
export function screenButtons(s: ScreenState): ScreenButton[] {
  if (!s.on) return [];
  if (s.mode === 'home') return HOME_BUTTONS;
  if (s.detail?.button) return [{ id: 'detail', label: s.detail.button.label, x: 40, y: 484, w: 440, h: 58 }];
  return [];
}

/** Runs the typed line. Returns effects that need the page (scroll) or the pet (cat). */
export function submit(s: ScreenState, data: TermData): Effect[] {
  const input = s.typed;
  s.typed = '';
  s.catUntil = 0;
  if (!input.trim()) return [];

  const result = runTerminal(input, s.cwd, data);
  s.mode = 'term';
  s.detail = null;
  s.scroll = 0;
  s.lines.push(`${promptFor(s.cwd)} ${input}`, ...result.lines);
  s.lines = s.lines.slice(-200);
  s.cwd = result.cwd;

  const outside: Effect[] = [];
  for (const fx of result.effects) {
    if (fx.type === 'clear') s.lines = [];
    else if (fx.type === 'exit') {
      s.mode = 'home';
      s.detail = null;
    } else if (fx.type === 'detail') s.detail = fx.detail;
    else outside.push(fx);
  }
  return outside;
}

/** Scrolls the terminal history; `delta` > 0 goes back in time. */
export function scrollTerm(s: ScreenState, delta: number) {
  if (s.mode !== 'term' || s.detail) return;
  const max = Math.max(0, s.lines.length - TERM_LINES);
  s.scroll = Math.min(max, Math.max(0, s.scroll + delta));
}

export const TERM_PAGE = TERM_LINES;

export function typeChar(s: ScreenState, c: string) {
  if (c === '\b') s.typed = s.typed.slice(0, -1);
  else if (c.length === 1) s.typed = (s.typed + c).slice(0, MAX_TYPED);
}

function drawButton(ctx: CanvasRenderingContext2D, b: ScreenButton, hot: boolean) {
  const ink = themeColor('ink');
  ctx.fillStyle = ink;
  ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);
  ctx.fillStyle = hot ? themeColor('phosphor') : themeColor('beige-light');
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = ink;
  ctx.font = '34px "Pixelify Sans", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 12);
  ctx.textAlign = 'left';
}

function drawMenuBar(ctx: CanvasRenderingContext2D, left: string, right = '') {
  const ink = themeColor('ink');
  ctx.fillStyle = themeColor('beige-light');
  ctx.fillRect(0, 0, SCREEN_W, 44);
  ctx.fillStyle = ink;
  ctx.fillRect(0, 44, SCREEN_W, 3);
  ctx.font = '30px "Pixelify Sans", monospace';
  ctx.fillText(left, 20, 32);
  if (right) {
    ctx.font = '26px "VT323", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(right, SCREEN_W - 20, 32);
    ctx.textAlign = 'left';
  }
}

function drawHome(ctx: CanvasRenderingContext2D, s: ScreenState, cursorOn: boolean) {
  const phosphor = themeColor('phosphor');
  const ink = themeColor('ink');
  const light = themeColor('beige-light');

  drawMenuBar(ctx, 'File   Edit   View   Special');

  ctx.fillStyle = phosphor;
  ctx.fillRect(40, 78, 270, 40);
  ctx.fillStyle = ink;
  ctx.font = '30px "VT323", monospace';
  ctx.fillText('■ OPEN TO WORK', 54, 108);

  ctx.font = '700 118px "Pixelify Sans", monospace';
  ctx.fillStyle = light;
  ctx.fillText('ZEN', 40, 240);
  ctx.fillStyle = phosphor;
  ctx.fillText('ZEN', 40 + ctx.measureText('ZEN').width, 240);

  ctx.font = '42px "VT323", monospace';
  ctx.fillText('Web Developer & Bio Enthusiast', 40, 296);
  ctx.fillStyle = light;
  ctx.font = '32px "VT323", monospace';
  ctx.fillText('Full-stack web, servers and AI automation.', 40, 346);
  ctx.fillText('I build and ship reliable systems end to end.', 40, 382);

  HOME_BUTTONS.forEach((b) => drawButton(ctx, b, s.hover === b.id));

  ctx.fillStyle = phosphor;
  ctx.font = '34px "VT323", monospace';
  ctx.fillText(`> ${s.typed}${cursorOn ? '_' : ' '}`, 40, 566);
  if (!s.typed) {
    ctx.fillStyle = 'rgba(236,233,221,0.45)';
    ctx.fillText(s.focus ? '(typing... ENTER runs, ESC stops)' : '(click the screen and type: try "help")', 150, 566);
  }
}

function drawTerminal(ctx: CanvasRenderingContext2D, s: ScreenState, cursorOn: boolean) {
  const phosphor = themeColor('phosphor');
  const light = themeColor('beige-light');

  ctx.fillStyle = themeColor('forest-deep');
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawMenuBar(ctx, `Terminal — ${pathOf(s.cwd)}`, 'type "exit" to leave');

  if (s.detail) {
    ctx.fillStyle = phosphor;
    ctx.font = '700 38px "Pixelify Sans", monospace';
    ctx.fillText(s.detail.title.length > 34 ? s.detail.title.slice(0, 33) + '…' : s.detail.title, 40, 100);
    ctx.fillStyle = light;
    ctx.font = '30px "VT323", monospace';
    s.detail.lines.forEach((line, i) => ctx.fillText(line, 40, 148 + i * 32));
    screenButtons(s).forEach((b) => drawButton(ctx, b, s.hover === b.id));
  } else {
    ctx.font = '30px "VT323", monospace';
    const end = s.lines.length - s.scroll;
    s.lines.slice(Math.max(0, end - TERM_LINES), end).forEach((line, i) => {
      ctx.fillStyle = line.includes('@mac:') ? phosphor : light;
      ctx.fillText(line, 40, 92 + i * 34);
    });
    if (!s.lines.length) {
      ctx.fillStyle = 'rgba(236,233,221,0.55)';
      ctx.fillText('Welcome to ZEN OS. Type "help" and press ENTER.', 40, 92);
    }
    if (s.scroll > 0) {
      ctx.fillStyle = themeColor('phosphor');
      ctx.textAlign = 'right';
      ctx.fillText(`-- scrolled up ${s.scroll} (↓ to return) --`, SCREEN_W - 40, 548);
      ctx.textAlign = 'left';
    }
  }

  const prompt = `${promptFor(s.cwd)} `;
  const room = 56 - prompt.length;
  ctx.fillStyle = phosphor;
  ctx.font = '32px "VT323", monospace';
  ctx.fillText(`${prompt}${s.typed.slice(-room)}${cursorOn ? '_' : ' '}`, 40, 574);
}

let catIcon: HTMLImageElement | undefined;

/** The header's calico icon (public/favicon.png), loaded once. */
function getCatIcon() {
  if (!catIcon) {
    catIcon = new Image();
    catIcon.src = '/favicon.png';
  }
  return catIcon;
}

function drawCatPopup(ctx: CanvasRenderingContext2D) {
  const ink = themeColor('ink');
  const light = themeColor('beige-light');
  const px = 100;
  const py = 110;
  const pw = 600;
  const ph = 350;

  ctx.fillStyle = ink;
  ctx.fillRect(px + 8, py + 8, pw, ph);
  ctx.fillStyle = light;
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = themeColor('beige');
  ctx.fillRect(px, py, pw, 44);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(px, py, pw, ph);
  ctx.beginPath();
  ctx.moveTo(px, py + 44);
  ctx.lineTo(px + pw, py + 44);
  ctx.stroke();

  ctx.fillStyle = ink;
  ctx.font = '30px "Pixelify Sans", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('cat.txt', px + pw / 2, py + 32);

  const icon = getCatIcon();
  if (icon.complete && icon.naturalWidth) {
    const size = 200;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(icon, px + (pw - size) / 2, py + 40, size, size);
    ctx.imageSmoothingEnabled = true;
  }

  ctx.fillStyle = ink;
  ctx.font = '32px "VT323", monospace';
  ctx.fillText('you thought you were going to read a file?', px + pw / 2, py + 262);
  ctx.font = '700 40px "Pixelify Sans", monospace';
  ctx.fillText('nope. it is a cat!  =^..^=', px + pw / 2, py + 312);
  ctx.textAlign = 'left';
}

let rickRoll: HTMLImageElement | undefined;

/**
 * The disk's contents. An animated GIF only advances while its <img> is in the page, so it
 * lives in <body> (invisible) and each frame of the screen is drawn from it. Fetched on first use:
 * it is a few MB, so it is not loaded until someone inserts the disk.
 */
function getRickRoll() {
  if (!rickRoll) {
    rickRoll = new Image();
    rickRoll.src = '/videos/rick-roll.gif';
    rickRoll.alt = '';
    rickRoll.setAttribute('aria-hidden', 'true');
    rickRoll.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(rickRoll);
  }
  return rickRoll;
}

function drawRickRoll(ctx: CanvasRenderingContext2D) {
  const img = getRickRoll();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  if (img.complete && img.naturalWidth) {
    // cover the whole tube, cropping top and bottom
    const scale = Math.max(SCREEN_W / img.naturalWidth, SCREEN_H / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (SCREEN_W - w) / 2, (SCREEN_H - h) / 2, w, h);
  } else {
    ctx.fillStyle = themeColor('phosphor');
    ctx.font = '40px "VT323", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('reading disk...', SCREEN_W / 2, SCREEN_H / 2);
    ctx.textAlign = 'left';
  }
}

/** Paints the whole CRT: power-off, boot log, hero or terminal, focus ring, cat popup, scanlines. */
export function drawScreen(ctx: CanvasRenderingContext2D, s: ScreenState, cursorOn: boolean) {
  const W = SCREEN_W;
  const H = SCREEN_H;
  const phosphor = themeColor('phosphor');

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

  ctx.fillStyle = themeColor('forest');
  ctx.fillRect(0, 0, W, H);

  const elapsed = performance.now() - s.bootStart;
  if (elapsed < BOOT_MS) {
    const lines = ['ZEN OS 1.0', 'checking memory.......OK', 'mounting portfolio....OK', 'feeding the cat.......OK', 'welcome.'];
    ctx.fillStyle = phosphor;
    ctx.font = '40px "VT323", monospace';
    const shown = Math.floor((elapsed / BOOT_MS) * (lines.length + 1));
    lines.slice(0, shown).forEach((line, i) => ctx.fillText(`> ${line}`, 40, 90 + i * 52));
  } else if (s.disk) {
    drawRickRoll(ctx);
  } else if (s.mode === 'term') {
    drawTerminal(ctx, s, cursorOn);
  } else {
    drawHome(ctx, s, cursorOn);
  }

  if (s.focus) {
    ctx.strokeStyle = phosphor;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 54, W - 12, H - 60);
  }
  if (performance.now() < s.catUntil) drawCatPopup(ctx);

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}
