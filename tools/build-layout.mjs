// Turn the Wix capture (tools/capture.mjs + tools/extract-text.mjs output) into
// src/data/layout.json: a per-page tree of bands > cards > images/text, each node carrying its
// desktop box (1280 design px, absolute) and mobile box (390 design px, flow margins).
// Usage: bun tools/build-layout.mjs <captureDir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'live-tests/2026-09-30-wix-capture';
const read = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const mediaMap = JSON.parse(readFileSync('tools/media-map.json', 'utf8'));
const textD = read('text.json');
const textM = read('text.mobile.json');

// Wix slug -> new route. Order matches the Wix navigation.
export const PAGES = {
  home: { route: '/portfolio', title: 'Home' },
  'blank-1': { route: '/portfolio/about', title: 'About Me' },
  'blank-3': { route: '/portfolio/past-works', title: 'Past Works' },
  blank: { route: '/portfolio/advanced', title: 'Advanced' },
  'blank-2-1-1': { route: '/portfolio/green', title: 'Green' },
  'blank-2-1': { route: '/portfolio/we-are-shaped', title: 'We Are Shaped' },
  'blank-2': { route: '/portfolio/view-of-a-classroom', title: 'View of A Classroom' },
};
const WIX = 'https://lilys271.wixsite.com/portfolio';
const routeFor = (href) => {
  if (!href?.startsWith(WIX)) return href;
  const slug = href.slice(WIX.length).replace(/^\//, '') || 'home';
  return PAGES[slug]?.route ?? href;
};

const BANNER = 34; // "Built on Wix" bar height, removed in the replica
const SAGE = 'rgb(169, 180, 164)';
const FRAME = 10; // About photo frame: 3px line + 4px gap + 3px line
const GAP = 24; // Wix mobile default spacing, used where its own layout is broken
const PAST_TITLES = ['Messy Desk', 'So Loud', 'Bright Light', 'City 101', 'Dancer', 'Re-imagine', 'Owl Mug'];

const toRgb = (c) => {
  const m = c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
  return m ? `rgb(${m.slice(1).map((v) => Math.round(v * 255)).join(', ')})` : c;
};
const shift = (b, dy) => ({ x: b.x, y: b.y - dy, w: b.w, h: b.h });
const grow = (b, n) => ({ x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n });
const inside = (a, b, tol = 2) =>
  a.x >= b.x - tol && a.y >= b.y - tol && a.x + a.w <= b.x + b.w + tol && a.y + a.h <= b.y + b.h + tol;
const humanize = (s) => s.replace(/^(past|green|shaped|classroom|about|home)-/, '').replace(/-/g, ' ');

function bands(capture, width, footerY) {
  const seen = new Set();
  return capture.sections
    .map((s) => ({ ...s, bg: toRgb(s.bg) }))
    .filter((s) => s.box.w === width && s.box.y > BANNER + 20 && s.box.y < footerY && !s.bg.startsWith('rgba'))
    .filter((s) => !seen.has(s.box.y) && seen.add(s.box.y))
    .sort((a, b) => a.box.y - b.box.y);
}
function cards(capture, width) {
  // Wix nests wrapper elements that share one box; keep a single card per box.
  const seen = new Set();
  return capture.sections
    .map((s) => ({ ...s, bg: toRgb(s.bg) }))
    .filter((s) => s.bg === SAGE && s.box.w < width && s.box.w > 200)
    .filter((s) => { const k = `${s.box.x},${s.box.y},${s.box.w},${s.box.h}`; return !seen.has(k) && seen.add(k); })
    .sort((a, b) => a.box.y - b.box.y || b.box.w - a.box.w);
}
const footerOf = (capture, width) =>
  capture.sections.map((s) => ({ ...s, bg: toRgb(s.bg) })).find((s) => s.bg === 'rgb(15, 35, 6)' && s.box.w === width && s.box.y > 100);

function buildPage(slug) {
  const D = read(`${slug}.desktop.json`);
  const M = read(`${slug}.mobile.json`);
  const dFoot = footerOf(D, 1280);
  const mFoot = footerOf(M, 390);
  const dBands = bands(D, 1280, dFoot.box.y);
  const mBands = bands(M, 390, mFoot.box.y);
  if (dBands.length !== mBands.length) throw new Error(`${slug}: band count ${dBands.length} vs ${mBands.length}`);

  const nodes = [];
  // Cards: pair each desktop card with the first unused mobile card in order (mobile adds nested extras).
  const mCards = cards(M, 390);
  cards(D, 1280).forEach((c) => {
    const m = mCards.find((mc) => !mc.used && (mc.used = true));
    nodes.push({ kind: 'card', d: shift(c.box, BANNER), m: m ? shift(m.box, BANNER) : null, radius: 5, children: [] });
  });

  // Images: pair by media id and occurrence.
  const occ = {};
  const mImgs = M.images.map((i) => ({ ...i, id: i.src.match(/media\/([^/]+)/)?.[1] }));
  D.images.forEach((img) => {
    const id = img.src.match(/media\/([^/]+)/)?.[1];
    const n = (occ[id] = (occ[id] ?? 0) + 1);
    const m = mImgs.filter((x) => x.id === id)[n - 1];
    const name = mediaMap[id];
    if (!name) throw new Error(`${slug}: unmapped media ${id}`);
    const framed = slug === 'blank-1';
    const node = {
      kind: 'image', image: name,
      d: framed ? grow(shift(img.box, BANNER), FRAME) : shift(img.box, BANNER),
      m: m ? (framed ? grow(shift(m.box, BANNER), FRAME) : shift(m.box, BANNER)) : null,
      frame: framed, link: img.link ? routeFor(img.link) : null,
      alt: `${PAGES[slug].title} – ${humanize(name)}`,
    };
    if (slug === 'blank-3') {
      const i = nodes.filter((x) => x.kind === 'image').length;
      node.lightbox = 'past-works';
      node.lightboxIndex = i;
      node.alt = PAST_TITLES[i];
      node.title = PAST_TITLES[i];
    }
    nodes.push(node);
  });

  // Text: pair by DOM index; drop duplicate blocks (Past Works renders its heading twice).
  const seenHtml = new Map();
  textD[slug].forEach((t, i) => {
    const tm = textM[slug][i];
    const node = { kind: 'text', html: t.html, d: shift(t.box, BANNER), m: tm ? shift(tm.box, BANNER) : null, sd: t.style, sm: tm?.style };
    const prev = seenHtml.get(t.html);
    if (prev) {
      if (node.d.y < prev.d.y) prev.d = node.d;
      if (node.m && (!prev.m || node.m.y < prev.m.y)) prev.m = node.m;
      return;
    }
    seenHtml.set(t.html, node);
    nodes.push(node);
  });

  // Hierarchy: each node belongs to the smallest card containing its centre, else to its band.
  const tree = dBands.map((b, i) => ({
    kind: 'band', bg: b.bg, d: shift(b.box, BANNER), m: shift(mBands[i].box, BANNER), children: [],
  }));
  const center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2, w: 0, h: 0 });
  const cardNodes = nodes.filter((n) => n.kind === 'card');
  for (const c of cardNodes) tree.find((b) => inside(center(c.d), b.d, 0)).children.push(c);
  for (const n of nodes.filter((n) => n.kind !== 'card')) {
    const card = cardNodes.filter((c) => inside(center(n.d), c.d, 0)).sort((a, b) => a.d.w * a.d.h - b.d.w * b.d.h)[0];
    (card ?? tree.find((b) => inside(center(n.d), b.d, 0))).children.push(n);
  }

  // Mobile flow. A card whose children all sit outside it on mobile is a Wix glitch (About Me):
  // hide the card and let its children flow in the band. Stray children of an otherwise-valid
  // card (headings dumped at the bottom of Past Works / Advanced) go back to their desktop slot.
  for (const band of tree) {
    for (const card of band.children.filter((c) => c.kind === 'card')) {
      const inl = card.children.filter((c) => c.m && card.m && inside(c.m, card.m));
      card.mobileContents = inl.length === 0;
    }
    layoutMobile(band, band.m);
  }
  const desktopRel = (node, parent) => {
    for (const c of node.children ?? []) desktopRel(c, node);
    if (parent) node.dr = { x: node.d.x - parent.d.x, y: node.d.y - parent.d.y, w: node.d.w, h: node.d.h };
  };
  tree.forEach((b) => desktopRel(b, null));
  return { slug, ...PAGES[slug], docTitle: D.title, bands: tree.map(strip) };
}

function flowItems(container) {
  // Children in mobile flow order; hidden cards contribute their children directly.
  const out = [];
  for (const c of container.children) {
    if (c.kind === 'card' && c.mobileContents) out.push(...c.children.map((g) => ({ ...g, _orig: g, hiddenCard: c })));
    else out.push({ ...c, _orig: c });
  }
  return out;
}

function layoutMobile(container, box) {
  const items = flowItems(container).filter((i) => i.m);
  const inl = items.filter((i) => inside(i.m, box));
  const strays = items.filter((i) => !inside(i.m, box));
  const byDesktop = (a, b) => a.d.y - b.d.y || a.d.x - b.d.x;
  let order = inl.sort((a, b) => a.m.y - b.m.y || a.m.x - b.m.x);
  for (const s of strays.sort(byDesktop)) {
    const idx = order.findIndex((o) => byDesktop(s, o) < 0);
    order.splice(idx === -1 ? order.length : idx, 0, s);
  }
  let prevBottom = box.y;
  let flowBottom = box.y;
  const collapsed = new Set();
  order.forEach((it, i) => {
    const o = it._orig;
    const stray = strays.includes(it);
    // Overlapping an earlier item (hero text over the hero image) -> absolutely positioned.
    const overlaps = !stray && order.slice(0, i).some((p) => !strays.includes(p) && it.m.y < p.m.y + p.m.h - 2 && it.m.x < p.m.x + p.m.w && it.m.x + it.m.w > p.m.x);
    o.mr = { x: it.m.x - box.x, w: it.m.w, h: it.m.h, order: i };
    if (overlaps) {
      o.mr.abs = true;
      o.mr.y = it.m.y - box.y;
    } else {
      let gap = stray ? GAP : it.m.y - prevBottom;
      // First child of a hidden (empty-on-mobile) card starts where that card started.
      if (it.hiddenCard?.m && !collapsed.has(it.hiddenCard)) {
        collapsed.add(it.hiddenCard);
        gap = Math.max(0, it.hiddenCard.m.y - prevBottom);
      }
      o.mr.mt = gap >= 0 ? gap : GAP;
      prevBottom = stray ? prevBottom + o.mr.mt + it.m.h : it.m.y + it.m.h;
      flowBottom = prevBottom;
    }
    if (o.kind === 'card' && !o.mobileContents) layoutMobile(o, o.m);
  });
  const pad = box.y + box.h - flowBottom;
  container.mpb = pad >= 0 ? pad : GAP;
}

function strip(n) {
  const { d, m, _orig, used, sd, sm, children, ...rest } = n;
  const out = { ...rest };
  if (sd) out.sd = { font: sd.font, size: sd.size, lh: sd.lineHeight, weight: sd.weight, align: sd.align, color: sd.color, transform: sd.transform };
  if (sm) out.sm = { size: sm.size, lh: sm.lineHeight, align: sm.align };
  if (n.kind === 'band') out.dh = d.h;
  if (children) out.children = children.map(strip);
  return out;
}

const out = { generatedFrom: dir, pages: Object.keys(PAGES).map(buildPage) };
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/layout.json', JSON.stringify(out, null, 1));
for (const p of out.pages) {
  const count = (n) => (n.children ?? []).reduce((a, c) => a + 1 + count(c), 0);
  console.log(p.route.padEnd(34), 'bands', p.bands.length, 'nodes', p.bands.reduce((a, b) => a + count(b), 0));
}
