import { useState } from 'react';
import MacWindow from '@/components/ui/MacWindow';
import { COMMAND_GROUPS, CommandRow } from '@/components/HeroHelp';

/** Phones: the command list hides behind a side tab and slides out as a swipeable carousel. */
export default function HelpDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`md:hidden absolute right-0 top-24 z-30 flex items-start transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-[calc(100%-2.5rem)]'
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Hide commands' : 'Show commands'}
        onClick={() => setOpen((o) => !o)}
        className="bevel-out w-10 shrink-0 bg-beige py-4 text-ink cursor-pointer font-pixel [writing-mode:vertical-rl]"
      >
        {open ? 'CLOSE ›' : '‹ COMMANDS'}
      </button>

      <MacWindow title="Commands.txt" className="w-[78vw] max-w-sm" bodyClassName="p-3">
        <p className="b3 mb-2">Tap the screen, then type.</p>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {COMMAND_GROUPS.map((group, i) => (
            <section key={group.title} className="bevel-in w-[85%] shrink-0 snap-start bg-white p-3">
              <p className="font-pixel text-moss mb-2">
                {group.title} <span className="b3 text-ink/50">{i + 1}/{COMMAND_GROUPS.length}</span>
              </p>
              <ul className="space-y-2">
                {group.items.map(([command, text]) => (
                  <CommandRow key={command} command={command} text={text} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </MacWindow>
    </div>
  );
}
