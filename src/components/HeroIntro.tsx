import MacWindow from '@/components/ui/MacWindow';

const TECH = ['React', 'TypeScript', 'Docker', 'n8n', 'PHP'];

/** "About.txt": selfie, the full intro paragraph and tech chips. Sits beside (xl) or under the 3D hero. */
export default function HeroIntro({ className = '' }: { className?: string }) {
  return (
    <MacWindow title="About.txt" draggable className={className} bodyClassName="p-4">
      <figure className="mb-4">
        <div className="bevel-in bg-forest overflow-hidden aspect-[5/4]">
          <img src="/images/cat.webp" alt="Zenzen at work, smiling at the camera" className="size-full object-cover object-top" />
        </div>
        <figcaption className="b3 text-ink/60 mt-1 text-center">zenzen @ 2024 · Sydney, NSW</figcaption>
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
  );
}
