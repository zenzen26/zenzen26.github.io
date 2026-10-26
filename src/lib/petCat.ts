/**
 * Ginger tabby desktop pet (side view, faces right, 24 px wide) after the pixel-cat
 * reference: long striped body, white-socked legs, tail up, pointy ears, green eyes.
 * Palette: see PixelSprite (o orange, y light stripe, g green eye, k pink nose, w white).
 * Each row is a body half (x0–14) plus a head half (x15–23).
 */
const LEFT = [
  '.oo............',
  '.y.............',
  '.o.............',
  '.y.............',
  '.o.............',
  '.oooyoyoyoyoyoy',
  '..oyoyoyoyoyoyo',
  '..ooyoyoyoyoyoo',
  '...oowwwwwwwwoo',
  '....ooooooooooo',
];

const RIGHT = [
  '.o....o..',
  '.ooo.ooo.',
  'oyooooyo.',
  'oooooooo.',
  'oogoogoo.',
  'oowkkwoo.',
  'oowwwwoo.',
  '.oowwoo..',
  '.oowo....',
  '.........',
];

const compose = (right: readonly string[], legs: readonly string[]) => [
  ...LEFT.map((row, i) => row + right[i]),
  ...legs,
];

const blinkRight = RIGHT.map((row, i) => (i === 4 ? 'oooooooo.' : row));

const STAND = ['...oo.oo.....oo.oo......', '...ww.ww.....ww.ww......'];
const STEP_A = ['..oo...oo....oo...oo....', '..ww...ww....ww...ww....'];
const STEP_B = ['....oo.oo.....oo.oo.....', '....ww.ww.....ww.ww.....'];
/** Picked up by the scruff: legs dangle. */
const HELD = [STAND[0], STAND[0], STAND[1], STAND[1]];

export const PET_FRAMES = {
  idle: compose(RIGHT, STAND),
  blink: compose(blinkRight, STAND),
  walkA: compose(RIGHT, STEP_A),
  walkB: compose(RIGHT, STEP_B),
  held: compose(RIGHT, HELD),
} as const;

export type PetPose = keyof typeof PET_FRAMES;
