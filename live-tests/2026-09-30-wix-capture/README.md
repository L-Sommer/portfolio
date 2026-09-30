# 2026-09-30 Wix capture

Source of truth for the replica: the live Wix site (lilys271.wixsite.com/portfolio) captured on
2026-09-30 at 1280×800 (desktop) and 390×844 (mobile), Chromium via Playwright.

## Commands

```bash
bun tools/capture.mjs live-tests/2026-09-30-wix-capture
bun tools/extract-text.mjs live-tests/2026-09-30-wix-capture/text.json 1280
bun tools/extract-text.mjs live-tests/2026-09-30-wix-capture/text.mobile.json 390
bun tools/build-layout.mjs live-tests/2026-09-30-wix-capture   # -> src/data/layout.json
```

## Files

- `<page>.<desktop|mobile>.png` — full-page screenshots with the "Built on Wix" bar removed
  (a 34px blank strip remains at the top; tools/parity.mjs crops it).
- `<page>.<desktop|mobile>.json` — every visible text run, image, link and coloured section with
  its box and computed style.
- `text.json`, `text.mobile.json` — each rich-text block as sanitised HTML with box and style.
- `menu-open.mobile.png`, `nav-dropdown.desktop.png` — navigation states.

Page names are Wix slugs: home, blank-1 (About Me), blank-3 (Past Works), blank (Advanced),
blank-2-1-1 (Green), blank-2-1 (We Are Shaped), blank-2 (View of A Classroom).

## Observations

- Wix scales the entire layout (fonts included) linearly with viewport width: desktop from
  1024px up (1280 design px), a stacked layout below 1024px (390 design px; text stops growing
  at 700px viewport width).
- Fonts: Adobe Caslon Semibold and Alfabet (licensed through Wix, not reusable), DM Sans and
  Wix Madefor Display (open). The replica uses Crimson Pro and Public Sans as stand-ins.
- The "Advanced" nav item has a dropdown of the three project pages; Past Works opens a lightbox.
