import { ExternalLink, Github, Calendar, Tag } from 'lucide-react';
import ModalOverlay from '@/components/ui/ModalOverlay';
import TechStack from '@/components/ui/TechStack';
import TypeBadge from '@/components/ui/TypeBadge';
import type { Project } from '@/types';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

const SECTIONS = [
  { key: 'challenges', label: 'Challenges' },
  { key: 'solution', label: 'Solution' },
  { key: 'outcome', label: 'Outcome' },
] as const;

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <ModalOverlay title={`${project.title}.app`} onClose={onClose}>
      {project.image_url && (
        <div className="h-56 sm:h-72 bg-forest border-b-2 border-ink">
          <div className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${project.image_url})` }} />
        </div>
      )}

      <div className="p-5 sm:p-8">
        <h2 className="h3 mb-4">{project.title}</h2>

        <div className="flex flex-wrap items-center gap-3 mb-6 b2">
          <TypeBadge type={project.type} withIcon={<Tag size={14} />} />
          <span className="b3 px-2 border-2 border-ink bg-white">{project.category}</span>
          <span className="flex items-center gap-1 text-ink/60"><Calendar size={16} /> {project.date}</span>
        </div>

        <p className="b1 mb-8">{project.detail_description || project.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {SECTIONS.map(({ key, label }) =>
              project[key] ? (
                <div key={key}>
                  <h3 className="h4 mb-2 text-moss">{label}</h3>
                  <p className="b1 text-ink/80">{project[key]}</p>
                </div>
              ) : null
            )}
          </div>

          <div className="space-y-6">
            <div className="bevel-in bg-white p-4">
              <h3 className="h4 mb-3">Tech Stack</h3>
              <TechStack stack={project.tech_stack} />
            </div>

            <div className="flex flex-col gap-3">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="bevel-out flex items-center justify-center gap-2 px-6 py-2 bg-moss text-white b2 hover:bg-ink">
                  <ExternalLink size={18} /> Live Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="bevel-out flex items-center justify-center gap-2 px-6 py-2 bg-beige b2 hover:bg-ink hover:text-white">
                  <Github size={18} /> View Code
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
