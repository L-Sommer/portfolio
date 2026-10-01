/// <reference types="bun" />
// Unit tests for the landing scene's curve helpers.
import { describe, expect, test } from 'bun:test';
import { bezierAt, seeded, smoothPath, windPath, windPoints, type Pt, type WindShape } from '../src/lib/curves';

const nums = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('smoothPath', () => {
  test('starts at the first point and ends at the last', () => {
    const pts: Pt[] = [[0, 0], [50, 20], [100, 0], [150, 30]];
    const d = smoothPath(pts);
    expect(d.startsWith('M0,0')).toBe(true);
    const v = nums(d);
    expect(v.slice(-2)).toEqual([150, 30]);
    expect(d.match(/C/g)?.length).toBe(pts.length - 1);
  });

  test('passes through every interior point', () => {
    const pts: Pt[] = [[0, 0], [40, 10], [80, -10], [120, 0]];
    const d = smoothPath(pts);
    for (const [x, y] of pts.slice(1)) expect(d).toContain(` ${x},${y}`);
  });

  test('returns an empty path for fewer than two points', () => {
    expect(smoothPath([[1, 1]])).toBe('');
  });
});

describe('bezierAt', () => {
  const b: [Pt, Pt, Pt, Pt] = [[0, 0], [10, 0], [20, 0], [30, 0]];
  test('endpoints and direction', () => {
    expect(bezierAt(b, 0).p).toEqual([0, 0]);
    expect(bezierAt(b, 1).p).toEqual([30, 0]);
    expect(bezierAt(b, 0.5).angle).toBeCloseTo(0, 6);
    expect(bezierAt([[0, 0], [0, 10], [0, 20], [0, 30]], 0.5).angle).toBeCloseTo(90, 6);
  });
});

describe('wind motion', () => {
  const shape: WindShape = { id: 's', seed: 3, period: 10, amp: [8, 6], close: 'L100,100 Z', edge: [[0, 50], [50, 40], [100, 50]] };

  test('seeded sequences are deterministic', () => {
    const a = seeded(42), b = seeded(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  test('is deterministic for a given time and keeps the closing segment', () => {
    const p1 = windPoints(shape), p2 = windPoints(shape);
    expect(windPath(shape, p1, 3.7)).toBe(windPath(shape, p2, 3.7));
    expect(windPath(shape, p1, 3.7).endsWith('L100,100 Z')).toBe(true);
  });

  test('moves over time but never further than its amplitude', () => {
    const pts = windPoints(shape);
    expect(windPath(shape, pts, 0)).not.toBe(windPath(shape, pts, 2.5));
    for (let t = 0; t < 60; t += 0.37) {
      const first = nums(windPath(shape, pts, t)).slice(0, 2);
      expect(Math.abs(first[0] - 0)).toBeLessThanOrEqual(8 + 0.1);
      expect(Math.abs(first[1] - 50)).toBeLessThanOrEqual(6 + 0.1);
    }
  });
});
