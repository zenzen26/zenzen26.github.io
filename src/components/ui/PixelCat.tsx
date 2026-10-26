import PixelSprite from '@/components/ui/PixelSprite';
import { PIXEL_CAT_GRID } from '@/lib/pixelCat';

interface PixelCatProps {
  /** Rendered width of one art pixel, in px (default 4 → 56px wide). */
  scale?: number;
  className?: string;
}

export default function PixelCat({ scale = 4, className = '' }: PixelCatProps) {
  return <PixelSprite grid={PIXEL_CAT_GRID} scale={scale} className={className} />;
}
