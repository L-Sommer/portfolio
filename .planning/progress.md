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
