# Lessons

- Wix pages never reach Playwright `networkidle` (analytics keep polling). Use `load` + a fixed wait.
- Wix DOM nests wrappers with identical boxes: dedupe sections by box before building a tree, or
  an empty duplicate card paints over real content.
- A node hidden via `display: contents` must never also get a `display: none` rule.
- Screenshot parity needs every lazy image forced + decoded first, or diffs are meaningless.
- The Claude preview tool reads .claude/launch.json from the session root, not the subproject.
- Hover dropdowns: the panel must touch its trigger (top: 100%); any gap closes it mid-move.
  Covered by tests/nav.e2e.test.ts, which walks the pointer down in 2px steps.
- Watch selector specificity on resets: `.nav ul { padding: 0 }` silently beat `.sub { padding }`.
  Scope resets to the element they're for.
- Scripts run from outside the project (e.g. a scratch dir) don't see node_modules; Bun silently
  auto-installs imports from the network instead and appears to hang. Keep tooling in tools/.
- Playwright won't click elements with aria-disabled="true" (it waits for "enabled"); use
  { force: true } when testing a deliberately disabled control.
- sharp applies resize() before composite() in one pipeline: composite to a buffer, then resize.
- Data-URI SVG textures: write `url(#id)` raw and let encodeURIComponent encode it; pre-encoding
  (%23) double-escapes, the filter breaks and the tile renders solid black.
- The desktop View of A Classroom parity number flips between ~3.4% and ~7.4% run to run
  (image decode timing); treat a change of exactly that size there as noise.
