import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Experience } from '@/types';
import ExperiencePopup from './ExperiencePopup';
import './StickyExperience.css';

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
    // Only wire up GSAP on md+ (>=768px)
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!isDesktop) return;

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
        '.ticket-card',
        { y: 100, opacity: 0, rotation: -5 },
        {
          y: 0,
          opacity: 1,
          rotation: -1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [experiences]);

  const colorClasses: Record<string, string> = {
    green: 'border-l-green',
    amber: 'border-l-amber',
    red: 'border-l-red',
    black: 'border-l-black',
  };

  const badgeClasses: Record<string, string> = {
    green: 'bg-green',
    amber: 'bg-amber',
    red: 'bg-red',
    black: 'bg-black',
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="bg-paper-dark md:overflow-hidden"
      >
        <div className="flex flex-col justify-center py-20 md:h-screen">

          {/* Header */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24 w-full mb-8">
            <div className="ticket-line mb-8" />
            <div className="mb-4">
              <h2 className="h2">
                Work <span className="text-green">Experience</span>
              </h2>
            </div>
            <p className="b1 text-black/60 max-w-3xl mb-4">
              <span className="md:hidden">Swipe right to explore my journey. Tap any card for details.</span>
              <span className="hidden md:inline">Keep scrolling down to see my professional journey. Click on any card to view the details.</span>
            </p>
          </div>

          {/*
            Scroll track:
              - mobile/tablet (<md): overflow-x-auto, full viewport width → native swipe
              - desktop (md+): overflow visible → GSAP translates innerRowRef
          */}
          <div
            className="w-screen overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Inner flex row — always wider than the viewport */}
            <div
              ref={innerRowRef}
              className="flex gap-6 will-change-transform py-4 pl-4 sm:pl-6 lg:pl-8 xl:pl-12 2xl:pl-16 4xl:pl-24"
              style={{ width: 'max-content' }}
            >
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`ticket-card chef-ticket w-[300px] sm:w-[340px] flex-shrink-0 snap-start snap-always cursor-pointer group ${colorClasses[exp.color]} border-l-4`}
                  style={{
                    marginTop: index % 2 === 0 ? '0px' : '30px',
                    transform: `rotate(${-2 + index}deg)`,
                  }}
                >
                  <div className="p-5 pt-8">
                    <span className={`${badgeClasses[exp.color]} text-white b3 px-2 py-1 inline-block mb-3`}>
                      {exp.type}
                    </span>

                    <h3 className="h4 mb-1 group-hover:text-amber transition-colors">
                      {exp.role}
                    </h3>
                    <p className="b1 text-amber mb-3">@ {exp.company}</p>

                    <div className="flex items-center gap-2 text-black/50 b2 mb-3">
                      <Calendar size={14} />
                      {exp.duration}
                    </div>

                    <p className="b2 text-black/70 line-clamp-3 mb-4 border-t border-dashed border-black/20 pt-3">
                      {exp.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {exp.tech_stack.split(',').slice(0, 3).map((tech) => (
                        <span key={tech} className="b3 px-2 py-0.5 bg-black/5 border border-black/10">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                      <span className="b3 text-black/40">
                        <span className="md:hidden">Tap for details</span>
                        <span className="hidden md:inline">Click for details</span>
                      </span>
                      <ArrowRight size={16} className="text-amber opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}

              {showEndCard && (
                <div className="ticket-card chef-ticket w-[280px] flex-shrink-0 snap-start snap-always flex items-center justify-center bg-amber self-center border-l-4 border-black">
                  <div className="text-center p-8">
                    <h3 className="h4 mb-4 text-black">That's all!</h3>
                    <p className="b2 text-black/70 mb-6">Want to see more?</p>
                    <a
                      href="#footer"
                      className="inline-block px-6 py-3 bg-black text-white b2 hover:bg-white hover:text-black transition-colors border-2 border-black"
                    >
                      Get In Touch →
                    </a>
                  </div>
                </div>
              )}

              {/* Right spacer */}
              <div className="w-4 sm:w-6 lg:w-8 xl:w-12 2xl:w-16 4xl:w-24 flex-shrink-0" />
            </div>
          </div>

          {/* Bottom Ticket Line */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24 w-full mt-8">
            <div className="ticket-line" />
          </div>
        </div>
      </section>

      <ExperiencePopup
        experience={selectedExp}
        onClose={() => setSelectedExp(null)}
      />
    </>
  );
}