# portfolio

Personal site: a temporary landing page plus a replica of the art portfolio that used to live on
Wix (lilys271.wixsite.com/portfolio). Static Astro site, deployed on Vercel (Hobby).

| Route | What |
| --- | --- |
| `/` | Landing page (temporary design) with links to everything below |
| `/portfolio` … | Wix replica: Home, About Me, Past Works, Advanced, Green, We Are Shaped, View of A Classroom |
| `/resume`, `/research` | Stubs |

## Develop

```bash
bun install
bun run dev        # http://localhost:4321
bun run build      # static output in dist/
bun test           # structural checks on layout data + built site (build first)
bunx astro check   # types
```

## Where things live

- **Landing page** — `src/pages/index.astro`, `src/layouts/LandingLayout.astro`,
  `src/styles/landing.css`; links and copy in `src/data/landing.ts`. Safe to redesign freely: it
  shares nothing with the portfolio except `Base.astro`.
- **Portfolio replica** — one route file (`src/pages/portfolio/[...page].astro`) renders every
  page from `src/data/layout.json`, which `tools/build-layout.mjs` generates from the Wix capture
  in `live-tests/2026-09-30-wix-capture/`. Styles in `src/styles/portfolio.css`; nav in
  `src/data/nav.ts`.
- **Artwork** — original-resolution files in `src/assets/portfolio/` (the backup of record).
  Astro generates responsive WebP versions at build time.

### How the replica works

Wix scales its whole layout with the window, so the replica does too: every size is in "design
pixels" (1280-wide above 1024px, 390-wide below) multiplied by a viewport unit. Desktop positions
are absolute, as on Wix; the narrow layout is a vertical flow using Wix's own mobile spacing.

Deliberate differences from the Wix original:

- No "Built on Wix" bar.
- Fonts: Wix used Adobe Caslon and Alfabet, which are licensed only for Wix sites. The replica
  uses **Crimson Pro** and **Public Sans** (free), tuned to the same line lengths; DM Sans (menu)
  is the same font Wix used. Some paragraphs break lines at slightly different words.
- Mobile fixes for Wix layout bugs: About Me no longer shows an empty box above the content;
  the Past Works / Advanced headings sit at the top of their card instead of the page bottom; the
  mobile menu links are light-on-dark (Wix rendered them dark-on-dark).
- Images have descriptive alt text instead of camera file names; favicon is an "LS" mark.
- Past Works hover titles also appear on keyboard focus (Wix showed them on mouse hover only).

### Re-capturing from Wix (only while the Wix site is still up)

```bash
bun tools/capture.mjs live-tests/<date>-wix-capture
bun tools/extract-text.mjs live-tests/<date>-wix-capture/text.json 1280
bun tools/extract-text.mjs live-tests/<date>-wix-capture/text.mobile.json 390
bun tools/build-layout.mjs live-tests/<date>-wix-capture
```

### Visual parity check

```bash
bun run build && bun run preview &
bun tools/parity.mjs http://localhost:4321 live-tests/2026-09-30-wix-capture live-tests/<date>-parity-rN
```

Writes Wix | replica | diff images per page and a `parity.json` summary.

## Deploy

Vercel builds on every push to `main` (framework: Astro, install `bun install`, build
`bun run build`, output `dist/`; see `vercel.json`). Old Wix-style paths such as `/blank-1`
redirect to the new routes.
