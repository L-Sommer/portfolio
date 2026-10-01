# Progress

## 2026-09-30
- Captured all 7 Wix pages at 1280 and 390 (screenshots, DOM boxes, styles, rich text):
  live-tests/2026-09-30-wix-capture/.
- Downloaded 27 original images from static.wixstatic.com → src/assets/portfolio/ (162MB).
- Built Astro site: landing stub, resume/research stubs, data-driven portfolio replica,
  desktop dropdown nav, mobile overlay menu, Past Works lightbox, vercel.json redirects.
- Verified: `bun test` 11/11, `astro check` 0 errors, manual checks of menu/submenu/lightbox.
- Parity (r3, pixel diff vs Wix, threshold 0.2): desktop heights within ±1px on all pages;
  diff 0.3–7.6% (residual = substitute-font glyphs/line breaks). Mobile heights within ±4px except
  the intentional About/Advanced fixes.

## 2026-09-30 (after first deploy)
- Fixed the Advanced dropdown: it closed while moving the pointer to its links (9px gap below
  the nav item) and had zero padding (reset rule overrode it). Now flush and matches Wix
  geometry (panel 1099–1272 × 57–187, links at 84/113/142). Added tests/nav.e2e.test.ts
  (Playwright); verified it fails on the old CSS. 15/15 tests pass.
- Verified deployed site (lilys-folio.vercel.app): dropdown fix live; parity vs Wix identical to
  the local build on all 14 page/viewport checks (live-tests/2026-09-30-parity-live/parity.json).
  One earlier run caught a transient unstyled page during the deploy swap; not reproducible.

## 2026-09-30 (Past Works hover titles)
- Added the Wix gallery hover: 60% black overlay + piece title (Wix Madefor Display, white,
  32px desktop / 18px mobile, centred), fading in over 0.6s while rising 5px; also on keyboard
  focus; no motion with prefers-reduced-motion. Measured on Wix: overlay brightness matches
  within 0.4/255 per channel at both widths. Added tests/gallery.e2e.test.ts; 19/19 tests pass.

## 2026-09-30 (new landing page)
- Replaced the stub landing page with the design in design/landing-reference.png: name, sprig
  divider and five navigation circles (Resume, LinkedIn, Biological Research Projects, GitHub,
  Art Portfolio) over an SVG botanical scene in the mockup's sampled palette. Leaves sway and
  flutter (CSS, per-stem pivots verified), hills/wash/gold lines drift (JS path morph, 30fps);
  name and navigation are static. Hover: gold halo, sage glow, lift, gold underline; click: press +
  ripple, short delay, navigate. Reduced motion stills everything. Phone layout: 2-column nav.
- Resume/research stubs restyled to match, with a "Back home" circle.
- Portfolio pages: added only a "Home" back link (sprig in a ring) to the desktop nav, mobile
  header and mobile menu. Parity vs previous run: all heights identical, diffs +0.00–0.03pts.
- README rewritten to describe the site as a professional landing page and portfolio.
- Tests: 40/40 (added curves unit tests, landing browser tests); astro check clean.

## 2026-09-30 (landing refinements)
- "Biological" → "Biology Research Projects". Resume and Biology Research now use the same
  "Coming soon" placeholder as LinkedIn (`soon: true` in src/data/landing.ts; hrefs kept).
- Top-right sage wash is now a fixed two-segment curve (G1-continuous); only its gold line drifts.
- DNA icon regenerated: open ends, one turn (two crossings with an over/under gap), even rungs.
- Butterfly easter egg (src/lib/butterfly.ts): hover/tap the top-left leaves → an original
  sage-and-gold butterfly flies to the top of the "L", flaps 3×, rests, flies off right; one at a
  time, re-arms after it leaves; skipped for reduced motion. Tests: 44/44.
- Butterfly redrawn as an original line-drawing style (pale wings, sage outer-edge band, olive
  outline, gold-tipped antennae), ~20% larger, perching on the left end of the L's top serif.
  Fixed vertical centring (element is 64×50, not square).
- Butterfly trigger tightened: only painted top-left leaves (plus a 16-unit invisible stroke along
  their stems) release it; the rectangle overlay is gone. Tests sweep every nav circle and clear
  paper at 4 viewport sizes (incl. 1440×700, where the circle sat inside the old rectangle). 48/48.
