// Extract every rich-text block from the live Wix pages as sanitized HTML (p, br, em, strong,
// u, a) with its desktop bounding box, so page copy is never retyped by hand.
// Usage: bun tools/extract-text.mjs <outFile> [viewportWidth]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const outFile = process.argv[2] ?? 'text.json';
const width = Number(process.argv[3] ?? 1280);
const base = 'https://lilys271.wixsite.com/portfolio';
const slugs = ['', 'blank-1', 'blank-3', 'blank', 'blank-2-1-1', 'blank-2-1', 'blank-2'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 800 } });
const result = {};
for (const slug of slugs) {
  await page.goto(`${base}/${slug}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);
  result[slug || 'home'] = await page.evaluate(() => {
    const clean = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const inner = [...node.childNodes].map(clean).join('');
      const tag = node.tagName.toLowerCase();
      const cs = getComputedStyle(node);
      if (tag === 'br') return '<br>';
      if (tag === 'a') return `<a href="${node.getAttribute('href')}">${inner}</a>`;
      if (/^h[1-6]$/.test(tag) || tag === 'p' || tag === 'li') return `<${tag === 'li' ? 'li' : tag}>${inner}</${tag === 'li' ? 'li' : tag}>`;
      if (tag === 'ul' || tag === 'ol') return `<${tag}>${inner}</${tag}>`;
      let out = inner;
      if (cs.fontStyle === 'italic' && getComputedStyle(node.parentElement).fontStyle !== 'italic') out = `<em>${out}</em>`;
      if (+cs.fontWeight >= 600 && +getComputedStyle(node.parentElement).fontWeight < 600) out = `<strong>${out}</strong>`;
      return out;
    };
    return [...document.querySelectorAll('[data-testid="richTextElement"]')]
      .filter((el) => el.getBoundingClientRect().width > 0 && !el.closest('header'))
      .map((el) => {
        const r = el.getBoundingClientRect();
        const first = [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li')].find((n) => n.innerText.trim()) ?? el;
        const cs = getComputedStyle(first.querySelector('span') ?? first);
        const ps = getComputedStyle(first);
        return {
          style: {
            font: cs.fontFamily.split(',')[0].replace(/"/g, ''), size: parseFloat(cs.fontSize), weight: cs.fontWeight,
            lineHeight: parseFloat(cs.lineHeight) || null, letterSpacing: cs.letterSpacing, color: cs.color,
            align: ps.textAlign, transform: cs.textTransform,
          },
          box: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
          html: [...el.childNodes].map(clean).join('').replace(/ /g, '&nbsp;'),
        };
      });
  });
  console.log(slug || 'home', result[slug || 'home'].length, 'blocks');
}
writeFileSync(outFile, JSON.stringify(result, null, 2));
await browser.close();
