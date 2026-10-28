/** Tech stack by category (System Profiler window + the Mac's `cd skills`). */
export const skills = {
  Frontend: ['React', 'TypeScript', 'Tailwind CSS', 'ThreeJS', 'GSAP'],
  Backend: ['PHP', 'Python', 'MySQL', 'PostgreSQL', 'NextJS', 'Redis', 'REST APIs'],
  DevOps: ['Docker', 'Nginx', 'Traefik', 'GitHub Actions', 'Cloudflare', 'Linux', 'MariaDB'],
  'AI & Automation': ['n8n', 'TensorFlow', 'scikit-learn'],
  Analytics: ['Pandas', 'SQL', 'Tableau', 'PowerBI', 'Excel'],
  Other: ['Git', 'Vercel', 'Vite', 'Figma', 'Spline', 'Framer', 'Wordpress'],
} as const;

export type SkillCategory = keyof typeof skills;
