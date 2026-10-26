import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { RESET_VIEW_EVENT } from '@/lib/viewReset';

gsap.registerPlugin(Draggable);

interface MacWindowProps {
  title: string;
  children: React.ReactNode;
  /** Shows a close box in the title bar. */
  onClose?: () => void;
  /** Animate in/out on scroll (see useWindowReveal). */
  reveal?: boolean;
  /** Drag by the title bar on wide screens (xl+); returns home on "Reset view". */
  draggable?: boolean;
  className?: string;
  /** Title bar colour classes (default beige). Include a text colour for dark bars. */
  barClassName?: string;
  bodyClassName?: string;
}

/** Base classic-Mac window: pinstripe title bar, close box, beveled frame. */
export default function MacWindow({
  title,
  children,
  onClose,
  reveal = false,
  draggable = false,
  className = '',
  barClassName = 'bg-beige',
  bodyClassName = '',
}: MacWindowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!draggable || !root || !bar) return;

    const wide = window.matchMedia('(min-width: 1280px)');
    let drag: Draggable | undefined;

    // Stacked layouts (below xl) keep windows in the page flow, so dragging only exists on wide screens.
    const sync = () => {
      drag?.kill();
      drag = undefined;
      gsap.set(root, { x: 0, y: 0 });
      if (wide.matches) {
        drag = Draggable.create(root, {
          type: 'x,y',
          trigger: bar,
          bounds: document.getElementById('hero') ?? undefined,
        })[0];
      }
    };
    const home = () => { gsap.to(root, { x: 0, y: 0, duration: 0.5, ease: 'back.out(1.4)' }); };

    sync();
    wide.addEventListener('change', sync);
    window.addEventListener(RESET_VIEW_EVENT, home);
    return () => {
      drag?.kill();
      wide.removeEventListener('change', sync);
      window.removeEventListener(RESET_VIEW_EVENT, home);
    };
  }, [draggable]);

  return (
    <div
      ref={rootRef}
      data-win={reveal ? '' : undefined}
      className={`bevel-out bg-beige-light text-ink flex flex-col min-w-0 ${className}`}
    >
      <div ref={barRef} className={`flex items-center gap-2 border-b-2 border-ink ${barClassName} px-2 py-1 ${draggable ? 'xl:cursor-grab xl:active:cursor-grabbing select-none' : ''}`}>
        <span className="size-7 shrink-0" />
        <span className="titlebar-stripes h-4 flex-1" />
        <span className="font-pixel b2 px-2 bg-inherit truncate max-w-[90%]">{title}</span>
        <span className="titlebar-stripes h-4 flex-1" />
        {onClose ? (
          <button
            type="button"
            aria-label="Close window"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center border-2 border-ink bg-beige-light text-ink hover:bg-ink hover:text-beige-light cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <span className="size-7 shrink-0" />
        )}
      </div>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
