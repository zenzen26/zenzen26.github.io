import { Power, Sun, Save, Keyboard, MousePointerClick, Hand } from 'lucide-react';
import MacWindow from '@/components/ui/MacWindow';

const CONTROLS = [
  { icon: Hand, label: 'Drag', text: 'spin the Mac around' },
  { icon: Power, label: 'Power', text: 'screen off / on (reboots)' },
  { icon: Sun, label: 'Bright', text: 'cycle screen brightness' },
  { icon: Save, label: 'Eject', text: 'pop the floppy out' },
  { icon: Keyboard, label: 'Keys', text: 'type help + Enter' },
  { icon: MousePointerClick, label: 'Screen', text: 'buttons jump to a section' },
];

/** "How to use this Mac" cheat-sheet shown beside (xl) or under (smaller) the 3D hero. */
export default function HeroHelp({ className = '' }: { className?: string }) {
  return (
    <MacWindow title="Help.txt" draggable className={className} bodyClassName="p-4">
      <p className="b2 mb-3">This Mac is interactive. Try it:</p>
      <ul className="space-y-2">
        {CONTROLS.map(({ icon: Icon, label, text }) => (
          <li key={label} className="flex items-start gap-3">
            <span className="bevel-out size-8 shrink-0 bg-beige flex items-center justify-center">
              <Icon size={16} />
            </span>
            <span className="b2 leading-tight">
              <strong className="font-pixel">{label}</strong> — {text}
            </span>
          </li>
        ))}
      </ul>
    </MacWindow>
  );
}
