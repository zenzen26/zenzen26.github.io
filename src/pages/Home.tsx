import { useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Mail, Globe, ShieldCheck } from 'lucide-react';
import FeaturedProjects from '@/components/FeaturedProjects';
import IndustriesTech from '@/components/IndustriesTech';
import StickyExperience from '@/components/StickyExperience';
import FooterResume from '@/components/FooterResume';
import StickyAnchor from '@/components/StickyAnchor';
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

const heroTech = ['React', 'TypeScript', 'Docker', 'n8n', 'PHP'];

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

      {/* Hero — welcome window | draggable 3D Mac | status window */}
      <section id="hero" className="min-h-screen pt-20 pb-10 flex items-center">
        <Container className="w-full lg:pr-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <MacWindow title="Welcome.txt" reveal bodyClassName="p-6">
                <h1 className="h1 mb-3">ZEN<span className="text-moss">ZEN</span></h1>
                <p className="b1 text-moss mb-4">Web Developer &amp; Server Engineer</p>
                <p className="b1 text-ink/80">
                  Full-stack web development, server management, and AI workflow automation with n8n. I build and ship
                  reliable systems end to end, combining technology, design, and creativity to deliver engaging digital experiences.
                </p>
              </MacWindow>
            </div>

            <div className="lg:col-span-4 order-1 lg:order-2 h-[52vh] lg:h-[68vh]">
              <Suspense fallback={<div className="size-full flex items-center justify-center"><PixelCat scale={10} className="animate-pixel-bob" /></div>}>
                <Mac3D className="size-full" />
              </Suspense>
            </div>

            <div className="lg:col-span-4 order-3">
              <MacWindow title="Status" reveal bodyClassName="p-6">
                <div className="inline-flex items-center gap-2 bg-phosphor border-2 border-ink px-3 mb-5 b2">
                  <span className="size-3 bg-ink animate-pixel-bob" /> OPEN TO WORK
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button onClick={() => scrollTo('#projects')} className="bevel-out px-6 py-2 bg-moss text-white b2 cursor-pointer hover:bg-ink">
                    View Projects
                  </button>
                  <button onClick={() => scrollTo('#footer')} className="bevel-out px-6 py-2 bg-beige b2 cursor-pointer hover:bg-ink hover:text-white">
                    Contact Me
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {heroTech.map((tech) => (
                    <span key={tech} className="b3 px-2 bg-beige border-2 border-ink">{tech}</span>
                  ))}
                </div>
              </MacWindow>
            </div>
          </div>
        </Container>
      </section>

      <section id="projects" className="py-20 crt">
        <Container>
          <MacWindow title="Macintosh HD — Featured Projects" reveal className="text-ink" bodyClassName="p-6 sm:p-10">
            <FeaturedProjects projects={featuredProjects} />
            <div className="mt-10 text-center">
              <Link to="/projects" className="bevel-out inline-block px-6 py-2 bg-beige b2 hover:bg-ink hover:text-white">
                Open all projects →
              </Link>
            </div>
          </MacWindow>
        </Container>
      </section>

      <IndustriesTech />

      <section className="py-16 sm:py-20 bg-grey/30">
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
