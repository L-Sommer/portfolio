# Lessons

- Wix pages never reach Playwright `networkidle` (analytics keep polling). Use `load` + a fixed wait.
- Wix DOM nests wrappers with identical boxes: dedupe sections by box before building a tree, or
  an empty duplicate card paints over real content.
- A node hidden via `display: contents` must never also get a `display: none` rule.
- Screenshot parity needs every lazy image forced + decoded first, or diffs are meaningless.
- The Claude preview tool reads .claude/launch.json from the session root, not the subproject.
