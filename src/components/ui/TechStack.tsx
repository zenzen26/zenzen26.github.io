interface TechStackProps {
  /** Comma-separated tech string, e.g. "React, TypeScript, Tailwind" */
  stack: string;
  /** Max pills to show before a "+N more" pill. Omit for no limit. */
  limit?: number;
  className?: string;
}

export default function TechStack({ stack, limit, className = '' }: TechStackProps) {
  const techs = stack.split(',').map((t) => t.trim());
  const visible = limit ? techs.slice(0, limit) : techs;
  const overflow = limit ? techs.length - limit : 0;
  const pillClass = 'b3 px-2 bg-beige border-2 border-ink';

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visible.map((tech) => (
        <span key={tech} className={pillClass}>{tech}</span>
      ))}
      {overflow > 0 && <span className={`${pillClass} text-ink/60`}>+{overflow}</span>}
    </div>
  );
}
