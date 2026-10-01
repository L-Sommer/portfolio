/// <reference types="bun" />
// Browser checks on the Past Works gallery hover titles (run `bun run build` first).
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { chromium, type Browser, type Page } from 'playwright';
import { serveDist } from './helpers/serve';

const TITLES = ['Messy Desk', 'So Loud', 'Bright Light', 'City 101', 'Dancer', 'Re-imagine', 'Owl Mug'];

let server: ReturnType<typeof Bun.serve>;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = serveDist();
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`http://localhost:${server.port}/portfolio/past-works`, { waitUntil: 'load' });
});

afterAll(async () => {
  await browser?.close();
  server?.stop(true);
});

// Wait for the 0.6s fade to finish on overlay i (resolves as soon as it does).
const faded = (i: number) =>
  page.waitForFunction((n) => getComputedStyle(document.querySelectorAll('.hover-details')[n]).opacity === '1', i, { timeout: 3000 });

const overlayState = (i: number) =>
  page.evaluate((n) => {
    const d = document.querySelectorAll('.hover-details')[n] as HTMLElement;
    const c = getComputedStyle(d);
    const t = getComputedStyle(d.querySelector('.hover-title')!);
    return { opacity: Number(c.opacity), bg: c.backgroundColor, font: t.fontFamily, size: t.fontSize, color: t.color, text: d.textContent?.trim() };
  }, i);

describe('Past Works hover titles', () => {
  test('every piece has its title, hidden until hover', async () => {
    const titles = await page.$$eval('.hover-title', (els) => els.map((e) => e.textContent?.trim()));
    expect(titles).toEqual(TITLES);
    // Let any load-time transition finish before checking the resting state.
    await page.mouse.move(5, 5);
    await page.waitForFunction(() => [...document.querySelectorAll('.hover-details')].every((d) => getComputedStyle(d).opacity === '0'), undefined, { timeout: 2000 }).catch(() => {});
    for (let i = 0; i < TITLES.length; i++) expect((await overlayState(i)).opacity).toBe(0);
  });

  test('hovering a piece fades in the darkened overlay and title (Wix styling)', async () => {
    for (let i = 0; i < TITLES.length; i++) {
      const btn = page.locator('[data-lightbox="past-works"]').nth(i);
      await btn.scrollIntoViewIfNeeded();
      await btn.hover();
      await faded(i);
      const s = await overlayState(i);
      expect(s.opacity, TITLES[i]).toBe(1);
      expect(s.bg).toBe('rgba(0, 0, 0, 0.6)');
      expect(s.font).toContain('Wix Madefor Display');
      expect(s.size).toBe('32px');
      expect(s.color).toBe('rgb(255, 255, 255)');
      expect(s.text).toBe(TITLES[i]);
    }
  }, 30000);

  test('the title is centred over the image', async () => {
    const btn = page.locator('[data-lightbox="past-works"]').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.hover();
    await faded(0);
    const [b, t] = await Promise.all([btn.boundingBox(), page.locator('.hover-title').first().boundingBox()]);
    expect(Math.abs(t!.y + t!.height / 2 - (b!.y + b!.height / 2))).toBeLessThan(2);
    expect(Math.abs(t!.x + t!.width / 2 - (b!.x + b!.width / 2))).toBeLessThan(2);
  });

  test('clicking still opens the lightbox on that piece', async () => {
    await page.locator('[data-lightbox="past-works"]').nth(2).click();
    const state = await page.evaluate(() => { const d = document.getElementById('lb-past-works') as HTMLDialogElement; return { open: d.open, index: d.dataset.index }; });
    expect(state).toEqual({ open: true, index: '2' });
    await page.keyboard.press('Escape');
  });
});
