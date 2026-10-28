import React from 'react';

export const WARM = {
  ink: '#0a0302',
  inkSoft: '#150504',
  cloudDeep: '#2f1615',
  cloud: '#5a2724',
  cloudLine: '#8a4a3e',
  wallDark: '#76453e',
  wallMid: '#9f5647',
  wallLight: '#bd7f67',
  glow: '#cf967a',
  hot: '#e6b58d',
  top: '#8f3a2e',
  cream: '#f2c7a0',
  red: '#d7071d',
  gold: '#e8b04a',
} as const;

export const COOL = {
  night: '#121340',
  nightDeep: '#0d0b24',
  indigo: '#22255b',
  indigo2: '#2d2352',
  violet: '#403273',
  violet2: '#504184',
  violet3: '#624e94',
  lilac: '#8a7ab8',
  periwinkle: '#8ba0d8',
  pale: '#bfd2ef',
  blossom: '#fcf8f9',
  hair: '#3b3150',
  hairLight: '#5e5176',
  hairLine: '#7c6e94',
  hood: '#211a30',
} as const;

export const FACE = {
  light: '#fbf7f8',
  edge: '#e2d9e6',
  ink: '#5c4a66',
  lash: '#2b2130',
  iris: '#9a7690',
  pupil: '#231b24',
  blush: '#e8a9bf',
  lip: '#8f6c86',
  mouth: '#4a2a3a',
  neck: '#bba6b5',
} as const;

export const W = 1920;
export const H = 1080;

export const Pivot: React.FC<{x: number; y: number; angle?: number; children: React.ReactNode}> = ({x, y, angle = 0, children}) => (
  <g transform={`rotate(${angle} ${x} ${y})`}>{children}</g>
);

export const spiralPath = (cx: number, cy: number, r: number, turns: number, dir: 1 | -1, start: number, tail = 0): string => {
  const n = Math.ceil(turns * 28);
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + dir * t * turns * Math.PI * 2;
    const rr = r * (1 - 0.82 * t);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  const head = tail > 0 ? `M${(cx + Math.cos(start) * r + Math.cos(start - dir * Math.PI / 2) * tail).toFixed(1)},${(cy + Math.sin(start) * r + Math.sin(start - dir * Math.PI / 2) * tail).toFixed(1)} L` : 'M';
  return head + pts.join(' L');
};

export const Grain: React.FC<{seed?: number; strength?: number}> = ({seed = 3, strength = 0.32}) => (
  <>
    <defs>
      <filter id="c-grain" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
    <rect x={0} y={0} width={W} height={H} filter="url(#c-grain)" opacity={strength} style={{mixBlendMode: 'overlay'}} />
  </>
);

export const Frame: React.FC<{children: React.ReactNode; bg: string; grainSeed?: number; grain?: number}> = ({children, bg, grainSeed, grain}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{display: 'block', background: bg}}>
    {children}
    <Grain seed={grainSeed} strength={grain} />
  </svg>
);
