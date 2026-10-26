/**
 * Ginger tabby desktop pet, side view, faces right (24 x 17 px). Built from parts
 * (tail, body, head, four thin legs) so the walk cycle can swing the legs and tail.
 * Palette: see PixelSprite (o orange, y light stripe, g green eye, # pupil, k pink, w white).
 */
const W = 24;
const H = 17;
const LEG_TOP = 12;

type Grid = string[][];

const blank = (): Grid => Array.from({ length: H }, () => Array<string>(W).fill('.'));

const stamp = (grid: Grid, rows: readonly string[], x0: number, y0: number) =>
  rows.forEach((row, dy) =>
    [...row].forEach((c, dx) => {
      if (c !== '.') grid[y0 + dy][x0 + dx] = c;
    })
  );

const BODY = [
  '..oyoyoyoyo..',
  'oyoyoyoyoyoyo',
  'yoyoyoyoyoyoy',
  'oyoyoyoyoyoyo',
  'oowwwwwwwwwoo',
  '.ooooooooooo.',
];

const headRows = (eyesOpen: boolean) => [
  '.o.....o.',
  'oko...oko',
  'oyoooooyo',
  'ooooooooo',
  eyesOpen ? 'ooggoggoo' : 'ooooooooo',
  eyesOpen ? 'oog#og#oo' : 'oo##oo##o',
  'ooowkwooo',
  'oooowwooo',
  '.ooooooo.',
  '..ooooo..',
];

/** Tail curls up from the rump; `sway` pushes the upper half one pixel back and forth. */
const tail = (grid: Grid, sway: number) => {
  const cells: [number, number, string][] = [
    [2, 0, 'o'], [1, 1, 'o'], [2, 1, 'y'], [0, 2, 'o'], [1, 2, 'y'], [0, 3, 'y'], [1, 3, 'o'],
    [0, 4, 'o'], [1, 4, 'y'], [0, 5, 'y'], [1, 5, 'o'], [0, 6, 'o'], [1, 6, 'y'], [1, 7, 'o'],
  ];
  cells.forEach(([x, y, c]) => {
    grid[y][x + (y <= 3 ? sway : 0)] = c;
  });
};

interface Leg {
  top: number;
  bottom: number;
  far?: boolean;
  /** Rows tall; a shorter leg is lifted off the floor mid-stride. */
  height?: number;
}

const legs = (grid: Grid, list: Leg[]) => {
  // far-side legs first so near legs overlap them
  [...list.filter((l) => l.far), ...list.filter((l) => !l.far)].forEach((leg) => {
    const h = leg.height ?? 5;
    for (let i = 0; i < h; i++) {
      const x = Math.round(leg.top + ((leg.bottom - leg.top) * i) / Math.max(1, h - 1));
      grid[LEG_TOP + i][x] = i >= h - 2 ? 'w' : leg.far ? 'y' : 'o';
    }
  });
};

const STAND: Leg[] = [
  { top: 4, bottom: 4 }, { top: 7, bottom: 7, far: true },
  { top: 11, bottom: 11 }, { top: 13, bottom: 13, far: true },
];
const STRIDE_A: Leg[] = [
  { top: 4, bottom: 2 }, { top: 7, bottom: 9, far: true, height: 4 },
  { top: 11, bottom: 13, height: 4 }, { top: 13, bottom: 11, far: true },
];
const STRIDE_B: Leg[] = [
  { top: 4, bottom: 6, height: 4 }, { top: 7, bottom: 5, far: true },
  { top: 11, bottom: 9 }, { top: 13, bottom: 15, far: true, height: 4 },
];
/** Picked up by the scruff: legs dangle a bit longer. */
const HELD: Leg[] = [
  { top: 4, bottom: 4, height: 5 }, { top: 7, bottom: 7, far: true, height: 5 },
  { top: 11, bottom: 11, height: 5 }, { top: 13, bottom: 13, far: true, height: 5 },
];

const build = (leg: Leg[], opts: { sway?: number; eyesOpen?: boolean } = {}): string[] => {
  const grid = blank();
  tail(grid, opts.sway ?? 0);
  stamp(grid, BODY, 2, 6);
  stamp(grid, headRows(opts.eyesOpen ?? true), 14, 0);
  legs(grid, leg);
  return grid.map((row) => row.join(''));
};

export const PET_FRAMES = {
  idle: build(STAND),
  blink: build(STAND, { eyesOpen: false }),
  walkA: build(STRIDE_A),
  walkB: build(STRIDE_B, { sway: 1 }),
  held: build(HELD, { sway: 1 }),
} as const;

export type PetPose = keyof typeof PET_FRAMES;
