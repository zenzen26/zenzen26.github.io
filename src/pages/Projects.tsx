import { useState, useMemo, useRef } from 'react';
import { Search, Calendar, ArrowUp, ArrowDown, LayoutGrid, List } from 'lucide-react';
import { useCSVData } from '@/hooks/useCSVData';
import { useWindowReveal } from '@/hooks/useWindowReveal';
import type { Project } from '@/types';
import FooterResume from '@/components/FooterResume';
import Container from '@/components/ui/Container';
import FloppyIcon from '@/components/ui/FloppyIcon';
import MacWindow from '@/components/ui/MacWindow';
import PageLoader from '@/components/ui/PageLoader';
import TypeBadge from '@/components/ui/TypeBadge';
import ProjectModal from '@/components/ProjectModal';
import { floppyToneMap } from '@/lib/colorMaps';

const btn = (active: boolean) =>
  `bevel-out px-3 py-1 b2 whitespace-nowrap cursor-pointer ${active ? 'bg-ink text-beige-light' : 'bg-beige hover:bg-ink hover:text-beige-light'}`;

/** Finder-style browser for every project: icon view (floppies) or list view. */
export default function Projects() {
  const { data: projects, loading } = useCSVData<Project>('/data/projects.csv');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [view, setView] = useState<'icons' | 'list'>('icons');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useWindowReveal(pageRef, [loading]);

  const types = useMemo(() => {
    if (!projects.length) return ['All'];
    // Fixed display order; any unexpected type is appended alphabetically after.
    const order = ['Web', 'Data', 'AI'];
    const present = [...new Set(projects.map((p) => p.type))];
    return ['All', ...order.filter((t) => present.includes(t)), ...present.filter((t) => !order.includes(t)).sort()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return projects
      .filter((p) => {
        const matchesType = typeFilter === 'All' || p.type === typeFilter;
        const matchesSearch = [p.title, p.description, p.tech_stack].some((f) => f.toLowerCase().includes(q));
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [projects, typeFilter, search, sortDirection]);

  if (loading) return <PageLoader />;

  return (
    <div ref={pageRef} className="min-h-screen">
      <div className="pt-20 sm:pt-24 pb-20">
        <Container>
          <MacWindow title={`Finder — Projects (${filteredProjects.length} of ${projects.length})`} reveal bodyClassName="flex flex-col">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center p-4 border-b-2 border-ink bg-beige">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bevel-in w-full bg-white pl-10 pr-3 py-1 b2 outline-none focus:bg-phosphor/20"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {types.map((type) => (
                  <button key={type} onClick={() => setTypeFilter(type)} className={btn(typeFilter === type)}>{type}</button>
                ))}
              </div>

              <div className="flex gap-2 lg:ml-auto">
                <button onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))} className={`${btn(false)} flex items-center gap-2`}>
                  <Calendar size={16} />
                  {sortDirection === 'desc' ? 'Newest' : 'Oldest'}
                  {sortDirection === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                </button>
                <button aria-label="Icon view" onClick={() => setView('icons')} className={btn(view === 'icons')}><LayoutGrid size={18} /></button>
                <button aria-label="List view" onClick={() => setView('list')} className={btn(view === 'list')}><List size={18} /></button>
              </div>
            </div>

            {/* Contents */}
            <div className="p-6 sm:p-8 bg-white min-h-[50vh]">
              {view === 'icons' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 justify-items-center">
                  {filteredProjects.map((project) => (
                    <FloppyIcon
                      key={project.id}
                      label={project.title}
                      caption={`${project.type} · ${project.date}`}
                      imageUrl={project.image_url}
                      tone={floppyToneMap[project.color_tag] ?? 'ink'}
                      onClick={() => setSelectedProject(project)}
                    />
                  ))}
                </div>
              ) : (
                <ul className="divide-y-2 divide-ink/10">
                  {filteredProjects.map((project) => (
                    <li key={project.id}>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="w-full flex items-center gap-4 px-2 py-2 text-left cursor-pointer hover:bg-ink hover:text-beige-light"
                      >
                        <TypeBadge type={project.type} />
                        <span className="b1 flex-1 truncate">{project.title}</span>
                        <span className="b2 hidden sm:inline opacity-60 truncate max-w-[30%]">{project.category}</span>
                        <span className="b2 opacity-60">{project.date}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <p className="h3 text-ink/40 mb-4">No projects found</p>
                  <button
                    onClick={() => { setTypeFilter('All'); setSearch(''); setSortDirection('desc'); }}
                    className="bevel-out px-6 py-2 bg-beige b2 cursor-pointer hover:bg-ink hover:text-white"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </MacWindow>
        </Container>
      </div>

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

      <FooterResume />
    </div>
  );
}
