import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Mail, Globe, ShieldCheck, PawPrint } from 'lucide-react';
import FeaturedProjects from '@/components/FeaturedProjects';
import IndustriesTech from '@/components/IndustriesTech';
import StickyExperience from '@/components/StickyExperience';
import PageLoader from '@/components/ui/PageLoader';
import FooterResume from '@/components/FooterResume';
import StickyAnchor from '@/components/StickyAnchor';
import Container from '@/components/ui/Container';
import { useCSVData } from '@/hooks/useCSVData';
import type { Project, Experience } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const personalDetails = {
  languages: ['English (Native)', 'Mandarin (Native)'],
  certificates: ['iCAT Foundations', 'Working with Children Check', 'LCCI Level 2 in Bookkeeping & Accounting'],
  education: 'Bachelor of Computing Science (First Class Honours)',
  contact: ['+61 450 190 503', 'thamzien@gmail.com'],
};

export default function Home() {
  const { data: projects, loading: projectsLoading } = useCSVData<Project>('/data/projects.csv');
  const { data: experiences, loading: expLoading } = useCSVData<Experience>('/data/experience.csv');

  useEffect(() => {
    if (!projectsLoading && !expLoading) {
      ScrollTrigger.refresh();
    }
  }, [projectsLoading, expLoading]);

  if (projectsLoading || expLoading) {
    return <PageLoader withNavOffset={false} />;
  }

  const featuredProjects = projects
    .filter(p => p.featured)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6);

  return (
    <div className="relative">
      <StickyAnchor />

      {/* Hero — photo in amber frame (replaces the former Spline crystal) */}
      <section id="hero" className="min-h-screen pt-20 lg:pt-0 flex items-center overflow-hidden">
        <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)] lg:min-h-screen">

            {/* Photo */}
            <div className="lg:col-span-6 relative order-2 lg:order-1">
              <div className="relative">
                <div className="bg-amber aspect-[4/5] max-w-md mx-auto relative overflow-hidden border-4 border-black sketch-box shadow-2xl transform -rotate-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber to-[#FF8800]" />
                  <img src="/images/cat.webp" alt="Zenzen" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-white p-6 text-center">
                    <p className="b2 text-black/60">zenzen @ 2024</p>
                    <p className="b3 text-black/40 mt-1">Sydney, NSW</p>
                  </div>
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-amber/30 transform rotate-2" />
              </div>
            </div>

            {/* Intro copy */}
            <div className="lg:col-span-6 xl:pl-10 order-1 lg:order-2">
              <div className="inline-block mb-6 animate-pulse-rotate">
                <div className="bg-green text-white b2 px-4 py-2 border-4 border-green border-dashed">
                  OPEN TO WORK
                </div>
              </div>

              <h1 className="h1 leading-none mb-4 text-shadow-retro">
                ZEN<span className="text-amber">ZEN</span>
              </h1>

              <p className="b1 text-amber mb-6">
                Web Developer & Server Engineer
              </p>

              <p className="b1 text-black/80 max-w-md mb-8 leading-relaxed">
                Full-stack web development, server management, and AI workflow automation with n8n. I build and ship reliable systems end to end, combining technology, design, and creativity to deliver engaging digital experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative px-8 py-4 bg-red text-white b2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:cursor-pointer"
                >
                  <span className="relative z-10">View Projects</span>
                  <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => document.querySelector('#footer')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-amber text-black b2 hover:bg-amber hover:text-black transition-all hover:-translate-y-1 hover:cursor-pointer"
                >
                  Contact Me
                </button>
              </div>

              <div className="flex flex-wrap gap-2 b3">
                {['React', 'TypeScript', 'Docker', 'n8n', 'PHP'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-black/5 border border-black/10 hover:bg-amber/20 hover:border-amber transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-20">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
          <div className="mb-10 text-center">
            <h2 className="h2 inline-flex items-center gap-3">
              <PawPrint className="text-amber" size={36} /> Featured <span className="text-amber">Projects</span>
            </h2>
          </div>
          <FeaturedProjects projects={featuredProjects} />
        </div>
      </section>

      <IndustriesTech />

      {/* Personal Details (moved from the former About page, placed below Tech Stack) */}
      <section className="py-16 sm:py-20 bg-paper-dark">
        <Container>
          <h2 className="h3 mb-8 flex items-center gap-3"><PawPrint className="text-amber" size={32} /> Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Globe size={24} className="text-green" />, title: 'Languages', items: personalDetails.languages },
              { icon: <ShieldCheck size={24} className="text-amber" />, title: 'Certificates & Licenses', items: personalDetails.certificates },
              { icon: <GraduationCap size={24} className="text-red" />, title: 'Education', items: [personalDetails.education] },
              { icon: <Mail size={24} className="text-black" />, title: 'Contact', items: personalDetails.contact },
            ].map(({ icon, title, items }) => (
              <div key={title} className="border-2 border-black p-6 bg-white sketch-box">
                <div className="flex items-center gap-5 mb-3">
                  {icon}
                  <h4 className="h4">{title}</h4>
                </div>
                <ul className="b2 space-y-1 text-black/70">
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <StickyExperience experiences={experiences} showEndCard={true} />

      <FooterResume />
    </div>
  );
}
