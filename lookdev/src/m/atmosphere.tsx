// Variant B's atmosphere: radial colour field, rubbed light shafts, airbrushed swirl-cloud banks,
// vignette, grain, and the night ornament (lotus, reeds, motes). Copied so a/b/c stay frozen.
import React, { useId } from "react";
import { edgeSwirls, Pt, smooth, SpiralSpec, swirlPath } from "./geom";
import { MoodColours } from "./palette";

export const W = 1920;
export const H = 1080;

export const useSvgId = (p: string) => p + useId().replace(/[^a-zA-Z0-9]/g, "");

export const Ground: React.FC<{ mood: MoodColours; c: Pt; rx: number; ry: number }> = ({ mood, c, rx, ry }) => {
  const id = useSvgId("ground");
  const n = mood.ground.length;
  return (
    <>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={1} gradientTransform={`translate(${c[0]} ${c[1]}) scale(${rx} ${ry})`}>
          {mood.ground.map((col, i) => (
            <stop key={i} offset={(i / n) * 0.82 + (i ? 0.04 : 0)} stopColor={col} />
          ))}
          <stop offset={1} stopColor={mood.corner} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

export type Shaft = { angle: number; spread: number; len: number; opacity: number };

export const Shafts: React.FC<{ mood: MoodColours; c: Pt; shafts: readonly Shaft[] }> = ({ mood, c, shafts }) => {
  const id = useSvgId("shaft");
  return (
    <>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={c[0]} cy={c[1]} r={1100}>
          <stop offset={0} stopColor={mood.shaft} stopOpacity={1} />
          <stop offset={0.55} stopColor={mood.shaft} stopOpacity={0.5} />
          <stop offset={1} stopColor={mood.shaft} stopOpacity={0} />
        </radialGradient>
      </defs>
      {shafts.map((s, i) => {
        const a0 = ((s.angle - s.spread / 2) * Math.PI) / 180;
        const a1 = ((s.angle + s.spread / 2) * Math.PI) / 180;
        const d = `M${c[0]} ${c[1]}L${c[0] + Math.cos(a0) * s.len} ${c[1] + Math.sin(a0) * s.len}L${c[0] + Math.cos(a1) * s.len} ${c[1] + Math.sin(a1) * s.len}Z`;
        return <path key={i} d={d} fill={`url(#${id})`} opacity={s.opacity} />;
      })}
    </>
  );
};

export type Lobe = { x: number; y: number; r: number };
export type CloudBankSpec = { lobes: readonly Lobe[]; shadow: Pt; spirals: readonly SpiralSpec[]; far?: boolean };

const SoftLobes: React.FC<{ lobes: readonly Lobe[]; fill: string; feather: number; dx?: number; dy?: number }> = ({ lobes, fill, feather, dx = 0, dy = 0 }) => (
  <>
    {lobes.map((l, i) => (
      <circle key={i} cx={l.x + dx} cy={l.y + dy} r={l.r * (1 + feather)} fill={fill} />
    ))}
  </>
);

const SoftStops: React.FC<{ id: string; feather: number; peak?: number }> = ({ id, feather, peak = 1 }) => {
  const k = 1 / (1 + feather);
  return (
    <radialGradient id={id}>
      <stop offset={0} stopColor="#fff" stopOpacity={peak} />
      <stop offset={k * 0.97} stopColor="#fff" stopOpacity={peak} />
      <stop offset={Math.min(0.99, k + (1 - k) * 0.25)} stopColor="#fff" stopOpacity={peak * 0.45} />
      <stop offset={1} stopColor="#fff" stopOpacity={0} />
    </radialGradient>
  );
};

const EDGE = 0.08;
const SHADOW = 0.32;

export const CloudBank: React.FC<{ mood: MoodColours; spec: CloudBankSpec; glow: Pt; dx?: number }> = ({ mood, spec, glow, dx = 0 }) => {
  const id = useSvgId("cloud");
  const [sx, sy] = spec.shadow;
  return (
    <g transform={`translate(${dx} 0)`}>
      <defs>
        <radialGradient id={`${id}c`} gradientUnits="userSpaceOnUse" cx={glow[0] - dx} cy={glow[1]} r={1150}>
          <stop offset={0.3} stopColor={spec.far ? mood.farLit : mood.cloudLit} />
          <stop offset={0.5} stopColor={spec.far ? mood.farDeep : mood.cloudDeep} />
          <stop offset={1} stopColor={spec.far ? mood.farDeep : mood.cloudDeep} />
        </radialGradient>
        <SoftStops id={`${id}e`} feather={EDGE} />
        <SoftStops id={`${id}s`} feather={SHADOW} peak={0.8} />
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H}>
          <SoftLobes lobes={spec.lobes} fill={`url(#${id}e)`} feather={EDGE} />
        </mask>
        <mask id={`${id}n`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H}>
          <SoftLobes lobes={spec.lobes} fill={`url(#${id}s)`} feather={SHADOW} dx={sx} dy={sy} />
        </mask>
      </defs>
      <rect x={-W} y={-H} width={3 * W} height={3 * H} fill={mood.cloudShadow} opacity={0.38} mask={`url(#${id}n)`} />
      <rect x={-W} y={-H} width={3 * W} height={3 * H} fill={`url(#${id}c)`} mask={`url(#${id}m)`} />
      <g fill={spec.far ? mood.swirlOnGround : mood.swirlOnCloud} opacity={spec.far ? 0.75 : 1}>
        {spec.spirals.map((s, i) => (
          <path key={i} d={swirlPath(s)} />
        ))}
      </g>
    </g>
  );
};

export const GroundSwirls: React.FC<{ color: string; spirals: readonly SpiralSpec[]; opacity?: number; dx?: number }> = ({ color, spirals, opacity = 0.7, dx = 0 }) => (
  <g fill={color} opacity={opacity} transform={`translate(${dx} 0)`}>
    {spirals.map((s, i) => (
      <path key={i} d={swirlPath(s)} />
    ))}
  </g>
);

export const Vignette: React.FC<{ mood: MoodColours; c?: Pt; strength?: number }> = ({ mood, c = [W / 2, H * 0.42], strength = 0.6 }) => {
  const id = useSvgId("vig");
  return (
    <>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={1} gradientTransform={`translate(${c[0]} ${c[1]}) scale(${W * 0.62} ${H * 0.78})`}>
          <stop offset={0.45} stopColor={mood.vignette} stopOpacity={0} />
          <stop offset={0.8} stopColor={mood.vignette} stopOpacity={strength * 0.55} />
          <stop offset={1} stopColor={mood.vignette} stopOpacity={strength} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

/**
 * Whole-frame grain. The seed is fixed: B measured that reseeding every frame
 * bloats the H.264 file about 20x, which YouTube then smears into blocks.
 */
export const Grain: React.FC<{ seed?: number; opacity: number; mottle?: number }> = ({ seed = 3, opacity, mottle = 0.2 }) => {
  const fine = useSvgId("grain");
  const soft = useSvgId("mottle");
  return (
    <>
      <defs>
        <filter id={fine} x={0} y={0} width={W} height={H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.95} numOctaves={2} seed={seed} />
          <feColorMatrix type="matrix" values="2.4 0 0 0 -0.7  2.4 0 0 0 -0.7  2.4 0 0 0 -0.7  0 0 0 0 1" />
        </filter>
        <filter id={soft} x={0} y={0} width={W} height={H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.0045} numOctaves={4} seed={7} />
          <feColorMatrix type="matrix" values="1.6 0 0 0 -0.3  1.6 0 0 0 -0.3  1.6 0 0 0 -0.3  0 0 0 0 1" />
        </filter>
      </defs>
      <rect width={W} height={H} filter={`url(#${soft})`} opacity={mottle} style={{ mixBlendMode: "soft-light" }} />
      <rect width={W} height={H} filter={`url(#${fine})`} opacity={opacity} style={{ mixBlendMode: "overlay" }} />
    </>
  );
};

export type SkyLayout = {
  glow: Pt;
  rx: number;
  ry: number;
  shafts: readonly Shaft[];
  far: readonly CloudBankSpec[];
  near: readonly CloudBankSpec[];
  open: readonly SpiralSpec[];
};

export const Sky: React.FC<{ mood: MoodColours; layout: SkyLayout; drift?: number }> = ({ mood, layout, drift = 0 }) => (
  <>
    <Ground mood={mood} c={layout.glow} rx={layout.rx} ry={layout.ry} />
    <Shafts mood={mood} c={layout.glow} shafts={layout.shafts} />
    <GroundSwirls color={mood.swirlOnGround} spirals={layout.open} opacity={0.45} dx={drift * 0.3} />
    {layout.far.map((b, i) => (
      <CloudBank key={i} mood={mood} spec={b} glow={layout.glow} dx={drift * 0.5 * (i % 2 ? -1 : 1)} />
    ))}
    {layout.near.map((b, i) => (
      <CloudBank key={i} mood={mood} spec={b} glow={layout.glow} dx={drift * (i % 2 ? -1 : 1)} />
    ))}
  </>
);

/** Owner-pick framing: dark banks in both top corners, glow between them behind the head. */
export const CLOSE_SKY: SkyLayout = {
  glow: [900, 560],
  rx: 1300,
  ry: 1000,
  shafts: [
    { angle: 140, spread: 13, len: 1300, opacity: 0.2 },
    { angle: 163, spread: 12, len: 1300, opacity: 0.3 },
    { angle: 30, spread: 9, len: 1300, opacity: 0.14 },
  ],
  far: [
    {
      far: true,
      lobes: [{ x: 520, y: 150, r: 170 }, { x: 700, y: 30, r: 150 }, { x: 380, y: 300, r: 120 }],
      shadow: [0, 30],
      spirals: [
        { x: 600, y: 120, rot: 150, size: 46, w: 8, tail: 3.6, flip: true },
        { x: 470, y: 330, rot: -40, size: 34, w: 7, tail: 3.2 },
      ],
    },
    {
      far: true,
      lobes: [{ x: 1780, y: 400, r: 150 }, { x: 1610, y: 380, r: 100 }, { x: 1960, y: 470, r: 160 }, { x: 1290, y: 110, r: 110 }],
      shadow: [0, 34],
      spirals: [
        { x: 1720, y: 400, rot: 200, size: 44, w: 8, tail: 3.4, flip: true },
        { x: 1840, y: 520, rot: -30, size: 32, w: 7, tail: 3 },
        { x: 1270, y: 130, rot: 200, size: 40, w: 7, tail: 3.5, flip: true },
      ],
    },
  ],
  near: [
    {
      lobes: [{ x: 40, y: 170, r: 280 }, { x: 300, y: 0, r: 200 }, { x: -110, y: 460, r: 160 }],
      shadow: [18, 40],
      spirals: [
        { x: 70, y: 245, rot: 70, size: 66, w: 9, turns: 1.6, tail: 3.2 },
        { x: 290, y: 110, rot: 210, size: 52, w: 9, turns: 1.4, tail: 3.6, flip: true },
        ...edgeSwirls([[30, 590], [170, 470], [300, 330], [420, 190]], { size: 40, w: 8, flip: true, stretch: 0.8, hook: 0.4 }),
      ],
    },
    {
      lobes: [{ x: 1500, y: 80, r: 230 }, { x: 1760, y: 200, r: 240 }, { x: 1960, y: 380, r: 200 }, { x: 1290, y: -60, r: 190 }, { x: 1940, y: 20, r: 220 }],
      shadow: [-14, 40],
      spirals: [
        { x: 1560, y: 150, rot: -10, size: 66, w: 9, turns: 1.6, tail: 3.4 },
        { x: 1830, y: 110, rot: 160, size: 48, w: 9, tail: 3.2, flip: true },
        ...edgeSwirls([[1320, 200], [1470, 290], [1630, 360], [1790, 410], [1920, 520]], { size: 40, w: 8, flip: true, hook: 0.4 }),
      ],
    },
  ],
  open: [
    { x: 330, y: 560, rot: 150, size: 40, w: 7, tail: 4, flip: true },
    { x: 1500, y: 700, rot: 20, size: 36, w: 7, tail: 4 },
  ],
};

/** Ganga at night: glow behind the head, violet banks high in the corners. */
export const NIGHT_CLOSE_SKY: SkyLayout = {
  glow: [960, 400],
  rx: 1150,
  ry: 900,
  shafts: [
    { angle: 128, spread: 10, len: 1300, opacity: 0.12 },
    { angle: 52, spread: 10, len: 1300, opacity: 0.12 },
  ],
  far: [
    {
      far: true,
      lobes: [{ x: 480, y: 90, r: 160 }, { x: 300, y: 260, r: 150 }, { x: 640, y: -30, r: 150 }],
      shadow: [0, 30],
      spirals: [
        { x: 470, y: 120, rot: 160, size: 44, w: 8, tail: 3.6, flip: true },
        { x: 310, y: 290, rot: -30, size: 34, w: 7, tail: 3.2, hook: 0.4 },
      ],
    },
    {
      far: true,
      lobes: [{ x: 1440, y: 90, r: 160 }, { x: 1620, y: 260, r: 150 }, { x: 1280, y: -30, r: 150 }],
      shadow: [0, 30],
      spirals: [
        { x: 1450, y: 120, rot: 20, size: 44, w: 8, tail: 3.6 },
        { x: 1610, y: 290, rot: 210, size: 34, w: 7, tail: 3.2, flip: true, hook: 0.4 },
      ],
    },
  ],
  near: [
    {
      lobes: [{ x: 60, y: 140, r: 260 }, { x: 260, y: -20, r: 190 }, { x: -60, y: 430, r: 200 }],
      shadow: [16, 40],
      spirals: [
        { x: 80, y: 200, rot: 60, size: 60, w: 9, turns: 1.6, tail: 3.2 },
        ...edgeSwirls([[20, 600], [140, 470], [260, 320], [380, 180]], { size: 38, w: 8, flip: true, hook: 0.4 }),
      ],
    },
    {
      lobes: [{ x: 1860, y: 140, r: 260 }, { x: 1660, y: -20, r: 190 }, { x: 1980, y: 430, r: 200 }],
      shadow: [-16, 40],
      spirals: [
        { x: 1840, y: 200, rot: 120, size: 60, w: 9, turns: 1.6, tail: 3.2, flip: true },
        ...edgeSwirls([[1900, 600], [1780, 470], [1660, 320], [1540, 180]], { size: 38, w: 8, hook: 0.4 }),
      ],
    },
  ],
  open: [
    { x: 520, y: 560, rot: 150, size: 36, w: 6, tail: 4, flip: true },
    { x: 1400, y: 600, rot: 30, size: 36, w: 6, tail: 4 },
  ],
};

/** Riverbank wide: banks in the top corners, a lighter band of cloud above the far shore. */
export const WIDE_SKY: SkyLayout = {
  glow: [990, 470],
  rx: 1250,
  ry: 820,
  shafts: [
    { angle: 140, spread: 10, len: 1300, opacity: 0.16 },
    { angle: 40, spread: 9, len: 1300, opacity: 0.14 },
    { angle: 160, spread: 5, len: 1300, opacity: 0.12 },
  ],
  far: [
    {
      far: true,
      lobes: [{ x: 700, y: 560, r: 90 }, { x: 560, y: 590, r: 80 }, { x: 1500, y: 560, r: 100 }, { x: 1660, y: 590, r: 90 }, { x: 1300, y: 610, r: 70 }, { x: 860, y: 610, r: 60 }],
      shadow: [0, 18],
      spirals: [
        { x: 690, y: 545, rot: 170, size: 26, w: 6, tail: 3.6, flip: true },
        { x: 1500, y: 545, rot: 10, size: 28, w: 6, tail: 3.6 },
        { x: 1660, y: 585, rot: 200, size: 22, w: 6, tail: 3, flip: true, hook: 0.4 },
      ],
    },
    {
      far: true,
      lobes: [{ x: 520, y: 40, r: 140 }, { x: 1420, y: 30, r: 140 }],
      shadow: [0, 26],
      spirals: [
        { x: 520, y: 80, rot: 160, size: 36, w: 7, tail: 3.6, flip: true },
        { x: 1420, y: 70, rot: 20, size: 36, w: 7, tail: 3.6 },
      ],
    },
  ],
  near: [
    {
      lobes: [{ x: 60, y: 120, r: 240 }, { x: 290, y: -20, r: 180 }, { x: -80, y: 380, r: 160 }],
      shadow: [16, 36],
      spirals: [
        { x: 80, y: 170, rot: 70, size: 56, w: 8, turns: 1.6, tail: 3.2 },
        ...edgeSwirls([[20, 520], [140, 400], [260, 270], [380, 140]], { size: 34, w: 7, flip: true, hook: 0.4 }),
      ],
    },
    {
      lobes: [{ x: 1700, y: 90, r: 240 }, { x: 1940, y: 260, r: 220 }, { x: 1480, y: -40, r: 170 }],
      shadow: [-14, 36],
      spirals: [
        { x: 1680, y: 120, rot: -10, size: 56, w: 8, turns: 1.6, tail: 3.4 },
        ...edgeSwirls([[1440, 140], [1580, 250], [1730, 320], [1880, 400]], { size: 34, w: 7, flip: true, hook: 0.4 }),
      ],
    },
  ],
  open: [
    { x: 420, y: 420, rot: 150, size: 30, w: 6, tail: 4, flip: true },
    { x: 1580, y: 430, rot: 30, size: 30, w: 6, tail: 4 },
  ],
};

/** f2's white roses translated: pale glowing lotus blossoms with a soft bloom. */
export const Lotus: React.FC<{ x: number; y: number; size: number; rot?: number; glow?: number }> = ({ x, y, size, rot = 0, glow = 1 }) => {
  const id = useSvgId("lotus");
  const petal = (a: number, len: number, wid: number) => (
    <path key={a} transform={`rotate(${a})`} d={`M0,0 Q${-wid},${-len * 0.45} 0,${-len} Q${wid},${-len * 0.45} 0,0Z`} />
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size / 100})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset={0} stopColor="#f4efff" stopOpacity={0.55} />
          <stop offset={0.4} stopColor="#c9bcff" stopOpacity={0.22} />
          <stop offset={1} stopColor="#c9bcff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={0} cy={-40} r={190} fill={`url(#${id})`} opacity={glow} />
      <g fill="#e4def6" stroke="#9d92c8" strokeWidth={2.5}>
        {petal(-62, 92, 30)}
        {petal(62, 92, 30)}
      </g>
      <g fill="#f6f3fc" stroke="#a89ed2" strokeWidth={2.5}>
        {petal(-30, 110, 34)}
        {petal(30, 110, 34)}
        {petal(0, 124, 38)}
      </g>
      <path d="M-60,4 Q0,26 60,4" stroke="#a89ed2" strokeWidth={2.5} fill="none" />
    </g>
  );
};

export type Reed = { pts: readonly Pt[]; w: number; leaves?: readonly { at: number; len: number; side: 1 | -1 }[] };

export const Reeds: React.FC<{ reeds: readonly Reed[]; color: string }> = ({ reeds, color }) => (
  <g fill={color} stroke={color} strokeLinecap="round">
    {reeds.map((r, i) => {
      const n = r.pts.length;
      return (
        <g key={i}>
          <path d={smooth(r.pts)} fill="none" strokeWidth={r.w} />
          {(r.leaves ?? []).map((l, j) => {
            const k = Math.min(n - 2, Math.floor(l.at * (n - 1)));
            const [x0, y0] = r.pts[k];
            const [x1, y1] = r.pts[k + 1];
            const a = Math.atan2(y1 - y0, x1 - x0) + l.side * 0.7;
            const tip: Pt = [x0 + Math.cos(a) * l.len, y0 + Math.sin(a) * l.len];
            const nx = -Math.sin(a) * l.len * 0.14, ny = Math.cos(a) * l.len * 0.14;
            const mx = (x0 + tip[0]) / 2, my = (y0 + tip[1]) / 2;
            return <path key={j} stroke="none" d={`M${x0},${y0} Q${mx + nx},${my + ny} ${tip[0]},${tip[1]} Q${mx - nx},${my - ny} ${x0},${y0}Z`} />;
          })}
        </g>
      );
    })}
  </g>
);

export const Motes: React.FC<{ seed: number; n: number; color: string; drift?: number }> = ({ seed, n, color, drift = 0 }) => {
  let t = seed;
  const r = () => ((t = (t * 9301 + 49297) % 233280) / 233280);
  return (
    <g fill={color}>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * 1920, y = r() * 1080, s = 3 + r() * 14, o = 0.08 + r() * 0.22;
        return <circle key={i} cx={(x + drift * (0.3 + s / 20)) % 1980} cy={y - drift * 0.2} r={s} opacity={o} />;
      })}
    </g>
  );
};

/** The single saturated accent: a red arrow with diamond head and flared fletching (variant B). */
export const RedArrow: React.FC<{ from: Pt; to: Pt; width: number; head?: number; fletchAt?: number; part?: "all" | "shaft" | "fletch"; color: string }> = ({
  from,
  to,
  width,
  head = 1,
  fletchAt = 1,
  part = "all",
  color,
}) => {
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const hs = 34 * head;
  return (
    <g transform={`translate(${from[0]} ${from[1]}) rotate(${ang})`} fill={color}>
      {part !== "fletch" && (
        <>
          <rect x={0} y={-width / 2} width={len} height={width} />
          <path d={`M${-hs * 1.8},0 L0,${-hs * 0.55} L${hs * 0.9},0 L0,${hs * 0.55}Z`} />
          <path d={`M${hs * 4.2},0 L${hs * 4.9},${-hs * 0.32} L${hs * 5.8},0 L${hs * 4.9},${hs * 0.32}Z`} />
        </>
      )}
      {part !== "shaft" && fletchAt > 0 && (
        <g transform={`translate(${len * fletchAt + 90} 0)`}>
          {[-1, 1].map((s) =>
            [0, 1, 2].map((k) => (
              <path key={`${s}${k}`} d={`M${-40 - k * 26},0 Q${-80 - k * 30},${s * (30 + k * 10)} ${-130 - k * 30},${s * (46 + k * 14)} Q${-90 - k * 26},${s * 12} ${-40 - k * 26 + 14},0Z`} />
            )),
          )}
        </g>
      )}
    </g>
  );
};
