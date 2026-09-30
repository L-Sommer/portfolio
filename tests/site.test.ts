/// <reference types="bun" />
// Structural checks on the generated layout data and the built site (run `bun run build` first).
import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import layout from '../src/data/layout.json';
import mediaMap from '../tools/media-map.json';

const DIST = join(import.meta.dir, '..', 'dist');
const ASSETS = join(import.meta.dir, '..', 'src', 'assets', 'portfolio');

const PORTFOLIO_ROUTES = [
  '/portfolio', '/portfolio/about', '/portfolio/past-works', '/portfolio/advanced',
  '/portfolio/green', '/portfolio/we-are-shaped', '/portfolio/view-of-a-classroom',
];
const ALL_ROUTES = ['/', '/resume', '/research', ...PORTFOLIO_ROUTES];

type AnyNode = { kind: string; image?: string; link?: string | null; children?: AnyNode[] };
const walk = (n: AnyNode, out: AnyNode[] = []) => { out.push(n); n.children?.forEach((c) => walk(c, out)); return out; };
const nodesOf = (route: string) => layout.pages.find((p) => p.route === route)!.bands.flatMap((b) => walk(b as AnyNode));
const htmlFor = (route: string) => readFileSync(join(DIST, route === '/' ? '' : route, 'index.html'), 'utf8');

describe('layout data', () => {
  test('covers all seven Wix pages', () => {
    expect(layout.pages.map((p) => p.route).sort()).toEqual([...PORTFOLIO_ROUTES].sort());
  });

  test('uses every one of the 27 captured images, and each file exists', () => {
    const used = new Set(layout.pages.flatMap((p) => p.bands.flatMap((b) => walk(b as AnyNode))).filter((n) => n.image).map((n) => n.image!));
    const expected = new Set(Object.values(mediaMap));
    expect(expected.size).toBe(27);
    expect([...used].sort()).toEqual([...expected].sort());
    const files = readdirSync(ASSETS).map((f) => f.replace(/\.\w+$/, ''));
    for (const name of expected) expect(files).toContain(name);
  });

  test('image links point at replica routes, never at Wix', () => {
    const links = layout.pages.flatMap((p) => p.bands.flatMap((b) => walk(b as AnyNode))).map((n) => n.link).filter(Boolean) as string[];
    expect(links.sort()).toEqual(['/portfolio/green', '/portfolio/view-of-a-classroom', '/portfolio/we-are-shaped']);
  });

  test('every page has at least one band with content', () => {
    for (const route of PORTFOLIO_ROUTES) expect(nodesOf(route).filter((n) => n.kind !== 'band').length).toBeGreaterThan(0);
  });
});

describe('built site', () => {
  test('every route is built', () => {
    for (const route of ALL_ROUTES) expect(existsSync(join(DIST, route === '/' ? '' : route, 'index.html'))).toBe(true);
  });

  test('no page references Wix hosts', () => {
    for (const route of ALL_ROUTES) expect(htmlFor(route)).not.toMatch(/wixsite\.com|wixstatic\.com|parastorage\.com/);
  });

  test('every internal link resolves to a built page', () => {
    for (const route of ALL_ROUTES) {
      for (const [, href] of htmlFor(route).matchAll(/<a[^>]+href="([^"#]+)"/g)) {
        if (/^https?:\/\//.test(href)) continue;
        const target = join(DIST, href === '/' ? '' : href, 'index.html');
        expect(existsSync(target), `${route} links to missing ${href}`).toBe(true);
      }
    }
  });

  test('every image src and srcset candidate exists in dist', () => {
    for (const route of ALL_ROUTES) {
      const html = htmlFor(route);
      const urls = [
        ...[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]),
        ...[...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0])),
      ];
      for (const u of urls) expect(existsSync(join(DIST, decodeURIComponent(u.replace(/&amp;/g, '&')))), `${route}: ${u}`).toBe(true);
    }
  });

  test('portfolio pages carry the full navigation including the Advanced dropdown', () => {
    for (const route of PORTFOLIO_ROUTES) {
      const html = htmlFor(route);
      for (const href of ['/portfolio/about', '/portfolio/past-works', '/portfolio/advanced', '/portfolio/green', '/portfolio/we-are-shaped', '/portfolio/view-of-a-classroom']) {
        expect(html).toContain(`href="${href}"`);
      }
      expect(html).not.toMatch(/Built on/);
    }
  });

  test('Past Works has a seven-image lightbox', () => {
    const html = htmlFor('/portfolio/past-works');
    expect(html.match(/data-lightbox="past-works"/g)?.length).toBe(7);
    expect(html.match(/class="lb-slide"/g)?.length).toBe(7);
  });

  test('landing page links to the portfolio and all stubs', () => {
    const html = htmlFor('/');
    for (const href of ['/portfolio', '/resume', '/research', 'https://github.com/L-Sommer']) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('LinkedIn');
  });
});
