/**
 * Chubby side-view calico desktop pet, facing right (22 px wide). Palette: see
 * PixelSprite (# black patch/eyes, o orange, w white, k pink nose). Each row is
 * built from a body half (x0–11) and a head half (x12–21).
 */
const LEFT = [
  '............',
  '............',
  '#...........',
  '##..........',
  '.#..wwwwwwww',
  '..#wwooowwww',
  '..wwwwoowwww',
  '..wwwwwwwwww',
  '..wwww##wwww',
  '..wwwwwwwwww',
  '...wwwwwwwww',
];

const RIGHT = [
  '.oo....##.',
  '.oowwwww##',
  'oowwwwwwww',
  'wwwwwwwwww',
  'ww#wwww#ww',
  'wwwwwwwwkk',
  'wwwwwwww#w',
  '.wwwwwwww.',
  'wwwwww....',
  'ww........',
  'w.........',
];

const compose = (right: readonly string[], legs: readonly string[]) => [
  ...LEFT.map((row, i) => row + right[i]),
  ...legs,
];

const EYES_OPEN = 4;
const blinkRight = RIGHT.map((row, i) => (i === EYES_OPEN ? 'wwwwwwwwww' : row));

export const PET_FRAMES = {
  idle: compose(RIGHT, ['....ww.......ww.......', '....ww.......ww.......']),
  blink: compose(blinkRight, ['....ww.......ww.......', '....ww.......ww.......']),
  walkA: compose(RIGHT, ['...ww.......ww........', '..ww.........ww.......']),
  walkB: compose(RIGHT, ['.....ww.......ww......', '.....ww........ww.....']),
} as const;

export type PetPose = keyof typeof PET_FRAMES;
