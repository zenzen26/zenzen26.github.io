import MacWindow from '@/components/ui/MacWindow';

/** Commands for the Mac's terminal: shared by the desktop window and the mobile drawer. */
export const COMMAND_GROUPS = [
  {
    title: 'Terminal',
    items: [
      ['ls [-l]', 'list files'],
      ['cd <dir>', 'projects work skills ..'],
      ['cat <file>', 'read a file'],
      ['goto <place>', 'jump the page'],
      ['help', 'all commands'],
    ],
  },
  {
    title: 'The Mac',
    items: [
      ['click screen', 'then type (ESC stops)'],
      ['Power Bright Eject', 'buttons work too'],
    ],
  },
] as const;

/** `inline` puts the description next to the command (compact window); default stacks it (carousel cards). */
export function CommandRow({ command, text, inline = false }: { command: string; text: string; inline?: boolean }) {
  return (
    <li className={inline ? 'flex flex-wrap items-baseline gap-x-2' : 'flex flex-col gap-0.5'}>
      <code className="font-pixel w-fit bg-ink px-2 text-beige-light">{command}</code>
      <span className="b3 text-ink/70">{text}</span>
    </li>
  );
}

/** "Commands.txt": the terminal cheat-sheet shown beside (xl) or under (md) the 3D hero. */
export default function HeroHelp({ className = '' }: { className?: string }) {
  return (
    <MacWindow title="Commands.txt" draggable className={className} bodyClassName="p-3 space-y-3">
      {COMMAND_GROUPS.map((group) => (
        <section key={group.title}>
          <p className="font-pixel text-moss mb-1">{group.title}</p>
          <ul className="space-y-1">
            {group.items.map(([command, text]) => (
              <CommandRow key={command} command={command} text={text} inline />
            ))}
          </ul>
        </section>
      ))}
    </MacWindow>
  );
}
