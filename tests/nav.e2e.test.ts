/// <reference types="bun" />
// Browser checks on the built site's desktop navigation (run `bun run build` first).
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { chromium, type Browser, type Page } from 'playwright';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dir, '..', 'dist');
let server: ReturnType<typeof Bun.serve>;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  // Minimal static server for dist/ with clean URLs, like Vercel.
  server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = decodeURIComponent(new URL(req.url).pathname);
      const isFile = (f: string) => statSync(f, { throwIfNoEntry: false })?.isFile() ?? false;
      const file = [join(DIST, path), join(DIST, path, 'index.html')].find(isFile);
      return file ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
    },
  });
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`http://localhost:${server.port}/portfolio/about`, { waitUntil: 'load' });
});

afterAll(async () => {
  await browser?.close();
  server?.stop(true);
});

const rect = (sel: string) =>
  page.evaluate((s) => { const r = document.querySelector(s)!.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; }, sel);
const subOpen = () => page.evaluate(() => getComputedStyle(document.querySelector('.sub')!).display !== 'none');

describe('Advanced dropdown', () => {
  test('stays open while the pointer moves from "Advanced" down to every link', async () => {
    const adv = await rect('.has-sub > a');
    const x = (adv.left + adv.right) / 2;
    await page.mouse.move(x, (adv.top + adv.bottom) / 2);
    expect(await subOpen()).toBe(true);
    const links = await page.$$('.sub a');
    const last = await links[links.length - 1].boundingBox();
    for (let y = adv.bottom; y <= last!.y + last!.height / 2; y += 2) {
      await page.mouse.move(x, y);
      expect(await subOpen(), `closed at y=${y}`).toBe(true);
    }
  });

  test('panel starts flush with the nav item (no hover gap)', async () => {
    await page.hover('.has-sub > a');
    const li = await rect('.has-sub');
    const sub = await rect('.sub');
    expect(sub.top).toBeLessThanOrEqual(li.bottom + 0.5);
  });

  test('links are inset inside the panel, matching Wix spacing', async () => {
    await page.hover('.has-sub > a');
    const sub = await rect('.sub');
    const links = await page.$$eval('.sub a', (as) => as.map((a) => { const r = a.getBoundingClientRect(); const t = document.createRange(); t.selectNodeContents(a); const tr = t.getBoundingClientRect(); return { left: r.left, top: r.top, textRight: tr.right }; }));
    for (const l of links) expect(l.left - sub.left).toBeCloseTo(10, 0);
    expect(links[0].top).toBeCloseTo(84, 0);
    expect(sub.bottom).toBeCloseTo(187, 0);
    expect(sub.right - Math.max(...links.map((l) => l.textRight))).toBeGreaterThanOrEqual(9);
  });

  test('each link navigates to its project page', async () => {
    const hrefs = await page.$$eval('.sub a', (as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual(['/portfolio/green', '/portfolio/we-are-shaped', '/portfolio/view-of-a-classroom']);
    await page.hover('.has-sub > a');
    await page.click('.sub a >> nth=0');
    await page.waitForURL('**/portfolio/green');
    expect(new URL(page.url()).pathname).toBe('/portfolio/green');
  });
});
