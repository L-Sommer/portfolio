// Visual parity check: screenshot the replica at the capture viewports and pixel-diff each page
// against the Wix capture (with the 34px "Built on Wix" strip cropped off the Wix image).
// Usage: bun tools/parity.mjs <baseUrl> <captureDir> <outDir>
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:4321', capDir = 'live-tests/2026-09-30-wix-capture', outDir = 'live-tests/parity'] = process.argv.slice(2);
const BANNER = 34;
const pages = { home: '/portfolio', 'blank-1': '/portfolio/about', 'blank-3': '/portfolio/past-works', blank: '/portfolio/advanced', 'blank-2-1-1': '/portfolio/green', 'blank-2-1': '/portfolio/we-are-shaped', 'blank-2': '/portfolio/view-of-a-classroom' };
const viewports = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const rows = [];
for (const [vp, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  for (const [slug, route] of Object.entries(pages)) {
    await page.goto(base + route, { waitUntil: 'load' });
    await page.evaluate(async () => {
      // Scroll through so lazy images start, then poll until every image has decoded pixels.
      document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
      window.scrollTo(0, 0);
      await document.fonts.ready;
      const t0 = Date.now();
      while (Date.now() - t0 < 20000 && ![...document.images].every((i) => i.complete && i.naturalWidth > 0)) {
        await new Promise((r) => setTimeout(r, 200));
      }
      await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
    });
    const shot = PNG.sync.read(await page.screenshot({ fullPage: true }));
    const wixFull = PNG.sync.read(readFileSync(join(capDir, `${slug}.${vp}.png`)));
    const wix = new PNG({ width: wixFull.width, height: wixFull.height - BANNER });
    PNG.bitblt(wixFull, wix, 0, BANNER, wixFull.width, wixFull.height - BANNER, 0, 0);

    const w = Math.min(shot.width, wix.width);
    const h = Math.min(shot.height, wix.height);
    const crop = (src) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(src, o, 0, 0, w, h, 0, 0); return o; };
    const a = crop(wix), b = crop(shot), diff = new PNG({ width: w, height: h });
    const bad = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.2 });
    // Side-by-side: Wix | replica | diff
    const sbs = new PNG({ width: w * 3, height: h });
    PNG.bitblt(a, sbs, 0, 0, w, h, 0, 0); PNG.bitblt(b, sbs, 0, 0, w, h, w, 0); PNG.bitblt(diff, sbs, 0, 0, w, h, w * 2, 0);
    writeFileSync(join(outDir, `${slug}.${vp}.replica.png`), PNG.sync.write(shot));
    writeFileSync(join(outDir, `${slug}.${vp}.compare.png`), PNG.sync.write(sbs));
    const row = { page: route, vp, wixH: wix.height, replicaH: shot.height, heightDelta: shot.height - wix.height, diffPct: +((100 * bad) / (w * h)).toFixed(2) };
    rows.push(row);
    console.log(`${vp.padEnd(7)} ${route.padEnd(32)} height wix=${row.wixH} replica=${row.replicaH} (${row.heightDelta >= 0 ? '+' : ''}${row.heightDelta})  diff=${row.diffPct}%`);
  }
  await page.close();
}
writeFileSync(join(outDir, 'parity.json'), JSON.stringify(rows, null, 2));
await browser.close();
