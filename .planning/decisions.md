# Decisions

- 2026-09-30 — **Astro static site, bun.** No runtime needed; Vercel serves `dist/` with no adapter.
  Astro 7, TypeScript 6 (astro check does not support TS 7 yet).
- 2026-09-30 — **Layout generated from a capture, not hand-coded.** tools/build-layout.mjs pairs
  desktop/mobile boxes from the live Wix DOM. Reproducible and auditable; edits after Wix is
  retired happen directly in src/data/layout.json.
- 2026-09-30 — **Scale like Wix.** Desktop ≥1024px = 1280 design px × (100cqw/1280); below
  1024px = 390 design px, text capped at 700px width. Measured on Wix at 390–1920px.
- 2026-09-30 — **Fonts:** Crimson Pro (for Adobe Caslon Semibold), Public Sans (for Alfabet),
  DM Sans (same as Wix). Chosen by measured line widths; letter-spacing 0.004em serif,
  0.007em sans desktop / 0.0125em mobile.
- 2026-09-30 — **Fix, don't copy, Wix mobile bugs** (empty About card, stray headings,
  dark-on-dark menu). Desktop reproduced as-is.
- 2026-09-30 — **Originals committed** (~162MB, largest 23MB) as the backup of record; no LFS.
- 2026-09-30 — **Public repo** L-Sommer/portfolio (owner's choice; also avoids Vercel Hobby's
  block on private-repo commits by non-owners).
- Open — Two project pages include third-party reference images the student cited (a photo of a
  Vlaminck painting; a classroom photo). Kept as on Wix; owner to decide.
