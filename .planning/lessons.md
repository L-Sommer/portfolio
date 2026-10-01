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
