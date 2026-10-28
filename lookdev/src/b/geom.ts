export type Pt = readonly [number, number];

export const mulberry = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const f = (n: number) => Math.round(n * 10) / 10;

export const polyline = (pts: readonly Pt[], close = false) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('') + (close ? 'Z' : '');

/** Smooth open path through points (Catmull-Rom converted to cubic Beziers). */
export const smooth = (pts: readonly Pt[], close = false) => {
  const n = pts.length;
  const at = (i: number) => (close ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return close ? d + 'Z' : d;
};

/**
 * Closed symmetric shape from its right half, listed top-centre to bottom-centre.
 * The left half is the mirror, traversed back up.
 */
export const mirrorSmooth = (right: readonly Pt[]) => {
  const left = [...right].reverse().map(([x, y]) => [-x, y] as Pt);
  return smooth([...right, ...left.slice(1, -1)], true);
};

export type SpiralSpec = {
  x: number;
  y: number;
  /** rotation of the whole motif, degrees */
  rot: number;
  /** px per unit length */
  size: number;
  /** stroke width in px */
  w: number;
  /** curl tightness: total turning of the curl part, in turns */
  turns?: number;
  /** tail length in units (0 = pure curl) */
  tail?: number;
  /** clockwise instead of counter-clockwise */
  flip?: boolean;
  /** stem bend: 0 straight, 1 sweeps back toward the curl side, negative bends away */
  bend?: number;
  /** size of a reverse curl closing the end of the stem (S motif), 0 for a plain tail */
  hook?: number;
};

/**
 * Centre-line of the swirl motif, starting at the inner end of the curl.
 * The curl is an Archimedean spiral of outer radius 1 (unit = `size` px); the
 * stem leaves it tangentially and straightens as its curvature decays.
 * With rot = 0 the curl centre is at (x, y) and the stem leaves heading east.
 */
export const spiralLine = (s: SpiralSpec): Pt[] => {
  const turns = s.turns ?? 1.3;
  const tail = s.tail ?? 2.5;
  const r0 = 0.22;
  const span = turns * 2 * Math.PI;
  const local: Pt[] = [];
  const curlSteps = Math.ceil(turns * 48);
  // wind inward-out so the curve ends at the bottom of the curl heading east (y-down screen)
  for (let i = 0; i <= curlSteps; i++) {
    const th = (i / curlSteps) * span;
    const r = r0 + (1 - r0) * (th / span);
    const a = Math.PI / 2 + (span - th);
    local.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  let [x, y] = local[local.length - 1];
  let h = 0;
  const bend = s.bend ?? 0.5;
  const tailSteps = Math.ceil(tail * 24);
  const ds = tail / tailSteps;
  for (let i = 1; i <= tailSteps; i++) {
    h -= (0.25 + 0.75 * Math.exp(-(i * ds) / 1.0)) * bend * ds;
    x += Math.cos(h) * ds;
    y += Math.sin(h) * ds;
    local.push([x, y]);
  }
  const hook = s.hook ?? 0;
  if (hook > 0) {
    // Euler spiral: curvature ramps up the opposite way, so the stem rolls into a curl
    const len = hook * 5;
    const steps = Math.ceil(len * 40);
    const dh = len / steps;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      h += ((t * t) / hook) * 3.2 * dh;
      x += Math.cos(h) * dh;
      y += Math.sin(h) * dh;
      local.push([x, y]);
    }
  }
  const sign = s.flip ? -1 : 1;
  const rot = (s.rot * Math.PI) / 180;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  return local.map(([lx, ly0]) => {
    const ly = ly0 * sign;
    return [s.x + (lx * cr - ly * sr) * s.size, s.y + (lx * sr + ly * cr) * s.size] as Pt;
  });
};

/** Variable-width ribbon around a centre-line; width(t) with t in 0..1 along it. */
export const ribbon = (pts: readonly Pt[], width: (t: number) => number) => {
  const L: Pt[] = [], R: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const w = width(i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  return polyline([...L, ...R.reverse()], true);
};

/** Swirl stroke: full at the curl, tapering to a point at the end of the tail. */
export const swirlPath = (s: SpiralSpec) =>
  ribbon(spiralLine(s), (t) =>
    s.w * (t < 0.05 ? 0.7 + 6 * t : s.hook ? (t > 0.95 ? 0.7 + 6 * (1 - t) : 1) : t < 0.6 ? 1 : Math.max(0.08, 1 - (t - 0.6) / 0.42)),
  );

export const deg = (r: number) => (r * 180) / Math.PI;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * Swirls riding a cloud edge: each stem starts at an edge point and runs toward
 * the next one, its curl tucked on the cloud side (left of travel, or right if flip).
 */
export const edgeSwirls = (
  edge: readonly Pt[],
  o: { size: number; w: number; flip?: boolean; turns?: number; every?: number; stretch?: number; hook?: number },
): SpiralSpec[] => {
  const out: SpiralSpec[] = [];
  for (let i = 0; i < edge.length - 1; i += o.every ?? 1) {
    const [x0, y0] = edge[i];
    const [x1, y1] = edge[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const dx = (x1 - x0) / len, dy = (y1 - y0) / len;
    const side = o.flip ? -1 : 1;
    const size = o.size * (0.8 + 0.4 * ((i * 7919) % 5) / 4);
    out.push({
      x: x0 + dy * size * side,
      y: y0 - dx * size * side,
      rot: deg(Math.atan2(dy, dx)) + 18 * side,
      size,
      w: o.w,
      turns: o.turns ?? 1.35,
      tail: (len / size) * (o.stretch ?? 0.85),
      flip: o.flip,
      bend: 0.35,
      hook: i % 2 ? o.hook : 0,
    });
  }
  return out;
};
