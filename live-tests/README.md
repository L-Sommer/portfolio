# live-tests

Smoke-test and parity evidence, one folder per run: `YYYY-MM-DD-short-test-id/`.

- `*-wix-capture/` — the captured Wix site (input to tools/build-layout.mjs). Committed.
- `*-parity-rN/` — tools/parity.mjs output. Only `parity.json` is committed; the screenshots
  (`*.replica.png`, `*.compare.png` = Wix | replica | diff) are regenerated with:

```bash
bun run build && bun run preview &
bun tools/parity.mjs http://localhost:4321 live-tests/2026-09-30-wix-capture live-tests/<date>-parity-rN
```
