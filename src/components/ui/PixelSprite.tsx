const FILL: Record<string, string> = {
  '#': 'fill-ink',
  g: 'fill-phosphor',
  p: 'fill-grey',
  w: 'fill-white',
};

interface PixelSpriteProps {
  /** Rows of characters; see FILL for the palette. Rows may differ in length. */
  grid: readonly string[];
  /** Rendered size of one art pixel, in px. */
  scale?: number;
  className?: string;
}

/** Base renderer for every pixel-art sprite (cat face, desktop pet frames). */
export default function PixelSprite({ grid, scale = 4, className = '' }: PixelSpriteProps) {
  const width = Math.max(...grid.map((row) => row.length));
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${grid.length}`}
      width={width * scale}
      height={grid.length * scale}
      shapeRendering="crispEdges"
      className={className}
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) =>
          FILL[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className={FILL[ch]} /> : null
        )
      )}
    </svg>
  );
}
