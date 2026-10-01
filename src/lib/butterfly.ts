// Butterfly easter egg: fly from the leaves to the top of the "L", flap, rest, fly off right.
// One butterfly at a time; it can be released again once it has left. Skipped for reduced motion.
type V = { x: number; y: number };

const COOLDOWN_MS = 800;
const ease = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u); // easeInOutSine
const easeIn = (u: number) => u * u * (1.6 - 0.6 * u); // soft start, keeps moving at the end
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const bez = (a: V, b: V, c: V, d: V, t: number): V => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};

/** Top of the "L" stem in the name, relative to the landing container. */
function landingSpot(landing: HTMLElement): V | null {
  const name = landing.querySelector<HTMLElement>('.lp-name');
  const text = name?.firstChild;
  if (!name || !text || text.nodeType !== Node.TEXT_NODE) return null;
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 1);
  const r = range.getBoundingClientRect();
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  const cs = getComputedStyle(name);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText('L');
  // The range box spans the font's ascent+descent; the baseline sits `fontBoundingBoxAscent` down.
  const pad = (r.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
  const baseline = r.top + pad + m.fontBoundingBoxAscent;
  const top = baseline - m.actualBoundingBoxAscent;
  const L = landing.getBoundingClientRect();
  return { x: r.left + r.width * 0.3 - L.left, y: top - L.top };
}

export function initButterfly() {
  const landing = document.querySelector<HTMLElement>('.landing');
  const zone = landing?.querySelector<HTMLElement>('.bf-zone');
  const template = document.getElementById('bf-template') as HTMLTemplateElement | null;
  if (!landing || !zone || !template) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let busy = false;
  let readyAt = 0;

  const release = (e: PointerEvent) => {
    if (busy || reduce.matches || performance.now() < readyAt) return;
    const spot = landingSpot(landing);
    if (!spot) return;
    busy = true;
    const L = landing.getBoundingClientRect();
    fly(
      { x: e.clientX - L.left, y: e.clientY - L.top },
      spot,
      L.width,
      parseFloat(getComputedStyle(landing.querySelector('.lp-name')!).fontSize),
    ).then(() => {
      busy = false;
      readyAt = performance.now() + COOLDOWN_MS;
    });
  };
  zone.addEventListener('pointerenter', release);
  zone.addEventListener('pointermove', release);
  zone.addEventListener('pointerdown', release);

  function fly(start: V, spot: V, width: number, fontSize: number): Promise<void> {
    const el = template!.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const size = Math.max(30, Math.min(52, fontSize * 0.3));
    el.style.width = `${size}px`;
    landing!.appendChild(el);
    const wings = [...el.querySelectorAll<SVGGElement>('.bf-wing')];
    // Body bottom is 10.5 viewBox units below the centre; the viewBox is 60 units wide.
    const perUnit = size / 60;
    const perch: V = { x: spot.x, y: spot.y - 10.5 * perUnit };
    const exit: V = { x: width + size * 2, y: perch.y - 70 - Math.random() * 60 };
    const dist = Math.hypot(perch.x - start.x, perch.y - start.y);

    const tIn = clamp(1.4 + dist / 900, 1.6, 2.6);
    const tFlaps = 1.8; // three slow flaps
    const tRest = 2.2;
    const tOut = 3.4;
    const total = tIn + tFlaps + tRest + tOut;

    const inC1 = { x: start.x + (perch.x - start.x) * 0.25, y: start.y - 120 };
    const inC2 = { x: perch.x - 70, y: perch.y - 150 };
    const outC1 = { x: perch.x + 90, y: perch.y - 140 };
    const outC2 = { x: exit.x - 320, y: exit.y + 120 };

    let t = 0;
    let last = performance.now();
    let prev: V = start;
    let rot = 0;

    return new Promise((resolve) => {
      const frame = (now: number) => {
        t += Math.min(0.05, (now - last) / 1000); // cap dt so a hidden tab resumes smoothly
        last = now;
        let p: V;
        let open: number; // wing spread, 0 = edge-on, 1 = fully open
        let scale = 1;
        if (t < tIn) {
          const u = t / tIn;
          p = bez(start, inC1, inC2, perch, ease(u));
          p.y += Math.sin(u * Math.PI * 5) * 7 * (1 - u);
          open = 0.12 + 0.88 * (0.5 + 0.5 * Math.cos(2 * Math.PI * t * 5.5));
          scale = 0.55 + 0.45 * Math.min(1, u / 0.4);
        } else if (t < tIn + tFlaps) {
          const s = t - tIn;
          p = perch;
          open = 0.25 + 0.75 * (0.5 + 0.5 * Math.cos((2 * Math.PI * s) / 0.6));
        } else if (t < tIn + tFlaps + tRest) {
          const s = t - tIn - tFlaps;
          p = perch;
          open = 0.62 + 0.05 * Math.sin((2 * Math.PI * s) / tRest);
        } else {
          const u = Math.min(1, (t - tIn - tFlaps - tRest) / tOut);
          p = bez(perch, outC1, outC2, exit, easeIn(u));
          p.y += Math.sin(u * Math.PI * 6) * 8 * Math.min(1, u * 4);
          open = 0.12 + 0.88 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (t - tIn - tFlaps - tRest) * 5.5));
        }
        // Lean into the direction of travel; sit upright when perched.
        const vx = p.x - prev.x;
        const target = t > tIn && t < tIn + tFlaps + tRest ? 0 : clamp(vx * 4, -22, 22);
        rot += (target - rot) * 0.12;
        prev = p;
        el.style.transform = `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${rot}deg) scale(${scale})`;
        for (const w of wings) w.setAttribute('transform', `scale(${open.toFixed(3)} 1)`);
        if (t < total) requestAnimationFrame(frame);
        else {
          el.remove();
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }
}
