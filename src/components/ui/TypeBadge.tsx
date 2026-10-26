import { typeColorMap } from '@/lib/colorMaps';

interface TypeBadgeProps {
  type: string;
  withIcon?: React.ReactNode;
  className?: string;
}

export default function TypeBadge({ type, withIcon, className = '' }: TypeBadgeProps) {
  const color = typeColorMap[type] ?? 'bg-ink text-white';
  return (
    <span className={`${color} b3 px-2 border-2 border-ink flex items-center gap-1 ${className}`}>
      {withIcon}
      {type}
    </span>
  );
}
