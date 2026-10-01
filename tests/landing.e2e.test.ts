/// <reference types="bun" />
// Browser checks on the landing page (run `bun run build` first).
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { chromium, type Browser, type Page } from 'playwright';
import { serveDist } from './helpers/serve';

let server: ReturnType<typeof Bun.serve>;
let browser: Browser;
let base = '';

beforeAll(async () => {
  server = serveDist();
  base = `http://localhost:${server.port}`;
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser?.close();
  server?.stop(true);
});

async function open(opts: { width?: number; height?: number; reducedMotion?: 'reduce' | 'no-preference' } = {}): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: opts.width ?? 1672, height: opts.height ?? 941 }, reducedMotion: opts.reducedMotion ?? 'no-preference' });
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
const box = (page: Page, sel: string) =>
  page.evaluate((s) => { const r = document.querySelector(s)!.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10); }, sel);

describe('landing navigation', () => {
  test('five circles in the design order with the right destinations', async () => {
    const page = await open();
    const items = await page.$$eval('.lp-item', (els) => els.map((e) => ({
      label: e.querySelector('.lp-label')!.textContent!.replace(/\s+/g, ' ').trim(),
      href: e.getAttribute('href'),
      soon: e.classList.contains('is-soon'),
    })));
    expect(items).toEqual([
      { label: 'Resume', href: null, soon: true },
      { label: 'LinkedIn', href: null, soon: true },
      { label: 'Biology Research Projects', href: null, soon: true },
      { label: 'GitHub', href: 'https://github.com/L-Sommer', soon: false },
      { label: 'Art Portfolio', href: '/portfolio', soon: false },
    ]);
    await page.close();
  });

  test('hover shows the gold halo and gold, longer underline', async () => {
    const page = await open();
    const before = await page.evaluate(() => getComputedStyle(document.querySelectorAll('.lp-rule')[4]).width);
    await page.hover('.lp-item >> nth=4');
    await page.waitForFunction(() => getComputedStyle(document.querySelectorAll('.lp-circle')[4], '::before').opacity === '1');
    await page.waitForTimeout(650);
    const s = await page.evaluate(() => {
      const rule = getComputedStyle(document.querySelectorAll('.lp-rule')[4]);
      return { ruleWidth: rule.width, ruleColor: rule.backgroundColor };
    });
    expect(parseFloat(s.ruleWidth)).toBeGreaterThan(parseFloat(before));
    expect(s.ruleColor).toBe('rgb(195, 163, 90)');
    await page.close();
  });

  test('Resume, LinkedIn and Biology Research show "Coming soon" on hover and do not navigate', async () => {
    const page = await open();
    const soon = page.locator('.lp-item.is-soon');
    expect(await soon.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      await soon.nth(i).hover();
      await page.waitForFunction((n) => getComputedStyle(document.querySelectorAll('.lp-item.is-soon .lp-soon')[n]).opacity === '1', i);
      // aria-disabled makes Playwright wait for it to become enabled; a visitor can still click it.
      await soon.nth(i).click({ force: true });
      await page.waitForTimeout(350);
      expect(new URL(page.url()).pathname).toBe('/');
    }
    await page.close();
  }, 15000);

  test('clicking a circle ripples, then navigates', async () => {
    const page = await open();
    const circle = await page.locator('.lp-item >> nth=4').locator('.lp-circle').boundingBox();
    await page.mouse.move(circle!.x + circle!.width / 2, circle!.y + circle!.height / 2);
    await page.mouse.down();
    expect(await page.locator('.lp-ripple').count()).toBe(1);
    await page.mouse.up();
    await page.waitForURL('**/portfolio', { timeout: 3000 });
    expect(new URL(page.url()).pathname).toBe('/portfolio');
    await page.close();
  });
});

describe('landing motion', () => {
  test('leaves, hills and lines move; name and navigation stay still', async () => {
    const page = await open();
    const snap = () => page.evaluate(() => ({
      leaf: getComputedStyle(document.querySelector('.bt-tl .flutter')!).transform,
      hill: document.querySelector('.bt-hills [data-wind]')!.getAttribute('d'),
      gold: document.querySelector('.bt-gold')!.getAttribute('d'),
    }));
    const a = await snap();
    const nameA = await box(page, '.lp-name');
    const navA = await box(page, '.lp-nav');
    await page.waitForTimeout(1200);
    const b = await snap();
    expect(b.leaf).not.toBe(a.leaf);
    expect(b.hill).not.toBe(a.hill);
    expect(b.gold).not.toBe(a.gold);
    expect(await box(page, '.lp-name')).toEqual(nameA);
    expect(await box(page, '.lp-nav')).toEqual(navA);
    expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(40);
    await page.close();
  });

  test('the top-right sage shape is stationary while its gold line drifts', async () => {
    const page = await open();
    const snap = () => page.evaluate(() => ({
      shape: [...document.querySelectorAll('.bt-tr path:not(.bt-gold)')].map((e) => e.getAttribute('d')).join('|'),
      gold: document.querySelector('.bt-tr .bt-gold')!.getAttribute('d'),
    }));
    const a = await snap();
    await page.waitForTimeout(1200);
    const b = await snap();
    expect(b.shape).toBe(a.shape);
    expect(b.gold).not.toBe(a.gold);
    await page.close();
  });

  test('reduced motion holds the scene still', async () => {
    const page = await open({ reducedMotion: 'reduce' });
    const hill = () => page.evaluate(() => document.querySelector('.bt-hills [data-wind]')!.getAttribute('d'));
    const a = await hill();
    await page.waitForTimeout(800);
    expect(await hill()).toBe(a);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await page.close();
  });

  test('every leaf rotates about its own stem (no drift of the pivot)', async () => {
    const page = await open();
    await page.waitForTimeout(500);
    const drift = await page.evaluate(() => Math.max(...[...document.querySelectorAll<SVGGElement>('.bt .sway, .bt .flutter')].map((g) => {
      const a = g.getCTM()!, p = (g.parentNode as SVGGElement).getCTM()!;
      return Math.hypot(a.e - p.e, a.f - p.f);
    })));
    expect(drift).toBeLessThan(0.01);
    await page.close();
  });
});

describe('butterfly easter egg', () => {
  const lTop = (page: Page) => page.evaluate(() => {
    const n = document.querySelector('.lp-name')!; const r = document.createRange();
    r.setStart(n.firstChild!, 0); r.setEnd(n.firstChild!, 1); const b = r.getBoundingClientRect();
    return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  });
  const bf = (page: Page) => page.evaluate(() => [...document.querySelectorAll('.bf')].map((e) => {
    const r = e.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, bottom: r.bottom };
  }));
  /** A point that is actually on a painted top-left leaf (what elementFromPoint reports). */
  const leafPoint = (page: Page, nth = 0) => page.evaluate((k) => {
    const hits = [...document.querySelectorAll<SVGPathElement>('.bt-tl .lf')]
      .map((l) => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })
      .filter((p) => p.x > 0 && p.y > 0 && document.elementFromPoint(p.x, p.y)?.classList.contains('lf'));
    return hits[k % hits.length];
  }, nth);
  const visit = async (page: Page, p: { x: number; y: number }) => { await page.mouse.move(p.x - 3, p.y - 2); await page.mouse.move(p.x, p.y); };

  test('touching a leaf releases one butterfly that perches on the L, then leaves', async () => {
    const page = await open();
    await visit(page, await leafPoint(page, 0));
    await page.waitForTimeout(400);
    expect((await bf(page)).length).toBe(1);
    // More hovering while it is out does not release a second one.
    await visit(page, await leafPoint(page, 3));
    await page.waitForTimeout(200);
    expect((await bf(page)).length).toBe(1);
    // Perched on the left end of the L's top serif.
    await page.waitForTimeout(2600);
    const [perched] = await bf(page);
    const L = await lTop(page);
    expect(perched.cx).toBeGreaterThan(L.left - 4);
    expect(perched.cx).toBeLessThan(L.left + (L.right - L.left) * 0.25);
    expect(perched.cy).toBeLessThan(L.top + (L.bottom - L.top) * 0.35);
    // Flies off and is removed, then can be released again.
    await page.waitForTimeout(7000);
    expect((await bf(page)).length).toBe(0);
    await page.mouse.move(800, 800);
    await visit(page, await leafPoint(page, 1));
    await page.waitForTimeout(300);
    expect((await bf(page)).length).toBe(1);
    await page.close();
  }, 20000);

  for (const [w, h] of [[1672, 941], [1440, 700], [1280, 800], [390, 844]]) {
    test(`${w}×${h}: the navigation circles and empty paper near the leaves never release it`, async () => {
      const page = await open({ width: w, height: h });
      // The mouse starts at (0,0), which is among the leaves; park it somewhere neutral first so
      // the sweep below doesn't travel across them.
      await page.mouse.move(w / 2, h - 4);
      // Sweep the pointer across every circle, the way someone would on the way to clicking one.
      const circles = await page.$$eval('.lp-circle', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; }));
      for (const c of circles) {
        for (const [dx, dy] of [[0, 0], [-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) await page.mouse.move(c.x + dx * c.r, c.y + dy * c.r, { steps: 3 });
      }
      // Empty paper inside the leaf layer's bounding box, at least 20px clear of any leaf or stem
      // (leaves sway a few px, so points right at a leaf's edge would legitimately touch it).
      const empty = await page.evaluate(() => {
        const b = document.querySelector('.bt-tl')!.getBoundingClientRect();
        const clear = (x: number, y: number) => {
          for (let a = 0; a < 16; a++) for (const r of [0, 10, 20]) {
            const el = document.elementFromPoint(x + r * Math.cos((a * Math.PI) / 8), y + r * Math.sin((a * Math.PI) / 8));
            if (!el || el.closest('.bt-tl, .lp-item, .lp-name')) return false;
          }
          return true;
        };
        const pts: { x: number; y: number }[] = [];
        for (let y = b.top + 24; y < b.bottom - 4; y += 10) for (let x = b.left + 24; x < b.right - 4; x += 10) if (clear(x, y)) pts.push({ x, y });
        return pts.filter((_, i) => i % 4 === 0).slice(0, 40);
      });
      expect(empty.length).toBeGreaterThanOrEqual(3);
      for (const p of empty) await page.mouse.move(p.x, p.y);
      await page.waitForTimeout(300);
      expect((await bf(page)).length).toBe(0);
      await page.close();
    }, 20000);
  }

  test('is skipped for reduced motion', async () => {
    const page = await open({ reducedMotion: 'reduce' });
    await visit(page, await leafPoint(page, 0));
    await page.waitForTimeout(500);
    expect((await bf(page)).length).toBe(0);
    await page.close();
  });

  test('never blocks the navigation circles', async () => {
    const page = await open();
    const c = await page.locator('.lp-item >> nth=4').locator('.lp-circle').boundingBox();
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.lp-item') !== null, [c!.x + c!.width / 2, c!.y + c!.height / 2]);
    expect(hit).toBe(true);
    await page.close();
  });
});

describe('landing layout', () => {
  for (const [w, h] of [[360, 640], [390, 844], [768, 1024], [1280, 800], [1672, 941], [1920, 1080]]) {
    test(`${w}×${h}: no horizontal scroll, labels and name inside the viewport`, async () => {
      const page = await open({ width: w, height: h });
      const r = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        edges: [...document.querySelectorAll('.lp-label, .lp-name')].map((e) => { const b = e.getBoundingClientRect(); return [b.left, b.right]; }),
      }));
      expect(r.scrollW).toBe(w);
      for (const [l, rt] of r.edges) {
        expect(l).toBeGreaterThanOrEqual(8);
        expect(rt).toBeLessThanOrEqual(w - 8);
      }
      await page.close();
    });
  }
});
