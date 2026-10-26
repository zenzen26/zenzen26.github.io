import { useState } from 'react';
import type { Project } from '@/types';
import ProjectTile from '@/components/ProjectTile';
import ProjectModal from '@/components/ProjectModal';

interface FeaturedProjectsProps {
  projects: Project[];
}

/** Big-thumbnail project windows; clicking one opens its detail window. */
export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project) => (
          <ProjectTile key={project.id} project={project} reveal onClick={() => setSelectedProject(project)} />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}
