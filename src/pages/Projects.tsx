import { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useCSVData } from '@/hooks/useCSVData';
import type { Project } from '@/types';
import FooterResume from '@/components/FooterResume';
import Container from '@/components/ui/Container';
import PageLoader from '@/components/ui/PageLoader';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { data: projects, loading } = useCSVData<Project>('/data/projects.csv');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const types = useMemo(() => {
    if (!projects.length) return ['All'];
    // Fixed display order; any unexpected type is appended alphabetically after.
    const order = ['Web', 'Data', 'AI'];
    const present = [...new Set(projects.map((p) => p.type))];
    const ordered = [
      ...order.filter((t) => present.includes(t)),
      ...present.filter((t) => !order.includes(t)).sort(),
    ];
    return ['All', ...ordered];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((p) => {
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tech_stack.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [projects, typeFilter, search, sortDirection]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.trigger === gridRef.current) t.kill();
      });

      gsap.fromTo(
        '.project-tile',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
        }
      );
    }
  }, [loading, filteredProjects]);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen">
      <div className="pt-20 sm:pt-24 pb-20">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="h2 mb-4">All Projects</h1>
            <p className="b1 text-black/60 max-w-2xl">
              A collection of my work spanning web development, data visualization, and AI experiments.
              Click any project to view details.
            </p>
          </div>

          {/* Sticky filters */}
          <div className="flex flex-col gap-4 mb-6 sticky top-20 bg-paper/95 backdrop-blur-sm py-4 z-30 border-b-2 border-black/5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black/20 font-share-tech focus:border-amber outline-none transition-colors"
                />
              </div>

              {/* Type filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <span className="font-share-tech text-sm text-black/60 self-center mr-2 whitespace-nowrap">Type:</span>
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 font-share-tech text-sm whitespace-nowrap border-2 transition-all ${
                      typeFilter === type
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black/20 hover:border-amber'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Sort toggle */}
              <button
                onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="flex items-center gap-2 px-4 py-2 font-share-tech text-sm border-2 border-black/20 hover:border-amber transition-all whitespace-nowrap"
              >
                <Calendar size={16} />
                {sortDirection === 'desc' ? 'Most Recent' : 'Oldest First'}
                {sortDirection === 'desc'
                  ? <ArrowDown size={16} className="text-amber" />
                  : <ArrowUp size={16} className="text-amber" />}
              </button>
            </div>
          </div>

          {/* Result count */}
          <p className="b2 text-black/60 mb-6">
            Showing {filteredProjects.length} of {projects.length} projects
            <span className="ml-2 text-black/40">
              • Sorted by date ({sortDirection === 'desc' ? 'most recent' : 'oldest first'})
            </span>
          </p>

          {/* Grid */}
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => setSelectedProject(project)}
                className="project-tile"
              />
            ))}
          </div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="h3 text-black/40">No projects found</p>
              <button
                onClick={() => { setTypeFilter('All'); setSearch(''); setSortDirection('desc'); }}
                className="mt-4 px-6 py-2 bg-amber font-share-tech text-sm hover:bg-black hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </Container>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      <FooterResume />
    </div>
  );
}