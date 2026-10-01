// Scene description for the landing page artwork, in the coordinates of the 1672×941 design
// mockup (design/landing-reference.png). Each layer has its own viewBox so it can be anchored to
// a corner/edge of the viewport and scale independently.
import type { Pt, WindShape } from '../lib/curves';

/** Palette sampled from the design mockup. */
export const palette = {
  paper: '#f5f3ee',
  ink: '#4a5340', // name
  icon: '#434c39',
  label: '#3e413d',
  rule: '#656e58',
  divider: '#717969',
  ring: '#c5c8bd',
  gold: '#c3a35a',
  goldDeep: '#a98a45',
  leafDark: '#6f7a61',
  leafMid: '#9aa28b',
  leafLight: '#c6cbb9',
  sage: '#b2bba6',
  sageDeep: '#959f86',
  sageLight: '#c5c9b7',
  sagePale: '#e2e2d8',
};

export interface LeafSpec {
  /** Position along the stem (0..1). */
  t: number;
  /** -1 = up/left of the stem direction, +1 = down/right. */
  side: -1 | 1;
  /** Angle away from the stem tangent, degrees. */
  ang: number;
  len: number;
  w: number;
  /** Tip bend (-1..1). */
  curl?: number;
  shade?: 'dark' | 'mid' | 'light';
  opacity?: number;
}

export interface BudSpec { t: number; side: -1 | 1; ang: number; stalk: number; size: number }

export interface BranchSpec {
  id: string;
  /** Stem as a cubic Bézier in layer coordinates; the first point is the sway pivot. */
  stem: [Pt, Pt, Pt, Pt];
  stemWidth: number;
  leaves: LeafSpec[];
  buds?: BudSpec[];
  /** Sway amplitude (deg) and period (s). */
  sway: [number, number];
  /** Branch grows from another branch at this t (drawn inside the parent so it sways with it). */
  parent?: { id: string; t: number };
}

/** Faint translucent "shadow" leaves behind the branches. */
export interface GhostLeaf { at: Pt; rot: number; len: number; w: number; opacity: number }

export interface BranchLayer { viewBox: [number, number]; branches: BranchSpec[]; ghosts: GhostLeaf[] }

// ---------- Top-left cluster (mockup region x 0–700, y 0–430) ----------
export const topLeft: BranchLayer = {
  viewBox: [700, 430],
  ghosts: [
    { at: [170, 45], rot: 28, len: 125, w: 30, opacity: 0.16 },
    { at: [205, 150], rot: 72, len: 145, w: 32, opacity: 0.13 },
    { at: [265, 215], rot: 98, len: 115, w: 26, opacity: 0.1 },
    { at: [25, 320], rot: 62, len: 105, w: 24, opacity: 0.12 },
    { at: [420, 120], rot: 14, len: 95, w: 22, opacity: 0.1 },
  ],
  branches: [
    {
      id: 'tl-main',
      stem: [[-12, 152], [90, 98], [235, 40], [478, -6]],
      stemWidth: 3.2,
      sway: [1.4, 8.5],
      leaves: [
        { t: 0.07, side: -1, ang: 62, len: 128, w: 27, shade: 'mid', curl: 0.2 },
        { t: 0.17, side: 1, ang: 108, len: 192, w: 40, shade: 'dark', curl: -0.25 },
        { t: 0.3, side: -1, ang: 42, len: 112, w: 25, shade: 'mid', curl: 0.15 },
        { t: 0.41, side: 1, ang: 62, len: 176, w: 36, shade: 'dark', curl: -0.2 },
        { t: 0.53, side: -1, ang: 34, len: 122, w: 26, shade: 'mid', curl: 0.1 },
        { t: 0.63, side: 1, ang: 27, len: 192, w: 38, shade: 'dark', curl: 0.18 },
        { t: 0.82, side: -1, ang: 30, len: 104, w: 23, shade: 'light', curl: 0.1 },
        { t: 0.92, side: 1, ang: 38, len: 86, w: 19, shade: 'mid' },
        { t: 0.12, side: -1, ang: 100, len: 92, w: 22, shade: 'light', opacity: 0.85 },
        { t: 0.24, side: 1, ang: 84, len: 150, w: 32, shade: 'mid', curl: -0.2 },
        { t: 0.47, side: -1, ang: 58, len: 96, w: 22, shade: 'dark' },
        { t: 0.72, side: 1, ang: 52, len: 120, w: 26, shade: 'mid', curl: -0.1 },
        { t: 0.77, side: -1, ang: 48, len: 92, w: 21, shade: 'dark' },
      ],
    },
    {
      id: 'tl-back',
      stem: [[-14, 96], [70, 58], [170, 24], [310, -12]],
      stemWidth: 1.6,
      sway: [1.9, 10.5],
      leaves: [
        { t: 0.18, side: 1, ang: 70, len: 120, w: 26, shade: 'light', opacity: 0.6, curl: -0.2 },
        { t: 0.4, side: -1, ang: 40, len: 96, w: 22, shade: 'light', opacity: 0.55 },
        { t: 0.58, side: 1, ang: 56, len: 132, w: 28, shade: 'light', opacity: 0.6, curl: -0.15 },
        { t: 0.82, side: 1, ang: 30, len: 104, w: 24, shade: 'mid', opacity: 0.5 },
      ],
    },
    {
      id: 'tl-hang',
      parent: { id: 'tl-main', t: 0.36 },
      stem: [[0, 0], [85, 22], [190, 78], [292, 122]],
      stemWidth: 1.8,
      sway: [2.4, 6.5],
      leaves: [
        { t: 0.3, side: 1, ang: 72, len: 84, w: 15, shade: 'mid', curl: -0.2 },
        { t: 0.52, side: 1, ang: 66, len: 112, w: 15, shade: 'dark', curl: -0.3 },
        { t: 0.68, side: -1, ang: 40, len: 62, w: 13, shade: 'light' },
        { t: 0.82, side: 1, ang: 58, len: 78, w: 14, shade: 'mid', curl: -0.2 },
        { t: 1, side: 1, ang: 12, len: 96, w: 18, shade: 'dark', curl: 0.1 },
      ],
    },
    {
      id: 'tl-twig',
      stem: [[468, -4], [540, 6], [612, 38], [668, 94]],
      stemWidth: 1.3,
      sway: [2.8, 5.5],
      leaves: [
        { t: 0.06, side: 1, ang: 8, len: 82, w: 18, shade: 'light', opacity: 0.75 },
      ],
      buds: [
        { t: 0.34, side: -1, ang: 48, stalk: 14, size: 6.5 },
        { t: 0.5, side: 1, ang: 56, stalk: 18, size: 6 },
        { t: 0.66, side: -1, ang: 44, stalk: 13, size: 6 },
        { t: 0.8, side: 1, ang: 62, stalk: 16, size: 5.5 },
        { t: 1, side: 1, ang: 4, stalk: 8, size: 6 },
      ],
    },
    {
      id: 'tl-low',
      stem: [[-12, 214], [42, 222], [104, 282], [152, 396]],
      stemWidth: 1.6,
      sway: [2.2, 7.2],
      leaves: [
        { t: 0.12, side: -1, ang: 28, len: 72, w: 17, shade: 'light', opacity: 0.8 },
        { t: 0.34, side: -1, ang: 46, len: 62, w: 15, shade: 'mid' },
        { t: 0.5, side: 1, ang: 52, len: 54, w: 13, shade: 'light' },
        { t: 0.66, side: -1, ang: 40, len: 46, w: 12, shade: 'mid' },
      ],
      buds: [
        { t: 0.8, side: 1, ang: 50, stalk: 13, size: 5.5 },
        { t: 0.88, side: -1, ang: 46, stalk: 12, size: 5.5 },
        { t: 1, side: 1, ang: 6, stalk: 7, size: 6 },
      ],
    },
    {
      id: 'tl-drop',
      stem: [[-14, 246], [-6, 252], [2, 258], [8, 264]],
      stemWidth: 1.6,
      sway: [1.8, 9.5],
      leaves: [
        { t: 1, side: 1, ang: 52, len: 178, w: 34, shade: 'dark', curl: -0.15, opacity: 0.92 },
        { t: 0.2, side: 1, ang: 12, len: 92, w: 24, shade: 'light', opacity: 0.55 },
        { t: 0.6, side: -1, ang: 20, len: 120, w: 26, shade: 'light', opacity: 0.7, curl: 0.1 },
      ],
    },
  ],
};

// ---------- Bottom-right sprig (mockup region x 1350–1672, y 600–941) ----------
export const bottomRight: BranchLayer = {
  viewBox: [322, 341],
  ghosts: [],
  branches: [
    {
      id: 'br-main',
      stem: [[34, 348], [92, 282], [158, 194], [192, 98]],
      stemWidth: 2.6,
      sway: [1.8, 7.8],
      leaves: [
        { t: 1, side: -1, ang: 6, len: 84, w: 20, shade: 'mid', curl: 0.1 },
        { t: 0.84, side: 1, ang: 22, len: 96, w: 24, shade: 'mid', curl: -0.1 },
        { t: 0.73, side: -1, ang: 38, len: 98, w: 22, shade: 'dark', curl: 0.15 },
        { t: 0.56, side: 1, ang: 62, len: 126, w: 30, shade: 'dark', curl: -0.12 },
        { t: 0.3, side: 1, ang: 24, len: 150, w: 30, shade: 'mid', curl: -0.1 },
        { t: 0.24, side: 1, ang: 74, len: 72, w: 20, shade: 'light', opacity: 0.8 },
        { t: 0.62, side: -1, ang: 52, len: 86, w: 21, shade: 'mid', curl: 0.1 },
        { t: 0.42, side: -1, ang: 34, len: 74, w: 18, shade: 'light', opacity: 0.85 },
        { t: 0.92, side: 1, ang: 46, len: 64, w: 16, shade: 'light' },
      ],
    },
    {
      id: 'br-twig',
      parent: { id: 'br-main', t: 0.44 },
      stem: [[0, 0], [40, -6], [100, -10], [158, -18]],
      stemWidth: 1.2,
      sway: [3, 5.2],
      leaves: [{ t: 0.2, side: -1, ang: 30, len: 40, w: 11, shade: 'light' }],
      buds: [
        { t: 0.45, side: -1, ang: 52, stalk: 12, size: 5.5 },
        { t: 0.58, side: 1, ang: 60, stalk: 16, size: 5.5 },
        { t: 0.78, side: 1, ang: 48, stalk: 12, size: 5 },
        { t: 1, side: -1, ang: 6, stalk: 7, size: 5.5 },
      ],
    },
  ],
};

// ---------- Hills (mockup y 420–941 → layer 0–521, full width) ----------
export const hillsViewBox: [number, number] = [1672, 521];
/** `texture` = opacity of the watercolor pigment texture on top of the fill. */
export const hills: (WindShape & { fill: string; edgeTint: string; opacity: number; texture: number })[] = [
  { id: 'h-pale', texture: 0.12, fill: 'url(#g-h-pale)', edgeTint: palette.sagePale, opacity: 0.85, seed: 11, period: 14, amp: [10, 6],
    edge: [[960, 330], [1150, 286], [1350, 278], [1540, 292], [1720, 302]], close: 'L1720,560 L960,560 Z' },
  { id: 'h-right', texture: 0.26, fill: 'url(#g-h-right)', edgeTint: palette.sageLight, opacity: 0.9, seed: 12, period: 12, amp: [12, 7],
    edge: [[720, 380], [930, 336], [1170, 328], [1420, 340], [1720, 372]], close: 'L1720,560 L720,560 Z' },
  { id: 'h-mid', texture: 0.42, fill: 'url(#g-h-mid)', edgeTint: palette.sage, opacity: 0.95, seed: 13, period: 11, amp: [10, 8],
    edge: [[300, 312], [560, 276], [820, 296], [1060, 352], [1280, 420], [1480, 490], [1600, 560]], close: 'L300,560 Z' },
  { id: 'h-left', texture: 0.5, fill: 'url(#g-h-left)', edgeTint: palette.sage, opacity: 0.95, seed: 14, period: 15, amp: [6, 7],
    edge: [[-60, 4], [20, 12], [78, 52], [112, 128], [128, 226], [146, 330], [210, 440], [300, 560]], close: 'L-60,560 Z' },
  { id: 'h-deep', texture: 0.6, fill: 'url(#g-h-deep)', edgeTint: palette.sageDeep, opacity: 1, seed: 15, period: 10, amp: [12, 9],
    edge: [[-60, 236], [160, 232], [380, 262], [580, 326], [790, 398], [990, 470], [1190, 560]], close: 'L-60,560 Z' },
];
/** Bottom gold line, through the points traced from the mockup. */
export const goldBottom: WindShape = {
  id: 'gold-bottom', seed: 21, period: 9, amp: [6, 7], close: '',
  edge: [[-40, 308], [120, 284], [300, 262], [460, 270], [600, 298], [760, 370], [900, 446], [1060, 476], [1200, 468], [1350, 434], [1460, 398], [1580, 356], [1720, 300]],
};

// ---------- Top-right blob + gold line (mockup x 1150–1672, y 0–460) ----------
export const topRightViewBox: [number, number] = [522, 460];
export const blob: WindShape = {
  id: 'blob', seed: 31, period: 13, amp: [9, 8], close: 'L560,-40 Z',
  edge: [[258, -40], [262, 40], [282, 140], [304, 230], [344, 318], [410, 386], [480, 420], [560, 436]],
};
export const goldTop: WindShape = {
  id: 'gold-top', seed: 32, period: 10, amp: [5, 6], close: '',
  edge: [[84, -20], [150, 30], [250, 118], [330, 192], [400, 260], [470, 308], [560, 352]],
};
