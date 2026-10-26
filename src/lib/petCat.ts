/**
 * Squat, loaf-shaped desktop pet that mirrors the header icon: black cat, orange
 * forehead patch, pink inner ears, green eyes, white muzzle, orange-striped tail.
 * Faces right, 22 px wide. Palette: see PixelSprite (# black, o orange, k pink,
 * g green, w white). Each row is a body half (x0–8) plus a head half (x9–21).
 */
const LEFT = [
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.########',
  'o########',
  '#o#oo####',
  '.o#######',
  '.########',
];

const RIGHT = [
  '.#........#..',
  '#k#......#k#.',
  '#ooo########.',
  'oo##########.',
  '##g#####g###.',
  '#######wwwk#.',
  '######wwwww#.',
  '.#####www###.',
  '###########..',
  '##########...',
];

const WIDTH = 22;
const pad = (row: string) => row.padEnd(WIDTH, '.');

const compose = (right: readonly string[], legs: readonly string[]) => [
  ...LEFT.map((row, i) => row + right[i]),
  ...legs.map(pad),
];

const EYES_ROW = 4;
const blinkRight = RIGHT.map((row, i) => (i === EYES_ROW ? '############.' : row));

const IDLE = ['..##..##....##..##', '..ww..ww....ww..ww'];
const STEP_A = ['..##.......##', '.ww.........ww'];
const STEP_B = ['.....##.......##', '.....ww.......ww'];

export const PET_FRAMES = {
  idle: compose(RIGHT, IDLE),
  blink: compose(blinkRight, IDLE),
  walkA: compose(RIGHT, STEP_A),
  walkB: compose(RIGHT, STEP_B),
} as const;

export type PetPose = keyof typeof PET_FRAMES;
