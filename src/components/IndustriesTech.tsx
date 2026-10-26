import { useRef, useState } from 'react';
import { Code2, Server, Bot, Banknote, ChartColumn } from 'lucide-react';
import MacWindow from '@/components/ui/MacWindow';
import Container from '@/components/ui/Container';
import { useWindowReveal } from '@/hooks/useWindowReveal';

const industries = [
  { name: 'Web Dev', icon: Code2, tagline: 'Building attractive web experiences' },
  { name: 'DevOps', icon: Server, tagline: 'Reliable, scalable infrastructure' },
  { name: 'AI Automation', icon: Bot, tagline: 'Smart workflows with n8n' },
  { name: 'FinTech', icon: Banknote, tagline: 'Simplifying finance through tech' },
  { name: 'Analyst', icon: ChartColumn, tagline: 'Turning data into insight' },
];

const skills = {
  Frontend: ['React', 'TypeScript', 'Tailwind CSS', 'ThreeJS', 'GSAP'],
  Backend: ['PHP', 'Python', 'MySQL', 'PostgreSQL', 'NextJS', 'Redis', 'REST APIs'],
  'Server & DevOps': ['Docker', 'Nginx', 'Traefik', 'GitHub Actions', 'Cloudflare', 'Linux', 'MariaDB'],
  'AI & Automation': ['n8n', 'LangChain', 'TensorFlow', 'PyTorch', 'scikit-learn'],
  Analytics: ['Pandas', 'SQL', 'Tableau', 'PowerBI', 'Excel'],
  Other: ['Git', 'Vercel', 'Vite', 'Figma', 'Spline', 'Framer', 'Wordpress'],
} as const;

type Category = keyof typeof skills;
const categories = Object.keys(skills) as Category[];

/** Icon tiles for industries (caption in a status bar) and a sidebar + pane for the tech stack. */
export default function IndustriesTechStack({ className = '' }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState('Hover an icon');
  const [category, setCategory] = useState<Category>('Frontend');
  useWindowReveal(sectionRef);

  return (
    <section id="industries" ref={sectionRef} className={`py-20 sm:py-24 ${className}`}>
      <Container className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <MacWindow title="Control Panel" reveal className="h-full" bodyClassName="flex flex-col h-full">
          <div className="p-5 flex-1 flex flex-wrap justify-center content-center gap-3">
            {industries.map(({ name, icon: Icon, tagline }) => (
              <button
                key={name}
                type="button"
                onMouseEnter={() => setStatus(tagline)}
                onFocus={() => setStatus(tagline)}
                onMouseLeave={() => setStatus('Hover an icon')}
                onBlur={() => setStatus('Hover an icon')}
                className="group w-28 flex flex-col items-center gap-3 p-2 cursor-pointer outline-none"
              >
                <span className="bevel-out rounded-full size-20 bg-beige flex items-center justify-center transition-colors group-hover:bg-ink group-hover:text-beige-light group-focus-visible:bg-ink group-focus-visible:text-beige-light">
                  <Icon size={34} strokeWidth={1.5} />
                </span>
                <span className="b2">{name}</span>
              </button>
            ))}
          </div>
          <div className="bevel-in bg-beige px-3 py-1 b3 truncate">{status}</div>
        </MacWindow>

        <MacWindow title="System Profiler" reveal className="h-full" bodyClassName="flex flex-col sm:flex-row h-full">
          <div className="flex sm:flex-col gap-1 p-2 border-b-2 sm:border-b-0 sm:border-r-2 border-ink bg-beige overflow-x-auto sm:w-44 shrink-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`b2 px-2 py-1 text-left whitespace-nowrap cursor-pointer ${
                  category === c ? 'bg-ink text-beige-light' : 'hover:bg-ink/10'
                }`}
              >
                <span className={`mr-2 inline-block size-3 rounded-full border-2 border-current align-middle ${category === c ? 'bg-phosphor' : ''}`} />
                {c}
              </button>
            ))}
          </div>
          <div className="p-5 flex-1 bg-white">
            <h3 className="h4 mb-4 text-moss">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {skills[category].map((skill) => (
                <span key={skill} className="b2 px-4 py-1 bg-beige border-2 border-ink rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        </MacWindow>
      </Container>
    </section>
  );
}
