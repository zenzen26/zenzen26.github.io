import { PIXEL_CAT_GRID, PIXEL_CAT_WIDTH, PIXEL_CAT_HEIGHT } from '@/lib/pixelCat';

const FILL: Record<string, string> = {
  '#': 'fill-ink',
  g: 'fill-phosphor',
  p: 'fill-grey',
  w: 'fill-white',
};

interface PixelCatProps {
  /** Rendered width of one art pixel, in px (default 4 → 56px wide). */
  scale?: number;
  className?: string;
}

export default function PixelCat({ scale = 4, className = '' }: PixelCatProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${PIXEL_CAT_WIDTH} ${PIXEL_CAT_HEIGHT}`}
      width={PIXEL_CAT_WIDTH * scale}
      height={PIXEL_CAT_HEIGHT * scale}
      shapeRendering="crispEdges"
      className={className}
    >
      {PIXEL_CAT_GRID.flatMap((row, y) =>
        [...row].map((ch, x) =>
          FILL[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className={FILL[ch]} /> : null
        )
      )}
    </svg>
  );
}
