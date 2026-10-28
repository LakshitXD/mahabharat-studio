export const rng = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** Archimedean spiral path: starts at the outer end, winds in to the centre. */
export const spiralPath = (
  cx: number,
  cy: number,
  rOuter: number,
  turns: number,
  startAngle: number,
  dir: 1 | -1 = 1,
) => {
  const steps = Math.max(24, Math.round(turns * 28));
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = rOuter * (1 - t) + 2;
    const a = startAngle + dir * t * turns * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

/** Smooth closed-ish polyline through points using quadratic midpoints. */
export const smoothPath = (pts: [number, number][], close = false) => {
  if (pts.length < 2) return "";
  const p = close ? [...pts, pts[0], pts[1]] : pts;
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${p[i][0]},${p[i][1]} ${mx},${my}`;
  }
  if (!close) d += ` L${p[p.length - 1][0]},${p[p.length - 1][1]}`;
  return d + (close ? " Z" : "");
};

export const mirrorX = (d: string) => d; // kept for symmetry helpers via <g transform="scale(-1,1)">
