# Claude rules — zenzen-portfolio

Instructions Claude reads automatically when working in this repo
(React 19 + TypeScript + Vite + Tailwind v4 + GSAP + three.js via
@react-three/fiber + lucide-react). Theme: **"Zen OS"** — a vintage Macintosh
desktop (beige, grey, dark/phosphor green, ink) with a pixel-art cat.

## Rule #1 — Reuse before you create (applies to everything below)

Applies to **CSS classes, Tailwind utility patterns, React components, hooks,
helper functions, and animation code** alike. Do not create a new class,
component, file, or helper unless you have to.

1. **Search first.** Look for an existing component (`src/components/`,
   `src/components/ui/`), hook (`src/hooks/`), helper (`src/lib/`,
   `src/utils/`), or CSS class/utility (`src/styles/global.css`, co-located
   `*.css`) that already does the job. Use it as-is if it fits. Check
   `lucide-react` before drawing a new icon.
2. **Extend, don't fork.** If it almost fits, add a prop / variant / modifier
   to the existing base (e.g. a new `ProjectCard` prop, a new `@utility`
   composed via `@apply`) rather than writing a parallel copy.
3. **Promote repeats.** If the pattern you need is (or would become) used in
   3+ places and no base exists, create the **base component / utility
   first** (in `components/ui/` or `global.css`), then build the variant on
   top of it. Do not hand-roll the same markup or utility string again.
4. **One-offs stay inline** — plain Tailwind utilities, no new class, no new
   file.
5. Before adding CSS, ask: can existing Tailwind utilities + theme tokens do
   this? Only write CSS for things utilities can't express (keyframes,
   multi-property patterns reused 3+ times).

## Conventions

- **Theme tokens, not raw values**: colours/fonts live in the `@theme` block
  of `src/styles/global.css` (`beige`, `beige-light`, `grey`, `forest`, `moss`,
  `phosphor`, `ink`). Use `bg-beige`, `fill-ink`, `text-ink/70` — never `#hex`
  in markup. Canvas/three code reads tokens via `themeColor()` in
  `src/lib/pixelCat.ts`.
- **Where CSS goes**: shared (used by 2+ components) → `global.css`; used by
  one component → co-located `Component.css`.
- **Typography**: pixel headings `h1–h4` (Pixelify Sans) and terminal body
  `b1–b3` (VT323), see `global.css`. Don't add inline font-size utilities.
- **Reusable bases** (extend these, don't fork): `MacWindow` (every panel), `ModalOverlay`
  (every popup: portalled to <body>, X close button), `FloppyIcon` (resume downloads),
  `ProjectTile` (project thumbnails: Home + Finder), `PixelSprite` → `PixelCat`
  (`lib/pixelCat.ts` sprite data), `RoundedBox` (`components/three`), `TechStack`,
  `TypeBadge`; utilities `bevel-out`, `bevel-in`, `crt`, `titlebar-stripes`; hooks
  `useWindowReveal` (scroll entrance/exit for any `MacWindow reveal`), `useCSVData`,
  `useCursor`. Logic with no React lives in `src/lib/` (`terminal.ts`, `macScreen.ts`).
- **Never import `@react-three/drei`** (or other heavy helper libraries) for one small
  feature: write the few lines instead.
- **Path alias**: import with `@/…`.
- **Animation**: GSAP, created inside `gsap.context()` and reverted on
  cleanup; honour `prefers-reduced-motion`.
- **Data**: projects/experience come from `public/data/*.csv` via
  `useCSVData` (requests are started early in `main.tsx`).

## Performance rules (the site scores ~95 mobile / 100 desktop on Lighthouse: keep it that way)

- **The entry bundle stays small.** Anything heavy loads on demand: three.js
  (`MacHero` → `Mac3D`), gsap + plugins (only where used; never in `App`/`main`),
  `gifuct-js`, `papaparse`. Don't add a library to the entry path without checking
  `npm run build` output.
- **Hero = poster first.** `index.html` paints the static `#boot` poster; the 3D
  Mac loads on first interaction or after idle. If the 3D scene's look changes,
  regenerate `public/images/mac-poster-{lg,md,sm}.webp`. Don't swap the poster
  element for a new one (a replaced element becomes a later LCP): fade it out.
- **The hero never waits for data.** Below-the-fold sections render when the CSVs
  arrive; reserve their space so nothing jumps.
- **Images**: WebP, sized for display (thumbnails about 1000 px wide), `width`/`height`
  or an aspect-ratio box, `loading="lazy"` below the fold, `priority` for the first
  visible ones. Prefer CSS animation (`@keyframes` in `global.css`) over GSAP for
  simple effects.
- Pause per-frame work (3D rendering, canvas painting) when it is off-screen.

## Build / verify

- `npm run lint` and `npm run typecheck` must both be clean (CI runs them), then
  `npm run build`.
- `npm run dev` for the dev server, `npm run preview` to serve the production build.
- To check performance: build, `npm run preview`, then run Lighthouse (mobile and
  desktop) against it.
