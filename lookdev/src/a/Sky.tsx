import React from "react";
import { LINE_W, SKY, type Mood } from "./palette";
import { rng, spiralPath } from "./geom";

export const W = 1920;
export const H = 1080;

type Disc = { x: number; y: number; r: number; curl: boolean; dir: 1 | -1; a0: number; turns: number };

type Cloud = { discs: Disc[] };

/** A cloud is a chain of discs along an arc. Deterministic per seed. */
const makeCloud = (
  seed: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bulge: number,
  rMin: number,
  rMax: number,
  n: number,
): Cloud => {
  const r = rng(seed);
  const discs: Disc[] = [];
  let curls = 0;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const px = x0 + (x1 - x0) * t;
    const py = y0 + (y1 - y0) * t;
    const nx = -(y1 - y0);
    const ny = x1 - x0;
    const len = Math.hypot(nx, ny) || 1;
    const b = Math.sin(t * Math.PI) * bulge;
    const rad = rMin + (rMax - rMin) * (0.4 + 0.6 * Math.sin(t * Math.PI)) * (0.85 + 0.3 * r());
    const curl = curls < 2 && rad > rMin + (rMax - rMin) * 0.3 && r() > 0.4;
    if (curl) curls++;
    discs.push({
      x: px + (nx / len) * b + (r() - 0.5) * rad * 0.3,
      y: py + (ny / len) * b + (r() - 0.5) * rad * 0.3,
      r: rad,
      curl,
      dir: r() > 0.5 ? 1 : -1,
      a0: r() * Math.PI * 2,
      turns: 1.5 + r() * 0.7,
    });
  }
  return { discs };
};

const WARM_CLOUDS: Cloud[] = [
  makeCloud(11, -200, 60, 640, -120, 120, 170, 300, 5),
  makeCloud(12, -160, 520, 420, 140, 150, 150, 260, 4),
  makeCloud(13, 1320, -140, 2120, 80, 110, 170, 320, 5),
  makeCloud(14, 1560, 240, 2100, 560, 140, 150, 250, 4),
  makeCloud(16, 600, -200, 1300, -230, 20, 110, 170, 4),
];

type SkyProps = {
  mood: Mood;
  /** horizontal drift of the cloud layer in px */
  drift?: number;
  /** centre of the glow */
  glowX?: number;
  glowY?: number;
  clouds?: Cloud[];
  id?: string;
};

const Rays: React.FC<{ cx: number; cy: number; color: string; id: string }> = ({ cx, cy, color, id }) => {
  const rays: React.ReactNode[] = [];
  const angles = [-126, -108, -96, -84, -72, -56, -40];
  angles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const half = (6 + (i % 3) * 2.5) * (Math.PI / 180);
    const L = 1600;
    const p1 = [cx + Math.cos(a - half) * L, cy + Math.sin(a - half) * L];
    const p2 = [cx + Math.cos(a + half) * L, cy + Math.sin(a + half) * L];
    rays.push(
      <path
        key={deg}
        d={`M${cx},${cy} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Z`}
        fill={`url(#${id})`}
        opacity={0.3 + 0.18 * ((i * 7) % 3)}
      />,
    );
  });
  return (
    <g>
      <defs>
        <radialGradient id={id} cx={cx} cy={cy} r={1100} gradientUnits="userSpaceOnUse">
          <stop offset="0.05" stopColor={color} stopOpacity={0} />
          <stop offset="0.3" stopColor={color} stopOpacity={0.22} />
          <stop offset="0.75" stopColor={color} stopOpacity={0.04} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {rays}
    </g>
  );
};

export const Sky: React.FC<SkyProps> = ({
  mood,
  drift = 0,
  glowX = W / 2,
  glowY = 300,
  clouds = WARM_CLOUDS,
  id = "sky",
}) => {
  const p = SKY[mood];
  const gid = `${id}-glow`;
  const vid = `${id}-vig`;
  const bid = `${id}-blur`;

  return (
    <g>
      <defs>
        <radialGradient id={gid} cx={glowX} cy={glowY} r={1150} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.glowCore} />
          <stop offset="0.28" stopColor={p.glowMid} />
          <stop offset="0.62" stopColor={p.ground} />
          <stop offset="1" stopColor={p.groundDark} />
        </radialGradient>
        <radialGradient id={vid} cx={W / 2} cy={H / 2} r={1250} gradientUnits="userSpaceOnUse">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.5} />
        </radialGradient>
        <filter id={bid} filterUnits="userSpaceOnUse" x={-600} y={-600} width={W + 1200} height={H + 1200}>
          <feGaussianBlur stdDeviation={7} />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${gid})`} />
      <Rays cx={glowX} cy={glowY + 420} color={p.ray} id={`${id}-ray`} />
      <g transform={`translate(${drift},0)`}>
        {/* soft body: all discs blurred once as a layer */}
        <g filter={`url(#${bid})`}>
          {clouds.map((c, ci) =>
            c.discs.map((d, di) => (
              <circle key={`${ci}-${di}`} cx={d.x} cy={d.y} r={d.r} fill={p.cloud} />
            )),
          )}
        </g>
        {/* deeper belly for depth, offset toward the frame edge */}
        <g filter={`url(#${bid})`} opacity={0.8}>
          {clouds.map((c, ci) =>
            c.discs.map((d, di) => (
              <circle
                key={`${ci}-${di}`}
                cx={d.x + (d.x < W / 2 ? -d.r * 0.35 : d.r * 0.35)}
                cy={d.y - d.r * 0.3}
                r={d.r * 0.8}
                fill={p.cloudDeep}
              />
            )),
          )}
        </g>
        {/* scalloped outline: strokes first, then fills slightly inset cover the inner arcs */}
        <g>
          {clouds.map((c, ci) =>
            c.discs.map((d, di) => (
              <circle
                key={`s${ci}-${di}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="none"
                stroke={p.cloudEdge}
                strokeWidth={LINE_W}
                opacity={0.9}
              />
            )),
          )}
          {clouds.map((c, ci) =>
            c.discs.map((d, di) => (
              <circle key={`f${ci}-${di}`} cx={d.x} cy={d.y} r={d.r - LINE_W * 0.55} fill={p.cloud} />
            )),
          )}
        </g>
        <g filter={`url(#${bid})`} opacity={0.7}>
          {clouds.map((c, ci) =>
            c.discs.map((d, di) => (
              <circle
                key={`${ci}-${di}`}
                cx={d.x + (d.x < W / 2 ? -d.r * 0.4 : d.r * 0.4)}
                cy={d.y - d.r * 0.35}
                r={d.r * 0.7}
                fill={p.cloudDeep}
              />
            )),
          )}
        </g>
        {/* curls */}
        <g fill="none" stroke={p.curl} strokeWidth={LINE_W} strokeLinecap="round" opacity={0.75}>
          {clouds.map((c, ci) =>
            c.discs
              .filter((d) => d.curl)
              .map((d, di) => (
                <path
                  key={`c${ci}-${di}`}
                  d={spiralPath(d.x + Math.cos(d.a0) * d.r * 0.45, d.y + Math.sin(d.a0) * d.r * 0.45, d.r * 0.42, d.turns, d.a0 + Math.PI, d.dir)}
                />
              )),
          )}
        </g>
      </g>
      <rect width={W} height={H} fill={`url(#${vid})`} />
    </g>
  );
};

/** Free-floating curls in the glow (no cloud body). */
export const LooseCurls: React.FC<{ mood: Mood; items: [number, number, number][]; drift?: number }> = ({
  mood,
  items,
  drift = 0,
}) => (
  <g
    fill="none"
    stroke={SKY[mood].curl}
    strokeWidth={LINE_W}
    strokeLinecap="round"
    opacity={0.55}
    transform={`translate(${drift * 0.5},0)`}
  >
    {items.map(([x, y, r], i) => (
      <path key={i} d={spiralPath(x, y, r, 1.7 + (i % 3) * 0.3, (i * 1.3) % 6.28, i % 2 === 0 ? 1 : -1)} />
    ))}
  </g>
);

/** Whole-frame texture: one fine grain pass and one low-frequency mottle pass. */
export const Grain: React.FC<{ id?: string; grain?: number; mottle?: number }> = ({
  id = "tex",
  grain = 0.28,
  mottle = 0.45,
}) => (
  <g>
    <defs>
      <filter id={`${id}-g`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={3} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.9 0.9 0.9 0 0" />
      </filter>
      <filter id={`${id}-m`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={3} seed={7} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0.6 0.6 0.6 0 0" />
      </filter>
    </defs>
    <rect width={W} height={H} filter={`url(#${id}-m)`} style={{ mixBlendMode: "soft-light" }} opacity={mottle} />
    <rect width={W} height={H} filter={`url(#${id}-g)`} style={{ mixBlendMode: "overlay" }} opacity={grain} />
  </g>
);

export { WARM_CLOUDS, makeCloud };
export type { Cloud };
