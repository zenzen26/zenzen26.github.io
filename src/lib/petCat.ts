/**
 * Ginger tabby desktop pet (side view, faces right, 20 px wide), after the pixel-cat
 * reference: orange body with lighter stripes, green eyes, white chest and socks, tail up.
 * Palette: see PixelSprite (o orange, y light stripe, g green eye, k pink nose, w white).
 * Each row is a body half (x0–11) plus a head half (x12–19).
 */
const LEFT = [
  '..o.........',
  '..y.........',
  '..o.........',
  '..y.........',
  '..o.........',
  '..ooyoyoyoyo',
  '..oyoyoyoyoy',
  '...ooyoyoyoo',
  '...oowwwwwoo',
];

const RIGHT = [
  '........',
  'oo...oo.',
  'oyooyoo.',
  'ooooooo.',
  'ogooogo.',
  'owwkwwo.',
  'oowwwoo.',
  '..owwo..',
  '..oowo..',
];

const compose = (right: readonly string[], legs: readonly string[]) => [
  ...LEFT.map((row, i) => row + right[i]),
  ...legs,
];

const blinkRight = RIGHT.map((row, i) => (i === 4 ? 'ooooooo.' : row));

const STAND = ['...oo..oo..oo.oo....', '...ww..ww..ww.ww....'];
const STEP_A = ['..oo...oo..oo...oo..', '..ww...ww..ww...ww..'];
const STEP_B = ['....oo.oo...oo.oo...', '....ww.ww...ww.ww...'];
/** Picked up by the scruff: legs dangle. */
const HELD = ['...oo..oo..oo.oo....', '...oo..oo..oo.oo....', '...ww..ww..ww.ww....', '...ww..ww..ww.ww....'];

export const PET_FRAMES = {
  idle: compose(RIGHT, STAND),
  blink: compose(blinkRight, STAND),
  walkA: compose(RIGHT, STEP_A),
  walkB: compose(RIGHT, STEP_B),
  held: compose(RIGHT, HELD),
} as const;

export type PetPose = keyof typeof PET_FRAMES;
