// The Ganga riverbank set, from variant B's wide: sky, far-shore shikharas, a river carrying the swirl
// vocabulary laid sideways, a dark near bank, foreground reeds, vignette and static grain.
import React from "react";
import type { SetDef, SetProps } from "../shared/contract";
import { Grain, GroundSwirls, Reed, Reeds, Sky, Vignette, WIDE_SKY } from "./atmosphere";
import { mulberry, Pt, smooth, SpiralSpec, swirlPath } from "./geom";
import { MOODS } from "./palette";

const temple = (x: number, y: number, h: number) => {
  const w = h * 0.26;
  const top = y - h * 0.86;
  return [
    `M${x - w * 1.3},${y} L${x - w * 1.3},${y - h * 0.16} L${x - w},${y - h * 0.16}`,
    `C${x - w * 1.02},${y - h * 0.5} ${x - w * 0.7},${y - h * 0.76} ${x - w * 0.36},${top}`,
    `L${x - w * 0.5},${top - h * 0.02} Q${x},${top - h * 0.07} ${x + w * 0.5},${top - h * 0.02} L${x + w * 0.36},${top}`,
    `C${x + w * 0.7},${y - h * 0.76} ${x + w * 1.02},${y - h * 0.5} ${x + w},${y - h * 0.16}`,
    `L${x + w * 1.3},${y - h * 0.16} L${x + w * 1.3},${y}Z`,
    `M${x - w * 0.12},${top - h * 0.05} L${x},${y - h} L${x + w * 0.12},${top - h * 0.05}Z`,
  ].join("");
};

const FAR_SHORE = 650;

const waveRows = (): SpiralSpec[] => {
  const r = mulberry(4);
  const out: SpiralSpec[] = [];
  const rows = [
    { y: 700, size: 9, gap: 210, w: 3 },
    { y: 760, size: 13, gap: 260, w: 4 },
    { y: 840, size: 18, gap: 330, w: 5 },
    { y: 950, size: 25, gap: 420, w: 7 },
    { y: 1060, size: 32, gap: 500, w: 8 },
  ];
  rows.forEach((row, ri) => {
    for (let x = -60 + (ri % 2) * row.gap * 0.5 + r() * 80; x < 1980; x += row.gap * (0.7 + r() * 0.6)) {
      const flip = r() > 0.5;
      out.push({ x: x + r() * 30, y: row.y + r() * 10, rot: flip ? 180 : 0, size: row.size, w: row.w, tail: 3.2, flip, hook: 0.35, bend: 0.2 });
    }
  });
  return out;
};

const WAVES = waveRows();

const REEDS: readonly Reed[] = [
  { pts: [[30, 1100], [60, 920], [120, 800]], w: 8, leaves: [{ at: 0.3, len: 120, side: -1 }, { at: 0.6, len: 90, side: 1 }] },
  { pts: [[150, 1100], [170, 960], [150, 840]], w: 7, leaves: [{ at: 0.4, len: 100, side: 1 }] },
  { pts: [[1830, 1100], [1800, 930], [1740, 820]], w: 8, leaves: [{ at: 0.3, len: 120, side: 1 }, { at: 0.6, len: 90, side: -1 }] },
  { pts: [[1900, 1100], [1890, 960], [1910, 860]], w: 7, leaves: [{ at: 0.4, len: 100, side: -1 }] },
];

const NEAR_BANK: Pt[] = [[-20, 890], [300, 905], [620, 930], [900, 990], [1000, 1100], [-20, 1100]];

const BANK_SWIRLS: SpiralSpec[] = [
  { x: 160, y: 990, rot: 170, size: 26, w: 6, tail: 4, flip: true },
  { x: 520, y: 1010, rot: 10, size: 30, w: 6, tail: 4, hook: 0.35 },
];

export const GangaTatBack: React.FC<SetProps> = ({ mood: moodName, frame }) => {
  const mood = MOODS[moodName];
  const drift = frame * 0.25;
  return (
    <g>
      <Sky mood={mood} layout={WIDE_SKY} drift={drift} />
      <g fill={mood.shore} opacity={0.75}>
        <path d={temple(250, FAR_SHORE, 200)} />
        <path d={temple(360, FAR_SHORE, 130)} />
        <path d={temple(1660, FAR_SHORE, 220)} />
        <path d={temple(1540, FAR_SHORE, 140)} />
        <path d={temple(1780, FAR_SHORE, 110)} />
        <path d={`M-20,${FAR_SHORE} Q200,${FAR_SHORE - 40} 520,${FAR_SHORE - 12} Q900,${FAR_SHORE - 30} 1300,${FAR_SHORE - 14} Q1700,${FAR_SHORE - 44} 1940,${FAR_SHORE - 10} L1940,${FAR_SHORE + 10} L-20,${FAR_SHORE + 10}Z`} />
      </g>
      <defs>
        <linearGradient id={`river-${moodName}`} x1={0} y1={FAR_SHORE} x2={0} y2={1080} gradientUnits="userSpaceOnUse">
          <stop offset={0} stopColor={mood.riverTop} />
          <stop offset={0.35} stopColor={mood.riverMid} />
          <stop offset={1} stopColor={mood.riverDeep} />
        </linearGradient>
      </defs>
      <rect x={0} y={FAR_SHORE} width={1920} height={1080 - FAR_SHORE} fill={`url(#river-${moodName})`} />
      <g fill={mood.glint} opacity={0.5}>
        {[[880, 668, 120], [1120, 676, 80], [980, 700, 200], [760, 712, 90], [1200, 726, 140], [1040, 760, 260]].map(([x, y, w], i) => (
          <rect key={i} x={x - w / 2 + Math.sin(frame / 40 + i) * 6} y={y} width={w} height={3 + i * 0.6} rx={2} />
        ))}
      </g>
      <g fill={mood.wave}>
        {WAVES.map((s, i) => (
          <path key={i} d={swirlPath({ ...s, x: s.x + Math.sin(frame / 50 + i) * 4 })} opacity={0.3 + 0.4 * ((s.y - FAR_SHORE) / 420)} />
        ))}
      </g>
      <path d={smooth(NEAR_BANK, true)} fill={mood.bank} />
      <GroundSwirls color={mood.bankSwirl} spirals={BANK_SWIRLS} opacity={1} />
    </g>
  );
};

export const GangaTatFront: React.FC<SetProps> = ({ mood: moodName }) => {
  const mood = MOODS[moodName];
  return (
    <g>
      <Reeds reeds={REEDS} color={mood.reed} />
      <Vignette mood={mood} c={[990, 640]} strength={0.45} />
      <Grain seed={9} opacity={mood.grainOpacity} />
    </g>
  );
};

export const gangaTat: SetDef = {
  id: "ganga-tat",
  Back: GangaTatBack,
  Front: GangaTatFront,
  groundY: 0.88,
  actorScale: 0.62,
};
