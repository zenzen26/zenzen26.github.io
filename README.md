# zenzen-portfolio

Personal portfolio of Zi En Tham, styled as a vintage Macintosh desktop ("Zen OS"): a draggable
3D Mac with a working terminal in the hero, projects as Finder windows, and a pixel cat that
wanders the page.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · GSAP · three.js (react-three-fiber) · lucide-react

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run lint` | ESLint over `src/` |
| `npm run typecheck` | `tsc` for the app and the Vite config |

CI (`.github/workflows/deploy.yml`) runs lint, typecheck and build, then deploys `dist/` to GitHub Pages
on every push to `main`. It also copies `index.html` to `404.html` so deep links like `/projects` work
(GitHub Pages has no rewrite rules).

## Where things live

```
public/
  data/            projects.csv, experience.csv: the site's content (edit these, not the code)
  images/          project thumbnails, About photo, hero posters (mac-poster-*.webp)
  resumes/         resume PDFs (their "last updated" dates come from git history)
  cursors/         pixel Mickey-glove cursors (arrow, hand, pressed, disabled, grab)
  videos/          rick-roll.gif for the Mac's floppy disk
src/
  pages/           Home, Projects (route components, lazy-loaded)
  components/      feature components (MacHero, Mac3D, FeaturedProjects, ...)
  components/ui/   reusable building blocks (MacWindow, FloppyIcon, ModalOverlay, DesktopPet, ...)
  components/three/  small three.js helpers
  hooks/           useCSVData, useWindowReveal, useCursor
  lib/             framework-free logic (terminal.ts, macScreen.ts, skills.ts, ...)
  styles/global.css  Tailwind import, theme tokens, shared utilities
```

Coding rules (reuse before creating, tokens not raw values, etc.) are in [CLAUDE.md](CLAUDE.md).

## Content

Add or edit a project by changing a row in `public/data/projects.csv` (columns: id, title, description,
type, category, tech_stack, image_url, live_url, github_url, featured, color_tag, date, detail_description,
challenges, solution, outcome). `featured = TRUE` rows (newest six) appear on the home page. Experience works
the same way in `experience.csv`. Thumbnails go in `public/images/projects/` as WebP, about 1000 px wide.

## Performance notes

The page is built to paint fast on slow phones (Lighthouse mobile ≈ 95, desktop 100):

- **The hero is a poster first.** `index.html` paints a static WebP poster of the Mac (`#boot`), which is the
  page's LCP. `MacHero` loads the real 3D Mac (about 1 MB of three.js) on the first interaction, or after a few
  idle seconds, then fades the poster out. Regenerate the posters in `public/images/mac-poster-*.webp` if the 3D
  model's look changes.
- **The entry bundle stays small.** gsap, the 3D code, the GIF decoder and the CSV parser are all loaded on
  demand; route changes and in-page scrolling use CSS and native browser features instead of animation plugins.
- **The hero never waits for data.** CSV requests start in `main.tsx` (and are preloaded in `index.html`)
  while the rest of the page renders around the hero.
- Keep images right-sized (about 1000 px for thumbnails) and give above-the-fold images `priority`.
