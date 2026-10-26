import { useState } from 'react';
import MacWindow from '@/components/ui/MacWindow';
import ModalOverlay from '@/components/ui/ModalOverlay';

const TECH = ['React', 'TypeScript', 'Docker', 'n8n', 'PHP'];
const PHOTO = '/images/cat.webp';
const PHOTO_THUMB = '/images/cat-thumb.webp';
const PHOTO_ALT = 'Zenzen at work, smiling at the camera';

/** "About.txt": selfie (click to enlarge), the full intro paragraph and tech chips. Sits beside (xl) or under the 3D hero. */
export default function HeroIntro({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MacWindow title="About.txt" draggable className={className} bodyClassName="p-4">
        <figure className="mb-4">
          <button
            type="button"
            aria-label="Open photo"
            onClick={() => setOpen(true)}
            className="bevel-in block w-full bg-forest overflow-hidden aspect-[16/10] cursor-zoom-in"
          >
            <img
              src={PHOTO_THUMB}
              alt={PHOTO_ALT}
              width={720}
              height={960}
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-[50%_30%]"
            />
          </button>
          <figcaption className="b3 text-ink/60 mt-1 text-center">zenzen @ 2024 · Sydney, NSW · click to enlarge</figcaption>
        </figure>

        <div className="inline-flex items-center gap-2 bg-phosphor border-2 border-ink px-3 mb-3 b3">
          <span className="size-2 bg-ink animate-pixel-bob" /> OPEN TO WORK
        </div>
        <p className="b2 mb-4">
          Full-stack web development, server management, and AI workflow automation with n8n. I build and ship reliable
          systems end to end, combining technology, design, and creativity to deliver engaging digital experiences.
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map((tech) => (
            <span key={tech} className="b3 px-2 bg-beige border-2 border-ink">{tech}</span>
          ))}
        </div>
      </MacWindow>

      {open && (
        <ModalOverlay title="zenzen.png" onClose={() => setOpen(false)} widthClassName="max-w-3xl">
          <img src={PHOTO} alt={PHOTO_ALT} className="mx-auto max-h-[75vh] w-auto object-contain" />
        </ModalOverlay>
      )}
    </>
  );
}
