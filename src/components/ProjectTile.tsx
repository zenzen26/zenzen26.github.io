import MacWindow from '@/components/ui/MacWindow';
import PixelCat from '@/components/ui/PixelCat';
import TechStack from '@/components/ui/TechStack';
import TypeBadge from '@/components/ui/TypeBadge';
import { typeColorMap } from '@/lib/colorMaps';
import type { Project } from '@/types';

interface ProjectTileProps {
  project: Project;
  onClick: () => void;
  /** Animate in/out on scroll (see useWindowReveal). */
  reveal?: boolean;
  /** Above-the-fold tile: load its image right away instead of lazily. */
  priority?: boolean;
}

/** Project as a Mac window with a large 16:10 thumbnail; used by Home and the Finder. */
export default function ProjectTile({ project, onClick, reveal = false, priority = false }: ProjectTileProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group h-full cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-phosphor"
    >
      <MacWindow
        title={project.title}
        reveal={reveal}
        barClassName={typeColorMap[project.type] ?? 'bg-beige'}
        className="h-full transition-transform group-hover:-translate-y-1"
        bodyClassName="p-3 flex flex-col gap-3"
      >
        <div className="bevel-in bg-forest overflow-hidden aspect-[16/10]">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={`${project.title} thumbnail`}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="size-full flex items-center justify-center">
              <PixelCat scale={8} />
            </div>
          )}
        </div>

        <div className="px-1 pb-1 space-y-2">
          <div className="flex items-center gap-2">
            <TypeBadge type={project.type} />
            <span className="b3 text-ink/60">{project.date}</span>
          </div>
          <h3 className="h4 line-clamp-1">{project.title}</h3>
          <p className="b2 text-ink/70 line-clamp-2">{project.description}</p>
          <TechStack stack={project.tech_stack} limit={3} />
        </div>
      </MacWindow>
    </div>
  );
}
