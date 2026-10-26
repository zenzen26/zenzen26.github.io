import { useRef } from 'react';
import MacWindow from '@/components/ui/MacWindow';
import Container from '@/components/ui/Container';
import { useWindowReveal } from '@/hooks/useWindowReveal';

const industries = [
  { name: 'Web Dev', tagline: 'Building attractive web experiences' },
  { name: 'Server & DevOps', tagline: 'Reliable, scalable infrastructure' },
  { name: 'AI Automation', tagline: 'Smart workflows with n8n' },
  { name: 'FinTech', tagline: 'Simplifying finance through tech' },
  { name: 'Analyst', tagline: 'Turning data into insight' },
];

const skills = {
  Frontend: ['React', 'TypeScript', 'Tailwind CSS', 'ThreeJS', 'GSAP'],
  Backend: ['PHP', 'Python', 'MySQL', 'PostgreSQL', 'NextJS', 'Redis', 'REST APIs'],
  'Server & DevOps': ['Docker', 'Nginx', 'Traefik', 'GitHub Actions', 'Cloudflare', 'Linux', 'MariaDB'],
  'AI & Automation': ['n8n', 'LangChain', 'TensorFlow', 'PyTorch', 'scikit-learn'],
  Analytics: ['Pandas', 'SQL', 'Tableau', 'PowerBI', 'Excel'],
  Other: ['Git', 'Vercel', 'Vite', 'Figma', 'Spline', 'Framer', 'Wordpress'],
};

/** Target industries ("Control Panel") and tech stack ("System Profiler") windows. */
export default function IndustriesTechStack({ className = '' }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  useWindowReveal(sectionRef);

  return (
    <section id="industries" ref={sectionRef} className={`py-20 sm:py-24 ${className}`}>
      <Container className="space-y-12">
        <MacWindow title="Control Panel — Target Industries" reveal bodyClassName="p-5 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((industry) => (
              <div key={industry.name} className="bevel-out bg-beige p-4 text-center cursor-default hover:bg-ink hover:text-beige-light transition-colors">
                <h3 className="h4 mb-1">{industry.name}</h3>
                <p className="b3 opacity-80">{industry.tagline}</p>
              </div>
            ))}
          </div>
        </MacWindow>

        <MacWindow title="System Profiler — Tech Stack" reveal bodyClassName="p-5 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className="bevel-in bg-white p-5">
                <h3 className="h4 pb-2 text-moss">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span key={skill} className="b3 px-2 bg-beige border-2 border-ink hover:bg-phosphor transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MacWindow>
      </Container>
    </section>
  );
}
