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
