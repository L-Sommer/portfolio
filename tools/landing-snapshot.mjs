// Render the landing page and compare it with the design mockup.
// Usage: bun tools/landing-snapshot.mjs <outPrefix> [baseUrl] [width height]
//   -> <outPrefix>.png (render, animations stilled) and, at 1672×941, <outPrefix>-compare.png
//      (mockup above, render below).
import { chromium } from 'playwright';
import sharp from 'sharp';

const [out = 'landing', base = 'http://localhost:4321', W = '1672', H = '941'] = process.argv.slice(2);
const width = Number(W);
const height = Number(H);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${base}/`, { waitUntil: 'load', timeout: 20000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}.png` });
await browser.close();

if (width === 1672 && height === 941) {
  const ref = await sharp('design/landing-reference.png').png().toBuffer();
  const mine = await sharp(`${out}.png`).png().toBuffer();
  const both = await sharp({ create: { width: 1672, height: 941 * 2 + 12, channels: 3, background: '#fff' } })
    .composite([{ input: ref, left: 0, top: 0 }, { input: mine, left: 0, top: 953 }])
    .png()
    .toBuffer();
  await sharp(both).resize(1100).toFile(`${out}-compare.png`);
}
console.log(errors.length ? `page errors: ${errors.join(' | ')}` : 'ok');
