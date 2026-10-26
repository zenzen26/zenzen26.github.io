import { useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Mail, Globe, ShieldCheck, RotateCcw } from 'lucide-react';
import FeaturedProjects from '@/components/FeaturedProjects';
import IndustriesTech from '@/components/IndustriesTech';
import StickyExperience from '@/components/StickyExperience';
import FooterResume from '@/components/FooterResume';
import StickyAnchor from '@/components/StickyAnchor';
import HeroHelp from '@/components/HeroHelp';
import HeroIntro from '@/components/HeroIntro';
import { resetView } from '@/lib/viewReset';
import Container from '@/components/ui/Container';
import MacWindow from '@/components/ui/MacWindow';
import PageLoader from '@/components/ui/PageLoader';
import PixelCat from '@/components/ui/PixelCat';
import { useCSVData } from '@/hooks/useCSVData';
import { useWindowReveal } from '@/hooks/useWindowReveal';
import type { Project, Experience } from '@/types';

// three.js is heavy: load the 3D Mac only for the Home hero.
const Mac3D = lazy(() => import('@/components/Mac3D'));

const personalDetails = {
  languages: ['English (Native)', 'Mandarin (Native)'],
  certificates: ['iCAT Foundations', 'Working with Children Check', 'LCCI Level 2 in Bookkeeping & Accounting'],
  education: 'Bachelor of Computing Science (First Class Honours)',
  contact: ['+61 450 190 503', 'thamzien@gmail.com'],
};

const scrollTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });

export default function Home() {
  const { data: projects, loading: projectsLoading } = useCSVData<Project>('/data/projects.csv');
  const { data: experiences, loading: expLoading } = useCSVData<Experience>('/data/experience.csv');
  const pageRef = useRef<HTMLDivElement>(null);
  const loaded = !projectsLoading && !expLoading;

  useWindowReveal(pageRef, [loaded]);

  useEffect(() => {
    if (loaded) ScrollTrigger.refresh();
  }, [loaded]);

  if (!loaded) return <PageLoader withNavOffset={false} />;

  const featuredProjects = projects
    .filter((p) => p.featured)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6);

  return (
    <div ref={pageRef} className="relative">
      <StickyAnchor />

      {/* Hero — the 3D Mac IS the hero; its screen carries the intro (see Mac3D) */}
      <section id="hero" className="relative pt-12 pb-6">
        <h1 className="sr-only">ZENZEN — Web Developer &amp; Server Engineer</h1>
        <div className="h-[calc(100svh-4rem)] min-h-[520px]">
          <Suspense fallback={<div className="size-full flex items-center justify-center"><PixelCat scale={10} className="animate-pixel-bob" /></div>}>
            <Mac3D className="size-full" />
          </Suspense>
        </div>

        <button
          type="button"
          onClick={resetView}
          className="bevel-out absolute right-4 top-16 z-20 flex items-center gap-2 bg-beige text-ink px-3 py-1 b2 cursor-pointer hover:bg-ink hover:text-beige-light"
        >
          <RotateCcw size={16} /> Reset view
        </button>

        {/* Wide screens: cheat-sheet left, About right; smaller screens stack them under the Mac */}
        <div className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 z-10 w-72">
          <HeroHelp />
        </div>
        <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10 w-96 2xl:w-[28rem]">
          <HeroIntro />
        </div>
        <Container className="xl:hidden mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <HeroIntro />
          <div className="hidden md:block">
            <HeroHelp />
          </div>
        </Container>
      </section>

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
          <MacWindow title="ReadMe — Personal Details" reveal bodyClassName="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Globe size={24} />, title: 'Languages', items: personalDetails.languages },
                { icon: <ShieldCheck size={24} />, title: 'Certificates & Licenses', items: personalDetails.certificates },
                { icon: <GraduationCap size={24} />, title: 'Education', items: [personalDetails.education] },
                { icon: <Mail size={24} />, title: 'Contact', items: personalDetails.contact },
              ].map(({ icon, title, items }) => (
                <div key={title} className="bevel-in bg-white p-5">
                  <div className="flex items-center gap-3 mb-3 text-moss">
                    {icon}
                    <h4 className="h4 text-ink">{title}</h4>
                  </div>
                  <ul className="b2 space-y-1 text-ink/80">
                    {items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </MacWindow>
        </Container>
      </section>

      <StickyExperience experiences={experiences} showEndCard={true} />

      <FooterResume />
    </div>
  );
}
