import PixelCat from '@/components/ui/PixelCat';

interface PageLoaderProps {
  /** Add top padding when nav is visible (default: true) */
  withNavOffset?: boolean;
}

export default function PageLoader({ withNavOffset = true }: PageLoaderProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${withNavOffset ? 'pt-20' : ''}`}>
      <PixelCat scale={8} className="animate-pixel-bob" />
      <div className="h4">
        Loading<span className="cursor-blink">_</span>
      </div>
    </div>
  );
}
