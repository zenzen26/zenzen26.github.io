import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RotateCcw } from 'lucide-react';
import FeaturedProjects from '@/components/FeaturedProjects';
import FooterResume from '@/components/FooterResume';
import HelpButton from '@/components/HelpButton';
import HeroHelp from '@/components/HeroHelp';
import HeroIntro from '@/components/HeroIntro';
import IndustriesTech from '@/components/IndustriesTech';
import MacHero from '@/components/MacHero';
import ReadmeWindow from '@/components/ReadmeWindow';
import StickyAnchor from '@/components/StickyAnchor';
import StickyExperience from '@/components/StickyExperience';
import Container from '@/components/ui/Container';
import { useCSVData } from '@/hooks/useCSVData';
import { useWindowReveal } from '@/hooks/useWindowReveal';
import { resetView } from '@/lib/viewReset';
import type { Project, Experience } from '@/types';

export default function Home() {
  const { data: projects, loading: projectsLoading } = useCSVData<Project>('/data/projects.csv');
  const { data: experiences, loading: expLoading } = useCSVData<Experience>('/data/experience.csv');
  const pageRef = useRef<HTMLDivElement>(null);
  const loaded = !projectsLoading && !expLoading;

  useWindowReveal(pageRef, [loaded]);

  useEffect(() => {
    if (loaded) ScrollTrigger.refresh();
  }, [loaded]);

  const featuredProjects = projects
    .filter((p) => p.featured)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6);

  return (
    <div ref={pageRef} className="relative">
      {loaded && <StickyAnchor />}

      {/* Hero: paints immediately (it does not wait for the data files); the 3D Mac IS the hero, its screen carries the intro */}
      <section id="hero" className="relative pt-12 pb-6">
        <h1 className="sr-only">ZENZEN — Web Developer &amp; Bio Enthusiast</h1>
        <div className="h-[calc(100svh-4rem)] min-h-[520px]">
          <MacHero projects={projects} experiences={experiences} />
        </div>

        <div className="absolute right-4 top-16 z-20 flex items-center gap-2">
          <HelpButton className="xl:hidden" />
          <button
            type="button"
            onClick={resetView}
            className="bevel-out flex items-center gap-2 bg-beige text-ink px-3 py-1 b2 cursor-pointer hover:bg-ink hover:text-beige-light"
          >
            <RotateCcw size={16} /> Reset view
          </button>
        </div>

        {/* Wide screens: commands left, About right; smaller screens: About under the Mac, commands behind a button */}
        <div className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 z-10 w-80">
          <HeroHelp />
        </div>
        <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10 w-96 2xl:w-[28rem]">
          <HeroIntro />
        </div>
        <Container className="xl:hidden mt-6 md:max-w-2xl">
          <HeroIntro />
        </Container>
      </section>

      {loaded ? (
        <>
          <section id="projects" className="py-20 bg-forest-deep">
            <Container>
              <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="h2 text-phosphor">Featured Projects</h2>
                <Link to="/projects" className="bevel-out self-start bg-beige text-ink px-6 py-2 b2 hover:bg-ink hover:text-white">
                  Open all projects →
                </Link>
              </div>
              <FeaturedProjects projects={featuredProjects} />
            </Container>
          </section>

          <IndustriesTech />

          <section className="py-16 sm:py-20 bg-moss/25">
            <Container>
              <ReadmeWindow />
            </Container>
          </section>

          <StickyExperience experiences={experiences} showEndCard />

          <FooterResume />
        </>
      ) : (
        // keeps the page tall while the data files load, so nothing jumps when the sections arrive
        <div className="min-h-screen" aria-hidden="true" />
      )}
    </div>
  );
}
