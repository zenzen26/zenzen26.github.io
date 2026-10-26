import { skills } from '@/lib/skills';
import type { Project, Experience } from '@/types';

/**
 * The Mac's pretend Linux shell. Pure logic: given a command line and the current folder
 * it returns lines to print, the new folder and side effects for the screen.
 *   ls [-l] / cd / pwd   look around (listings print ON the screen)
 *   cat <file>           read a file: overview card on the screen (+ a button)
 *   goto <place>         jump the real page to that section
 */
export type Dir = '~' | 'projects' | 'work' | 'skills';

export interface TermData {
  projects: Project[];
  experiences: Experience[];
}

export interface Detail {
  title: string;
  lines: string[];
  button?: { label: string; url?: string; scrollTo?: string };
}

export type Effect =
  | { type: 'scroll'; selector: string }
  | { type: 'cat' }
  | { type: 'joy' }
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'detail'; detail: Detail };

export interface TermResult {
  lines: string[];
  cwd: Dir;
  effects: Effect[];
}

interface Entry {
  name: string;
  dir?: boolean;
  /** Shown in the date column of `ls -l`. */
  meta: string;
  /** What `cat` opens. Missing = the cat.txt joke. */
  detail?: Detail;
}

const WIDTH = 54;
const COLUMN = 27;

export const pathOf = (cwd: Dir) => (cwd === '~' ? '~' : `~/${cwd}`);

// Browsers do not expose the visitor's account name, so they tell the Mac with `login <name>`.
const USER_KEY = 'zen-user';
const USER_MAX = 16;
/** Names visitors may not log in as. */
const RESERVED = ['admin', 'administrator', 'root', 'zen', 'zenzen', 'zenzen26'];
const isReserved = (name: string) => RESERVED.includes(name.toLowerCase());

function getUser(): string {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored && !isReserved(stored) ? stored : 'guest';
  } catch {
    return 'guest';
  }
}

function setUser(name: string | null) {
  try {
    if (name) localStorage.setItem(USER_KEY, name);
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* storage blocked: the name just will not stick */
  }
}

export const promptFor = (cwd: Dir) => `${getUser()}@mac:${pathOf(cwd)}$`;

const PLACES: Record<string, string> = {
  top: '#hero',
  home: '#hero',
  projects: '#projects',
  skills: '#industries',
  work: '#experience',
  jobs: '#experience',
  experience: '#experience',
  contact: '#footer',
};

const FOLDERS: Record<string, Dir> = { projects: 'projects', work: 'work', jobs: 'work', experience: 'work', skills: 'skills' };

/** Greedy word wrap to `width` columns, clipped to `maxLines` with an ellipsis. */
function wrap(text: string, width = WIDTH, maxLines = 99): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.replace(/\s+/g, ' ').trim().split(' ')) {
    if ((line + ' ' + word).trim().length > width) {
      out.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) out.push(line);
  if (out.length > maxLines) {
    const clipped = out.slice(0, maxLines);
    clipped[maxLines - 1] = clipped[maxLines - 1].slice(0, width - 1).trimEnd() + '…';
    return clipped;
  }
  return out;
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
    .replace(/-$/, '');

const skillEntries: [string, readonly string[]][] = Object.entries(skills);

function projectDetail(p: Project): Detail {
  const url = p.live_url || p.github_url;
  return {
    title: p.title,
    lines: [
      `${p.type} · ${p.category} · ${p.date}`,
      '',
      ...wrap(String(p.description || p.detail_description || ''), WIDTH, 5),
      '',
      ...wrap(`tech: ${p.tech_stack}`, WIDTH, 2),
    ],
    button: url
      ? { label: p.live_url ? 'OPEN PROJECT IN NEW TAB' : 'OPEN ON GITHUB', url }
      : { label: 'SEE ON PAGE', scrollTo: '#projects' },
  };
}

function jobDetail(e: Experience): Detail {
  return {
    title: e.role,
    lines: [
      `${e.company} · ${e.duration}`,
      ...(e.location ? [String(e.location)] : []),
      '',
      ...wrap(String(e.description || ''), WIDTH, 5),
      '',
      ...wrap(`tech: ${e.tech_stack}`, WIDTH, 2),
    ],
    button: { label: 'SHOW ON PAGE', scrollTo: '#experience' },
  };
}

/** The files and folders of the current directory. */
function entries(cwd: Dir, data: TermData): Entry[] {
  if (cwd === '~') {
    return [
      { name: 'projects', dir: true, meta: '--' },
      { name: 'work', dir: true, meta: '--' },
      { name: 'skills', dir: true, meta: '--' },
      {
        name: 'about.txt',
        meta: '2026',
        detail: {
          title: 'about.txt',
          lines: [
            ...wrap('Web developer and server engineer in Sydney. Full-stack web, server management and AI workflow automation with n8n.', WIDTH),
            '',
            ...wrap('I build and ship reliable systems end to end, mixing technology, design and a bit of creativity.', WIDTH),
          ],
          button: { label: 'BACK TO THE TOP', scrollTo: '#hero' },
        },
      },
      {
        name: 'contact.txt',
        meta: '2026',
        detail: {
          title: 'contact.txt',
          lines: ['email   thamzien@gmail.com', 'phone   +61 450 190 503', 'where   Sydney, NSW'],
          button: { label: 'SEND AN EMAIL', url: 'mailto:thamzien@gmail.com' },
        },
      },
      { name: 'cat.txt', meta: '=^..^=' },
    ];
  }
  if (cwd === 'projects') {
    return [...data.projects]
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .map((p) => ({ name: `${slug(p.title)}.md`, meta: String(p.date || ''), detail: projectDetail(p) }));
  }
  if (cwd === 'work') {
    return data.experiences.map((e) => ({ name: `${slug(`${e.company} ${e.role}`)}.md`, meta: e.duration.slice(-4), detail: jobDetail(e) }));
  }
  return skillEntries.map(([name, items]) => ({
    name: `${slug(name)}.txt`,
    meta: `${items.length} items`,
    detail: {
      title: name,
      lines: wrap(items.join(' · '), WIDTH),
      button: { label: 'SEE SKILLS ON PAGE', scrollTo: '#industries' },
    },
  }));
}

function find(list: Entry[], arg: string): Entry | undefined {
  const q = arg.toLowerCase().replace(/\/$/, '');
  const bare = (n: string) => n.replace(/\.[a-z]+$/, '');
  return (
    list.find((e) => e.name === q || bare(e.name) === q) ??
    list.find((e) => e.name.startsWith(q))
  );
}

function ls(cwd: Dir, data: TermData, flags: string): string[] {
  const list = entries(cwd, data);
  const label = (e: Entry) => (e.dir ? `${e.name}/` : e.name);

  if (flags.includes('l')) {
    return [
      `total ${list.length}`,
      ...list.map((e) => `${e.dir ? 'drwxr-xr-x' : '-rw-r--r--'} zen ${e.meta.padEnd(8)} ${label(e)}`),
    ];
  }

  // two columns, filled top-to-bottom like `ls`
  const rows = Math.ceil(list.length / 2);
  return Array.from({ length: rows }, (_, r) => {
    const left = label(list[r]).padEnd(COLUMN);
    const right = list[r + rows] ? label(list[r + rows]) : '';
    return (left + right).trimEnd();
  });
}

export function runTerminal(raw: string, cwd: Dir, data: TermData): TermResult {
  const [cmdRaw = '', ...rest] = raw.trim().split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const flags = rest.filter((a) => a.startsWith('-')).join('');
  const arg = rest.filter((a) => !a.startsWith('-')).join(' ').trim();
  const done = (lines: string[], effects: Effect[] = [], next: Dir = cwd): TermResult => ({ lines, cwd: next, effects });

  switch (cmd) {
    case '':
      return done([]);
    case 'help':
      return done([
        'ls [-l]        list files',
        'cd <dir>       projects work skills ..',
        'cat <file>     read a file here',
        'goto <place>   scroll the page',
        'pwd whoami login clear exit',
      ]);
    case 'ls':
    case 'dir':
      return done(ls(cwd, data, flags));
    case 'pwd':
      return done([`/home/zen${cwd === '~' ? '' : `/${cwd}`}`]);
    case 'cd': {
      const target = arg.replace(/^~?\/+/, '').replace(/\/+$/, '').toLowerCase();
      if (!target || target === '~' || target === '..' || target === '.') return done([], [], '~');
      const dir = FOLDERS[target];
      if (dir) return done([], [], dir);
      return done([`bash: cd: ${arg}: No such file or directory`]);
    }
    case 'cat': {
      // `cat` on its own (or cat.txt) is the joke: you expect a file, you get a cat.
      if (!arg) return done(['mrrp!'], [{ type: 'cat' }]);
      const list = entries(cwd, data);
      const hit = find(list, arg) ?? (cwd !== '~' ? undefined : find(entries('~', data), arg));
      if (!hit) return done([`cat: ${arg}: No such file or directory`]);
      if (hit.dir) return done([`cat: ${hit.name}: Is a directory`]);
      if (!hit.detail) return done(['mrrp!'], [{ type: 'cat' }]);
      return done([hit.name], [{ type: 'detail', detail: hit.detail }]);
    }
    case 'goto': {
      const selector = PLACES[arg.toLowerCase()];
      return selector
        ? done([`goto: scrolling to ${arg.toLowerCase()}`], [{ type: 'scroll', selector }])
        : done(['usage: goto projects|work|skills|contact|top']);
    }
    case 'echo':
      return done([arg]);
    case 'whoami':
      return done([getUser()]);
    case 'login':
    case 'su': {
      const name = arg.replace(/[^\w.-]/g, '').slice(0, USER_MAX).toLowerCase();
      if (!name) return done(['usage: login <name>']);
      if (isReserved(name)) return done([`login: ${name}: unauthorised`, 'nice try.']);
      setUser(name);
      return done([`welcome, ${name}`], [{ type: 'joy' }]);
    }
    case 'clear':
      return done([], [{ type: 'clear' }]);
    case 'logout':
      setUser(null);
      return done(['you are now guest']);
    case 'exit':
      return done([], [{ type: 'exit' }]);
    case 'ssh':
    case 'scp':
    case 'telnet':
      return done(['>:(  no hacking allowed!', 'this server is not yours to log into.']);
    case 'nano':
    case 'vi':
    case 'vim':
      return done(['>:(  hands off! no hacking allowed.', 'this machine is read-only.']);
    case 'sudo':
      return done([`${getUser()} is not in the sudoers file.`, 'This incident will be reported to the cat.']);
    case 'rm':
      return done(['rm: cannot remove: Permission denied (nice try)']);
    default:
      return done([`bash: ${cmd}: command not found`]);
  }
}
