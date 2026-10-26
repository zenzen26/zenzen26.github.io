import { useState } from 'react';
import type { Project } from '@/types';
import FloppyIcon from '@/components/ui/FloppyIcon';
import ProjectModal from '@/components/ProjectModal';
import { floppyToneMap } from '@/lib/colorMaps';

interface FeaturedProjectsProps {
  projects: Project[];
}

/** Desktop of project floppy disks; clicking one opens its detail window. */
export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 justify-items-center">
        {projects.map((project) => (
          <FloppyIcon
            key={project.id}
            label={project.title}
            caption={project.type}
            imageUrl={project.image_url}
            tone={floppyToneMap[project.color_tag] ?? 'ink'}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}
