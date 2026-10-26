import { useEffect, useMemo, type ReactNode } from 'react';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

interface RoundedBoxProps {
  /** [width, height, depth] */
  args: [number, number, number];
  radius?: number;
  /** Segments per rounded corner. */
  smoothness?: number;
  position?: [number, number, number];
  /** Pass the <meshStandardMaterial> as a child, like any r3f mesh. */
  children?: ReactNode;
}

/** A box with rounded edges (three's RoundedBoxGeometry as an r3f mesh), instead of pulling in all of drei for it. */
export default function RoundedBox({ args, radius = 0.05, smoothness = 2, position, children }: RoundedBoxProps) {
  const [width, height, depth] = args;
  const geometry = useMemo(
    () => new RoundedBoxGeometry(width, height, depth, smoothness, radius),
    [width, height, depth, smoothness, radius]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={position}>
      {children}
    </mesh>
  );
}
