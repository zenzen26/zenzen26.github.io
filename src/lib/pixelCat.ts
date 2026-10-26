/**
 * 14×13 pixel-art cat face. One source of truth for every pixel cat in the
 * site (PixelCat component, the 3D Mac's screen texture).
 *   #  ink     g  phosphor (eyes)     p  grey (nose)     w  white (mouth)
 */
export const PIXEL_CAT_GRID = [
  '##..........##',
  '###........###',
  '##############',
  '##############',
  '###gg####gg###',
  '###gg####gg###',
  '##############',
  '######pp######',
  '#####w##w#####',
  '######ww######',
  '##############',
  '.############.',
  '..##########..',
];

/** Reads a theme token (e.g. "phosphor") as a CSS colour, for canvas drawing. */
export const themeColor = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
