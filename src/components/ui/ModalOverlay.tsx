import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import MacWindow from '@/components/ui/MacWindow';

interface ModalOverlayProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Max-width class for the window (default max-w-5xl) */
  widthClassName?: string;
}

/**
 * Full-screen dimmer + a Mac window that zooms open. Used by project and experience details,
 * the photo and the commands list. Rendered into <body>: a draggable or animated parent window has a
 * CSS transform, which would otherwise trap a position:fixed popup inside that window.
 */
export default function ModalOverlay({ title, onClose, children, widthClassName = 'max-w-5xl' }: ModalOverlayProps) {
  const winRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!winRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.fromTo(winRef.current, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'steps(5)' });
    return () => { tween.kill(); };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-forest/80 cursor-pointer"
      onClick={onClose}
    >
      <div ref={winRef} className={`w-full ${widthClassName} max-h-[90vh] flex cursor-auto`} onClick={(e) => e.stopPropagation()}>
        <MacWindow title={title} onClose={onClose} className="w-full" bodyClassName="overflow-y-auto">
          {children}
        </MacWindow>
      </div>
    </div>,
    document.body
  );
}
