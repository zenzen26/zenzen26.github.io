import { useState } from 'react';
import type { Project } from '@/types';
import ProjectTile from '@/components/ProjectTile';
import ProjectModal from '@/components/ProjectModal';

interface FeaturedProjectsProps {
  projects: Project[];
}

/** Bento of project windows (first one is the big hero tile); clicking one opens its detail window. */
export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project, i) => (
          <ProjectTile
            key={project.id}
            project={project}
            reveal
            large={i === 0}
            className={i === 0 ? 'xl:col-span-2 xl:row-span-2' : ''}
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
