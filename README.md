# portfolio

Personal website for Lily Sommer: a professional landing page that leads to her resume,
LinkedIn, biological research projects, GitHub and art portfolio. Built with Astro as a fully
static site and deployed on Vercel.

**Live site:** https://lilys-folio.vercel.app

## The site

| Route | Page |
| --- | --- |
| `/` | Landing page: name, divider and five navigation circles over an animated botanical scene |
| `/resume` | Resume (coming soon) |
| `/research` | Biological research projects (coming soon) |
| `/portfolio` | Art portfolio: Home, About Me, Past Works, Advanced, and three project pages |
| LinkedIn, GitHub | External profiles, linked from the landing page |

### Landing page

- Watercolour-style leaves, sage hills, a sage wash and gold lines, all drawn as SVG so they stay
  sharp at any size. The leaves sway from their stems and flutter individually; the hills, wash
  and gold lines drift slowly, like a light breeze. The name and navigation stay still.
- Each navigation circle has a hover treatment (gold halo, soft sage glow, lift, growing gold
  underline) and a click treatment (press plus a ripple from the pointer). Links that aren't
  ready yet show "Coming soon".
- Respects `prefers-reduced-motion` (the scene holds still), works with the keyboard, and adapts
  from wide desktop screens down to small phones.
- Design reference: `design/landing-reference.png`.

### Art portfolio

- About Me, Past Works (with hover titles and a full-screen gallery), Advanced (linking to three
  project pages), and the project write-ups with process images.
- Every page scales smoothly with the window and has a dedicated phone layout with an overlay menu.
- A small "Home" link with the landing page's leaf sprig leads back to the landing page.
- All artwork is kept at original resolution in `src/assets/portfolio/`; responsive WebP versions
  are generated at build time.

## Develop

```bash
bun install
bun run dev        # http://localhost:4321
bun run build      # static output in dist/
bun test           # data checks + browser tests against dist/ (build first)
bunx astro check   # types
```

## Project layout

| Path | What's there |
| --- | --- |
| `src/pages/index.astro` | Landing page |
| `src/data/landing.ts` | Landing name and navigation links (edit links here) |
| `src/data/botanical.ts` | The landing scene: leaf and branch placement, hills, lines, palette |
| `src/components/landing/` | Landing artwork, navigation circles and icons |
| `src/lib/` | Curve maths for the scene and the circle click treatment |
| `src/styles/landing.css` | Landing styles, motion and hover/click treatments |
| `src/pages/portfolio/[...page].astro` | All portfolio pages, rendered from `src/data/layout.json` |
| `src/layouts/PortfolioLayout.astro` | Portfolio header, menus, footer and gallery viewer |
| `src/styles/portfolio.css` | Portfolio styles |
| `src/assets/portfolio/` | Original artwork |
| `tests/` | Data checks and Playwright browser tests |
| `tools/` | Developer scripts (layout generation, visual checks, landing snapshots) |

### Common edits

- **Add the LinkedIn link:** in `src/data/landing.ts`, give the LinkedIn entry an `href` and
  `external: true`.
- **Fill in the resume or research page:** replace the placeholder in `src/pages/resume.astro` or
  `src/pages/research.astro`.
- **Adjust the landing scene:** move, add or reshape leaves and hills in `src/data/botanical.ts`.

## Deploy

Vercel builds and deploys every push to `main` (framework Astro, install `bun install`, build
`bun run build`, output `dist/`; see `vercel.json`).
