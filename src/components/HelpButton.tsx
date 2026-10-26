import { useState } from 'react';
import { Terminal } from 'lucide-react';
import ModalOverlay from '@/components/ui/ModalOverlay';
import { COMMAND_GROUPS, CommandRow } from '@/components/HeroHelp';

/** Below xl there is no room beside the Mac: a button next to "Reset view" opens the command list as a popup. */
export default function HelpButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`bevel-out flex items-center gap-2 bg-beige text-ink px-3 py-1 b2 cursor-pointer hover:bg-ink hover:text-beige-light ${className}`}
      >
        <Terminal size={16} /> Commands
      </button>

      {open && (
        <ModalOverlay title="Commands.txt" onClose={() => setOpen(false)} widthClassName="max-w-md">
          <div className="p-4 space-y-4">
            <p className="b2">Tap the Mac&apos;s screen, then type:</p>
            {COMMAND_GROUPS.map((group) => (
              <section key={group.title}>
                <p className="font-pixel text-moss mb-2">{group.title}</p>
                <ul className="space-y-2">
                  {group.items.map(([command, text]) => (
                    <CommandRow key={command} command={command} text={text} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
