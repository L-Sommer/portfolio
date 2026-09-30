// Capture the live Wix portfolio: full-page screenshots plus a JSON manifest of every
// text block, image, link and section background, at desktop and mobile widths.
// Usage: bun tools/capture.mjs <outDir> [baseUrl]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] ?? 'capture';
const base = process.argv[3] ?? 'https://lilys271.wixsite.com/portfolio';
const slugs = ['', 'blank-1', 'blank-3', 'blank', 'blank-2-1-1', 'blank-2-1', 'blank-2'];
const viewports = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

for (const [vpName, viewport] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const slug of slugs) {
    const name = slug || 'home';
    await page.goto(`${base}/${slug}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    // Scroll through the page so lazy images load, then return to top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    // Drop the "Built on Wix" banner so screenshots match the replica.
    await page.evaluate(() => {
      document.querySelectorAll('#WIX_ADS, [id^="wix-ads"], [data-testid*="freemium"]').forEach((e) => e.remove());
      const banner = [...document.querySelectorAll('a')].find((a) => a.href.includes('wixharmony.com'));
      banner?.closest('div[id], header, section')?.remove();
    });
    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
      };
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0;
      };
      const texts = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const el = node.parentElement.closest('p, h1, h2, h3, h4, h5, h6, li, a, span, button, div');
        if (!el || seen.has(el) || !visible(el)) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        texts.push({
          tag: el.tagName.toLowerCase(),
          text: el.innerText.trim(),
          box: rect(el),
          font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, style: cs.fontStyle,
          lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: cs.color,
          align: cs.textAlign, transform: cs.textTransform, decoration: cs.textDecorationLine,
        });
      }
      const images = [...document.querySelectorAll('img')].filter(visible).map((img) => {
        const cs = getComputedStyle(img);
        return {
          src: img.currentSrc || img.src, alt: img.alt, box: rect(img),
          natural: { w: img.naturalWidth, h: img.naturalHeight },
          objectFit: cs.objectFit, objectPosition: cs.objectPosition, radius: cs.borderRadius,
          link: img.closest('a')?.href ?? null,
        };
      });
      const bgImages = [...document.querySelectorAll('*')].filter((el) => {
        const b = getComputedStyle(el).backgroundImage;
        return b && b !== 'none' && b.includes('url(') && visible(el);
      }).map((el) => ({ bg: getComputedStyle(el).backgroundImage, box: rect(el) }));
      const videos = [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc || v.src, poster: v.poster, box: rect(v) }));
      const links = [...document.querySelectorAll('a[href]')].filter(visible).map((a) => ({
        text: a.innerText.trim(), href: a.href, target: a.target, box: rect(a),
      }));
      const sections = [...document.querySelectorAll('section, header, footer, [data-mesh-id], [id^="comp-"]')]
        .filter(visible)
        .map((el) => {
          const cs = getComputedStyle(el);
          return { tag: el.tagName.toLowerCase(), id: el.id, box: rect(el), bg: cs.backgroundColor, border: cs.border, radius: cs.borderRadius, shadow: cs.boxShadow };
        })
        .filter((s) => s.bg !== 'rgba(0, 0, 0, 0)' || s.border.startsWith('0') === false || s.shadow !== 'none');
      const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content ?? null,
        favicon: document.querySelector('link[rel*="icon"]')?.href ?? null,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        height: document.documentElement.scrollHeight,
        fonts: [...new Set(fonts)], texts, images, bgImages, videos, links, sections,
      };
    });
    writeFileSync(join(outDir, `${name}.${vpName}.json`), JSON.stringify(data, null, 2));
    await page.screenshot({ path: join(outDir, `${name}.${vpName}.png`), fullPage: true });
    console.log(`${vpName.padEnd(7)} ${name.padEnd(12)} h=${data.height} texts=${data.texts.length} imgs=${data.images.length} bg=${data.bgImages.length} links=${data.links.length}`);
  }
  await ctx.close();
}
await browser.close();
