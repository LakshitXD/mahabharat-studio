import React from 'react';
import {COOL, H, W, WARM, spiralPath} from './style';

export type Lobe = {x: number; y: number; r: number; dir?: 1 | -1};

type CloudTone = {fill: string; line: string; halo: string};

export const WARM_NEAR: CloudTone = {fill: WARM.cloudDeep, line: '#7a3d33', halo: '#1a0706'};
export const WARM_MID: CloudTone = {fill: WARM.cloud, line: '#93503f', halo: '#3a1210'};
export const WARM_FAR: CloudTone = {fill: '#8a4a3d', line: '#b06e57', halo: '#5a2724'};
export const COOL_NEAR: CloudTone = {fill: '#1d1a45', line: '#4a3f86', halo: '#0b0920'};
export const COOL_FAR: CloudTone = {fill: '#2f2766', line: '#5a4b98', halo: '#1a1640'};

export const SwirlCloud: React.FC<{id: string; lobes: Lobe[]; tone: CloudTone; dx?: number; lw?: number}> = ({id, lobes, tone, dx = 0, lw = 3.2}) => (
  <g transform={`translate(${dx} 0)`}>
    <defs>
      <radialGradient id={`${id}-halo`}>
        <stop offset="0" stopColor={tone.halo} stopOpacity={0.75} />
        <stop offset="0.55" stopColor={tone.halo} stopOpacity={0.35} />
        <stop offset="1" stopColor={tone.halo} stopOpacity={0} />
      </radialGradient>
    </defs>
    {lobes.map((l, i) => (
      <ellipse key={`h${i}`} cx={l.x} cy={l.y + l.r * 0.35} rx={l.r * 1.7} ry={l.r * 1.45} fill={`url(#${id}-halo)`} />
    ))}
    {lobes.map((l, i) => (
      <circle key={`o${i}`} cx={l.x} cy={l.y} r={l.r} fill={tone.line} stroke={tone.line} strokeWidth={lw * 2} />
    ))}
    {lobes.map((l, i) => (
      <circle key={`f${i}`} cx={l.x} cy={l.y} r={l.r} fill={tone.fill} />
    ))}
    {lobes.map((l, i) => {
      const d = l.dir ?? (i % 2 === 0 ? 1 : -1);
      return (
        <g key={`s${i}`} fill="none" stroke={tone.line} strokeWidth={lw} strokeLinecap="round">
          <path d={spiralPath(l.x + d * l.r * 0.05, l.y - l.r * 0.05, l.r * 0.66, 1.35, d, d === 1 ? Math.PI * 0.9 : Math.PI * 0.1, l.r * 0.55)} />
          <path d={arc(l.x, l.y, l.r * 0.86, d === 1 ? 200 : 250, d === 1 ? 290 : 340)} />
        </g>
      );
    })}
  </g>
);

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${(cx + Math.cos((a * Math.PI) / 180) * r).toFixed(1)},${(cy + Math.sin((a * Math.PI) / 180) * r).toFixed(1)}`;
  return `M${p(a0)} A${r},${r} 0 0 1 ${p(a1)}`;
};

export const SepiaSky: React.FC<{cx?: number; cy?: number}> = ({cx = 960, cy = 520}) => (
  <g>
    <defs>
      <radialGradient id="c-sky" cx={cx} cy={cy} r={1150} gradientUnits="userSpaceOnUse" gradientTransform={`translate(${cx} ${cy}) scale(1 0.8) translate(${-cx} ${-cy})`}>
        <stop offset="0" stopColor={WARM.hot} />
        <stop offset="0.22" stopColor={WARM.glow} />
        <stop offset="0.45" stopColor={WARM.wallLight} />
        <stop offset="0.7" stopColor={WARM.wallMid} />
        <stop offset="1" stopColor={WARM.wallDark} />
      </radialGradient>
      <linearGradient id="c-skytop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={WARM.top} stopOpacity={0.9} />
        <stop offset="0.4" stopColor={WARM.top} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="c-band" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffe2c4" stopOpacity={0} />
        <stop offset="0.5" stopColor="#ffe2c4" stopOpacity={0.12} />
        <stop offset="1" stopColor="#ffe2c4" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#c-sky)" />
    <rect width={W} height={H} fill="url(#c-skytop)" />
    {[
      [cx - 520, 140],
      [cx - 180, 220],
      [cx + 260, 120],
      [cx + 560, 200],
    ].map(([x, w], i) => (
      <rect key={i} x={x} y={-300} width={w} height={1700} fill="url(#c-band)" transform={`rotate(${i % 2 ? -24 : -30} ${x} 540)`} />
    ))}
    <BrushStreaks seed={4} light="#f3caa4" dark="#5a2724" />
  </g>
);

export type CloudBankSpec = {x: number; y: number; len: number; r: number; dir: 1 | -1; slope?: number};

export const CloudBank: React.FC<{id: string; spec: CloudBankSpec; tone: CloudTone; dx?: number; lw?: number}> = ({id, spec, tone, dx = 0, lw = 2.6}) => {
  const {x, y, len, r, dir, slope = 0} = spec;
  const n = Math.max(3, Math.ceil(len / (r * 0.62)));
  const lobes = Array.from({length: n}, (_, i) => {
    const u = i / (n - 1);
    const rr = r * (1 - 0.45 * u);
    return {x: x + dir * u * len, y: y + slope * u * len - Math.sin(i * 1.9) * rr * 0.18, r: rr};
  });
  const belly = (k: number) => lobes.map((l) => `${l.x.toFixed(1)},${(l.y + l.r * k).toFixed(1)}`);
  const bellyPath = `M${lobes[0].x},${lobes[0].y} L${belly(1.08).join(' L')} L${lobes[n - 1].x},${lobes[n - 1].y} Z`;
  const midX = x + (dir * len) / 2;
  const midY = y + (slope * len) / 2;
  return (
    <g transform={`translate(${dx} 0)`}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={tone.halo} stopOpacity={0.8} />
          <stop offset="0.5" stopColor={tone.halo} stopOpacity={0.45} />
          <stop offset="1" stopColor={tone.halo} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={midX} cy={midY + r * 0.55} rx={len * 0.62 + r * 1.3} ry={r * 1.75} fill={`url(#${id}-halo)`} transform={`rotate(${(Math.atan(slope) * 180) / Math.PI} ${midX} ${midY})`} />
      {lobes.map((l, i) => (
        <circle key={`o${i}`} cx={l.x} cy={l.y} r={l.r} fill={tone.line} stroke={tone.line} strokeWidth={lw * 2} />
      ))}
      {lobes.map((l, i) => (
        <circle key={`f${i}`} cx={l.x} cy={l.y} r={l.r} fill={tone.fill} />
      ))}
      <path d={bellyPath} fill={tone.fill} />
      <g fill="none" stroke={tone.line} strokeWidth={lw} strokeLinecap="round">
        {lobes.map((l, i) => {
          if (i === 0) return <path key={i} d={spiralPath(l.x, l.y + l.r * 0.05, l.r * 0.74, 1.7, dir, Math.PI / 2, Math.min(len * 0.3, l.r * 1.6))} />;
          if (i % 2 === 0 && i < n - 1) return <path key={i} d={spiralPath(l.x, l.y + l.r * 0.1, l.r * 0.58, 1.25, dir, Math.PI / 2, l.r * 0.9)} />;
          return <path key={i} d={arc(l.x, l.y, l.r * 0.78, dir === 1 ? 205 : 245, dir === 1 ? 295 : 335)} opacity={0.8} />;
        })}
      </g>
    </g>
  );
};

export const WarmCorners: React.FC<{dx?: number; low?: boolean; mid?: boolean}> = ({dx = 0, low = false, mid = true}) => (
  <g>
    {!mid && <CloudBank id="cw9" tone={WARM_MID} dx={dx * 0.5} lw={2.6} spec={{x: 860, y: 150, len: 260, r: 70, dir: 1, slope: -0.05}} />}
    {mid && <CloudBank id="cw3" tone={WARM_MID} dx={dx * 0.5} lw={2.6} spec={{x: 600, y: 270, len: 300, r: 92, dir: -1, slope: 0.25}} />}
    {mid && <CloudBank id="cw4" tone={WARM_MID} dx={dx * 0.5} lw={2.6} spec={{x: 1330, y: 250, len: 320, r: 96, dir: 1, slope: 0.18}} />}
    <CloudBank id="cw5" tone={WARM_NEAR} dx={dx} lw={3} spec={{x: 330, y: 60, len: 420, r: 150, dir: -1, slope: 0.45}} />
    <CloudBank id="cw6" tone={WARM_NEAR} dx={dx} lw={3} spec={{x: 1560, y: 40, len: 460, r: 150, dir: 1, slope: 0.3}} />
    {low && <CloudBank id="cw7" tone={WARM_MID} dx={dx * 0.8} lw={2.6} spec={{x: 1680, y: 560, len: 300, r: 90, dir: 1, slope: 0.1}} />}
    {low && <CloudBank id="cw8" tone={WARM_MID} dx={dx * 0.8} lw={2.6} spec={{x: 240, y: 600, len: 300, r: 86, dir: -1, slope: 0.12}} />}
  </g>
);

export const BrushStreaks: React.FC<{seed?: number; light: string; dark: string; angle?: number}> = ({seed = 1, light, dark, angle = -62}) => {
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return (
    <g transform={`rotate(${angle} 960 540)`} strokeLinecap="round" fill="none">
      {Array.from({length: 46}, (_, i) => {
        const x = -500 + rnd() * 2900;
        const y = -300 + rnd() * 1700;
        const l = 200 + rnd() * 700;
        return <path key={i} d={`M${x.toFixed(0)},${y.toFixed(0)} l${l.toFixed(0)},${(rnd() * 30 - 15).toFixed(0)}`} stroke={i % 3 ? light : dark} strokeWidth={22 + rnd() * 60} opacity={0.03 + rnd() * 0.045} />;
      })}
    </g>
  );
};

export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; w?: number}> = ({x1, y1, x2, y2, w = 12}) => {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${ang})`} fill={WARM.red}>
      <path d={`M0,0 L${w * 9},${-w * 1.6} L${w * 7},0 L${w * 9},${w * 1.6} Z`} />
      <rect x={w * 6} y={-w / 2} width={len - w * 10} height={w} />
      <path d={`M${len * 0.2},0 L${len * 0.2 + w * 3},${-w * 2.2} L${len * 0.2 + w * 6},0 L${len * 0.2 + w * 3},${w * 2.2} Z`} />
      <path d={`M${len - w * 14},0 L${len - w * 4},${-w * 3.2} L${len - w * 7},0 L${len - w * 4},${w * 3.2} Z M${len - w * 9},0 L${len},${-w * 3.4} L${len - w * 2},0 L${len},${w * 3.4} Z`} />
    </g>
  );
};

export const NightSky: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="c-night" cx={960} cy={470} r={1100} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={COOL.violet3} />
        <stop offset="0.3" stopColor={COOL.violet2} />
        <stop offset="0.6" stopColor={COOL.violet} />
        <stop offset="1" stopColor={COOL.indigo2} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#c-night)" />
    <BrushStreaks seed={7} light="#8a7ab8" dark="#1b1640" angle={-70} />
  </g>
);

export const CoolCorners: React.FC<{dx?: number}> = ({dx = 0}) => (
  <g>
    <CloudBank id="cc1" tone={COOL_FAR} dx={dx * 0.6} lw={2.2} spec={{x: 560, y: 250, len: 260, r: 84, dir: -1, slope: 0.2}} />
    <CloudBank id="cc2" tone={COOL_FAR} dx={dx * 0.6} lw={2.2} spec={{x: 1360, y: 240, len: 280, r: 86, dir: 1, slope: 0.16}} />
    <CloudBank id="cc3" tone={COOL_NEAR} dx={dx} lw={2.8} spec={{x: 330, y: 40, len: 420, r: 140, dir: -1, slope: 0.4}} />
    <CloudBank id="cc4" tone={COOL_NEAR} dx={dx} lw={2.8} spec={{x: 1590, y: 30, len: 440, r: 140, dir: 1, slope: 0.32}} />
  </g>
);

const lotusFlower = (s: number) => {
  const petal = (a: number, len: number, wid: number) =>
    `<path transform="rotate(${a})" d="M0,0 C${wid},${-len * 0.35} ${wid * 0.6},${-len * 0.8} 0,${-len} C${-wid * 0.6},${-len * 0.8} ${-wid},${-len * 0.35} 0,0 Z"/>`;
  return [-62, 62, -34, 34, 0].map((a) => petal(a, s * (a === 0 ? 1 : 0.86), s * 0.34)).join('');
};

export const Lotus: React.FC<{x: number; y: number; s: number; rot?: number; line?: string}> = ({x, y, s, rot = 0, line = COOL.lilac}) => (
  <g
    transform={`translate(${x} ${y}) rotate(${rot})`}
    fill={COOL.blossom}
    stroke={line}
    strokeWidth={Math.max(1.5, s * 0.04)}
    strokeLinejoin="round"
    dangerouslySetInnerHTML={{__html: lotusFlower(s)}}
  />
);

export const Petal: React.FC<{x: number; y: number; s: number; rot: number; opacity?: number}> = ({x, y, s, rot, opacity = 0.9}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot})`} d={`M0,0 C${s * 0.45},${-s * 0.3} ${s * 0.3},${-s * 0.85} 0,${-s} C${-s * 0.3},${-s * 0.85} ${-s * 0.45},${-s * 0.3} 0,0 Z`} fill={COOL.blossom} opacity={opacity} />
);

const Glow: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <>
    <defs>
      <radialGradient id="c-bloom">
        <stop offset="0" stopColor={COOL.blossom} stopOpacity={0.55} />
        <stop offset="0.45" stopColor={COOL.pale} stopOpacity={0.18} />
        <stop offset="1" stopColor={COOL.pale} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill="url(#c-bloom)" />
  </>
);

export const LotusThicket: React.FC<{side: 1 | -1; t?: number}> = ({side, t = 0}) => {
  const sx = (x: number) => (side === 1 ? x : W - x);
  const stem = '#191338';
  const pad = '#21194a';
  const sway = Math.sin(t * 0.05) * 5;
  const pads: [number, number, number][] = [
    [120, 500, 120],
    [470, 860, 160],
    [-40, 700, 170],
    [300, 1040, 190],
    [60, 300, 90],
  ];
  return (
    <g>
      <g fill="none" stroke={stem} strokeLinecap="round">
        <path d={`M${sx(-40)},1120 C${sx(160)},880 ${sx(60)},640 ${sx(260 + sway)},400`} strokeWidth={34} />
        <path d={`M${sx(140)},1120 C${sx(330)},920 ${sx(270)},760 ${sx(400 + sway)},600`} strokeWidth={26} />
        <path d={`M${sx(-20)},820 C${sx(110)},700 ${sx(160)},600 ${sx(120)},500`} strokeWidth={18} />
        <path d={`M${sx(40)},980 C${sx(200)},900 ${sx(360)},900 ${sx(470)},860`} strokeWidth={16} />
        <path d={`M${sx(-30)},560 C${sx(40)},460 ${sx(80)},380 ${sx(60)},300`} strokeWidth={14} />
        <path d={`M${sx(200)},1100 C${sx(260)},1000 ${sx(330)},960 ${sx(520 + sway)},780`} strokeWidth={12} />
      </g>
      <g fill={pad}>
        {pads.map(([x, y, r], i) => (
          <path key={i} d={padPath(sx(x), y, r, side)} />
        ))}
      </g>
      <g fill="none" stroke="#3a3078" strokeWidth={2.4} strokeLinecap="round">
        {pads.map(([x, y, r], i) => (
          <path key={i} d={padVeins(sx(x), y, r)} />
        ))}
        {pads.map(([x, y, r], i) => (
          <path key={`e${i}`} d={`M${sx(x - r * 0.9)},${y + 4} C${sx(x - r * 0.4)},${y + r * 0.46} ${sx(x + r * 0.4)},${y + r * 0.46} ${sx(x + r * 0.9)},${y + 4}`} opacity={0.6} />
        ))}
      </g>
      <Glow x={sx(260 + sway)} y={380} r={130} />
      <Glow x={sx(400 + sway)} y={585} r={100} />
      <Glow x={sx(520 + sway)} y={765} r={80} />
      <Lotus x={sx(260 + sway)} y={400} s={84} rot={side * 12} />
      <Lotus x={sx(400 + sway)} y={600} s={64} rot={side * -8} />
      <path transform={`translate(${sx(520 + sway)} 780) rotate(${side * 34})`} d="M0,0 C20,-18 16,-54 0,-70 C-16,-54 -20,-18 0,0 Z" fill={COOL.blossom} stroke={COOL.lilac} strokeWidth={2.4} />
    </g>
  );
};

const padPath = (cx: number, cy: number, r: number, side: 1 | -1) => {
  const ry = r * 0.42;
  const notch = side * 0.25;
  const a0 = -Math.PI / 2 + notch;
  const a1 = -Math.PI / 2 - notch + Math.PI * 2;
  const p = (a: number) => `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * ry).toFixed(1)}`;
  return `M${cx},${cy} L${p(a0)} A${r},${ry} 0 1 1 ${p(a1)} Z`;
};

const padVeins = (cx: number, cy: number, r: number) =>
  [0.3, 0.9, 1.6, 2.3, 2.9].map((a) => `M${cx},${cy} L${(cx + Math.cos(a) * r * 0.85).toFixed(1)},${(cy + Math.sin(a) * r * 0.36).toFixed(1)}`).join(' ');

export const Halo: React.FC<{x: number; y: number; r: number; t?: number}> = ({x, y, r, t = 0}) => {
  const dots = 36;
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={COOL.pale} strokeLinecap="round">
      <defs>
        <radialGradient id="c-halo-glow">
          <stop offset="0" stopColor={COOL.pale} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={COOL.periwinkle} stopOpacity={0.22} />
          <stop offset="1" stopColor={COOL.periwinkle} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 1.35} fill="url(#c-halo-glow)" stroke="none" />
      <circle r={r} strokeWidth={2.4} opacity={0.75} />
      <circle r={r * 0.9} strokeWidth={1.4} opacity={0.5} />
      <g transform={`rotate(${t * 0.4})`}>
        {Array.from({length: dots}, (_, i) => {
          const a = (i / dots) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * r * 1.08} cy={Math.sin(a) * r * 1.08} r={i % 3 === 0 ? 4 : 2.2} fill={COOL.pale} stroke="none" opacity={0.7} />;
        })}
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * 360;
          return <path key={`w${i}`} transform={`rotate(${a})`} d={`M${r * 0.92},0 C${r * 0.82},${-r * 0.1} ${r * 0.7},${r * 0.02} ${r * 0.78},${r * 0.1}`} strokeWidth={1.6} opacity={0.45} />;
        })}
      </g>
    </g>
  );
};
