import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { bgTextColorMap, borderColorMap } from '@/lib/colorMaps';

gsap.registerPlugin(ScrollTrigger);

const industries = [
  { name: 'Web Dev', color: 'green', tagline: 'Building attractive web experiences' },
  { name: 'Server & DevOps', color: 'green', tagline: 'Reliable, scalable infrastructure' },
  { name: 'AI Automation', color: 'black', tagline: 'Smart workflows with n8n' },
  { name: 'FinTech', color: 'black', tagline: 'Simplifying finance through tech' },
  { name: 'Analyst', color: 'black', tagline: 'Turning data into insight' },
];

const skills = {
  Frontend: { color: 'green', items: ['React', 'TypeScript', 'Tailwind CSS', 'ThreeJS', 'GSAP'] },
  Backend: { color: 'amber', items: ['PHP', 'Python', 'MySQL', 'PostgreSQL', 'NextJS', 'Redis', 'REST APIs'] },
  'Server & DevOps': { color: 'green', items: ['Docker', 'Nginx', 'Traefik', 'GitHub Actions', 'Cloudflare', 'Linux', 'MariaDB'] },
  'AI & Automation': { color: 'black', items: ['n8n', 'LangChain', 'TensorFlow', 'PyTorch', 'scikit-learn'] },
  Analytics: { color: 'red', items: ['Pandas', 'SQL', 'Tableau', 'PowerBI', 'Excel'] },
  Other: { color: 'black', items: ['Git', 'Vercel', 'Vite', 'Figma', 'Spline', 'Framer', 'Wordpress'] },
};

interface IndustriesTechStackProps {
  showTitle?: boolean;
  className?: string;
}

export default function IndustriesTechStack({ showTitle = true, className = '' }: IndustriesTechStackProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.industry-card',
        { y: 50, opacity: 0, rotation: () => Math.random() * 10 - 5 },
        { 
          y: 0, opacity: 1, rotation: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } 
        }
      );
      gsap.fromTo('.skill-category',
        { y: 30, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.5, stagger: 0.15,
          scrollTrigger: { trigger: '.skills-grid', start: 'top 85%' } 
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={`py-20 sm:py-24 md:py-32 ${className}`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
        
        {/* Industries */}
        <div className="mb-20">
          {showTitle && (
            <div className="mb-10 text-center">
              <h2 className="h2">
                Target <span className="text-amber">Industries</span>
              </h2>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className={`industry-card ${bgTextColorMap[industry.color]} p-6 text-center border-2 border-black sketch-box transform transition-all duration-300 hover:-translate-y-2 hover:rotate-2 hover:shadow-lg cursor-default`}
              >
                <h3 className="h4 mb-2">{industry.name}</h3>
                <p className="b3 opacity-80">{industry.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          {showTitle && (
            <div className="mb-10 text-center">
              <h2 className="h2">
                Tech <span className="text-green">Stack</span>
              </h2>
            </div>
          )}
          
          <div className="skills-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(skills).map(([category, data]) => (
              <div 
                key={category} 
                className={`skill-category ${borderColorMap[data.color]} border-2 p-6 bg-paper-dark sketch-box`}
              >
                <h3 className="h4 pb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {data.items.map((skill) => (
                    <span 
                      key={skill}
                      className="b3 px-3 py-1 bg-white border border-black/20 hover:bg-amber hover:border-amber transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}