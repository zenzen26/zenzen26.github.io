import { Fragment, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RotateCcw, LoaderCircle } from 'lucide-react';
import FeaturedProjects from '@/components/FeaturedProjects';
import IndustriesTech from '@/components/IndustriesTech';
import StickyExperience from '@/components/StickyExperience';
import FooterResume from '@/components/FooterResume';
import StickyAnchor from '@/components/StickyAnchor';
import HeroHelp from '@/components/HeroHelp';
import HelpButton from '@/components/HelpButton';
import HeroIntro from '@/components/HeroIntro';
import { resetView } from '@/lib/viewReset';
import Container from '@/components/ui/Container';
import MacWindow from '@/components/ui/MacWindow';
import PageLoader from '@/components/ui/PageLoader';
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
          <Suspense
            fallback={
              <div className="size-full flex flex-col items-center justify-center gap-3" role="status">
                <LoaderCircle size={44} className="animate-spin text-phosphor" />
                <span className="b1">Loading model...</span>
              </div>
            }
          >
            <Mac3D className="size-full" projects={projects} experiences={experiences} />
          </Suspense>
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
        <div className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 z-10 w-72">
          <HeroHelp />
        </div>
        <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10 w-96 2xl:w-[28rem]">
          <HeroIntro />
        </div>
        <Container className="xl:hidden mt-6 md:max-w-2xl">
          <HeroIntro />
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
          <MacWindow title="README.md" reveal className="mx-auto max-w-3xl" bodyClassName="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex shrink-0 flex-col items-center gap-2 sm:w-36">
                <div className="bevel-in bg-forest size-28 flex items-center justify-center">
                  <img src="/favicon.png" alt="" className="size-20 object-contain" />
                </div>
                <p className="font-pixel text-xl text-center">Zi En Tham</p>
                <p className="b3 text-ink/60">ZEN OS 1.0</p>
              </div>
              <dl className="flex-1 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 b2">
                {[
                  ['Languages', personalDetails.languages],
                  ['Certificates', personalDetails.certificates],
                  ['Education', [personalDetails.education]],
                  ['Contact', personalDetails.contact],
                ].map(([label, items]) => (
                  <Fragment key={label as string}>
                    <dt className="font-pixel text-moss">{label as string}</dt>
                    <dd>
                      {(items as string[]).map((item) => (
                        <div key={item}>{item}</div>
                      ))}
                    </dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </MacWindow>
        </Container>
      </section>

      <StickyExperience experiences={experiences} showEndCard={true} />

      <FooterResume />
    </div>
  );
}
