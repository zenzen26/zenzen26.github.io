import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Experience } from '@/types';
import MacWindow from '@/components/ui/MacWindow';
import TechStack from '@/components/ui/TechStack';
import ExperiencePopup from './ExperiencePopup';

gsap.registerPlugin(ScrollTrigger);

interface StickyExperienceProps {
  experiences: Experience[];
  showEndCard?: boolean;
}

export default function StickyExperience({ experiences, showEndCard = true }: StickyExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRowRef = useRef<HTMLDivElement>(null);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  useEffect(() => {
    // Horizontal pinned scroll only on md+ (>=768px)
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    const ctx = gsap.context(() => {
      const innerRow = innerRowRef.current;
      if (!innerRow) return;

      const scrollWidth = innerRow.scrollWidth - window.innerWidth + 200;

      gsap.to(innerRow, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${scrollWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      gsap.fromTo(
        '.exp-window',
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'steps(6)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [experiences]);

  return (
    <>
      <section id="experience" ref={sectionRef} className="bg-moss/25 md:overflow-hidden">
        <div className="flex flex-col justify-center py-20 md:h-screen">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24 w-full mb-8">
            <h2 className="h2 mb-3">Work Experience</h2>
            <p className="b1 text-ink/70 max-w-3xl">
              <span className="md:hidden">Swipe to explore my journey. Tap any window for details.</span>
              <span className="hidden md:inline">Keep scrolling to travel through my career. Click any window to open it.</span>
            </p>
          </div>

          {/* mobile: native swipe; desktop: GSAP translates innerRowRef */}
          <div className="w-screen overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div
              ref={innerRowRef}
              className="flex gap-6 will-change-transform py-4 pl-4 sm:pl-6 lg:pl-8 xl:pl-12 2xl:pl-16 4xl:pl-24"
              style={{ width: 'max-content' }}
            >
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`exp-window w-[300px] sm:w-[360px] flex-shrink-0 snap-start snap-always cursor-pointer group flex ${index % 2 ? 'mt-8' : ''}`}
                >
                  <MacWindow title={exp.company} className="w-full group-hover:-translate-y-1 transition-transform" bodyClassName="p-5">
                    <span className="b3 px-2 border-2 border-ink bg-phosphor inline-block mb-3">{exp.type}</span>
                    <h3 className="h4 mb-1">{exp.role}</h3>
                    <p className="b1 text-moss mb-3">@ {exp.company}</p>
                    <div className="flex items-center gap-2 text-ink/60 b2 mb-3">
                      <Calendar size={14} /> {exp.duration}
                    </div>
                    <p className="b2 text-ink/80 line-clamp-3 mb-4 border-t-2 border-dashed border-ink/30 pt-3">{exp.description}</p>
                    <TechStack stack={exp.tech_stack} limit={3} />
                    <div className="mt-4 flex items-center justify-between border-t-2 border-ink/20 pt-3">
                      <span className="b3 text-ink/50">
                        <span className="md:hidden">Tap for details</span>
                        <span className="hidden md:inline">Click for details</span>
                      </span>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </MacWindow>
                </div>
              ))}

              {showEndCard && (
                <div className="exp-window w-[280px] flex-shrink-0 snap-start snap-always flex self-center">
                  <MacWindow title="End of file" className="w-full" bodyClassName="p-8 text-center crt">
                    <h3 className="h4 mb-3">That's all!</h3>
                    <p className="b2 mb-6 opacity-80">Want to see more?</p>
                    <a href="#footer" className="bevel-out inline-block px-6 py-2 bg-beige text-ink b2 hover:bg-ink hover:text-white">
                      Get In Touch →
                    </a>
                  </MacWindow>
                </div>
              )}

              <div className="w-4 sm:w-6 lg:w-8 xl:w-12 2xl:w-16 4xl:w-24 flex-shrink-0" />
            </div>
          </div>
        </div>
      </section>

      <ExperiencePopup experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </>
  );
}
