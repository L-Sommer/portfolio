// Small geometry helpers shared by the landing page's server render and its animation script.

export type Pt = [number, number];

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). Starts with "M". */
export function smoothPath(points: Pt[], tension = 0.5): string {
  if (points.length < 2) return '';
  const p = points;
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const k = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

/** Point and tangent angle (degrees) on a cubic Bézier at t. */
export function bezierAt(b: [Pt, Pt, Pt, Pt], t: number): { p: Pt; angle: number } {
  const [a, c1, c2, z] = b;
  const u = 1 - t;
  const x = u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * z[0];
  const y = u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * z[1];
  const dx = 3 * u * u * (c1[0] - a[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (z[0] - c2[0]);
  const dy = 3 * u * u * (c1[1] - a[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (z[1] - c2[1]);
  return { p: [x, y], angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

/** Deterministic pseudo-random sequence (so server render and layout are stable). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/**
 * A shape whose edge points drift gently, like grass or water in a breeze.
 * `edge` is the moving outline; `close` is appended verbatim (e.g. "L1672,520 L0,520 Z").
 */
export interface WindShape {
  id: string;
  edge: Pt[];
  close: string;
  /** Max drift per point in design units: [x, y]. */
  amp: Pt;
  /** Seconds per cycle (each point varies slightly around this). */
  period: number;
  seed: number;
}

export interface WindPoint { base: Pt; ax: number; ay: number; w1: number; w2: number; ph1: number; ph2: number }

/** Precompute per-point motion parameters for a shape. */
export function windPoints(s: WindShape): WindPoint[] {
  const r = seeded(s.seed);
  return s.edge.map((base) => ({
    base,
    ax: s.amp[0] * (0.5 + r() * 0.5),
    ay: s.amp[1] * (0.6 + r() * 0.4),
    w1: (2 * Math.PI) / (s.period * (0.8 + r() * 0.4)),
    w2: (2 * Math.PI) / (s.period * (1.7 + r() * 0.8)),
    ph1: r() * Math.PI * 2,
    ph2: r() * Math.PI * 2,
  }));
}

/** Path for a wind shape at time t (seconds). Two summed sines per point avoid a visible loop. */
export function windPath(s: WindShape, pts: WindPoint[], t: number): string {
  const moved = pts.map(({ base, ax, ay, w1, w2, ph1, ph2 }): Pt => [
    base[0] + ax * (0.7 * Math.sin(w1 * t + ph1) + 0.3 * Math.sin(w2 * t + ph2)),
    base[1] + ay * (0.7 * Math.sin(w1 * t + ph1 + 1.3) + 0.3 * Math.sin(w2 * t + ph2 + 0.7)),
  ]);
  return smoothPath(moved) + (s.close ? ' ' + s.close : '');
}
