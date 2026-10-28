import React from 'react';
import { useSvgId } from '../Atmosphere';
import { Pt, smooth } from '../geom';

/** f2's white roses translated: pale glowing lotus blossoms with a soft bloom. */
export const Lotus: React.FC<{ x: number; y: number; size: number; rot?: number; glow?: number }> = ({
  x,
  y,
  size,
  rot = 0,
  glow = 1,
}) => {
  const id = useSvgId('lotus');
  const petal = (a: number, len: number, wid: number) => (
    <path
      key={a}
      transform={`rotate(${a})`}
      d={`M0,0 Q${-wid},${-len * 0.45} 0,${-len} Q${wid},${-len * 0.45} 0,0Z`}
    />
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

/** Dark lotus stems and sword leaves standing in for f2's thorn branches. */
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
            return (
              <path
                key={j}
                stroke="none"
                d={`M${x0},${y0} Q${mx + nx},${my + ny} ${tip[0]},${tip[1]} Q${mx - nx},${my - ny} ${x0},${y0}Z`}
              />
            );
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
