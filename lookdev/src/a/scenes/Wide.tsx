import React from "react";
import { Frame } from "./Frame";
import { LooseCurls, Sky, W, makeCloud } from "../Sky";
import { Shantanu } from "../Shantanu";
import { Ganga } from "../Ganga";
import { EXPRESSIONS } from "../expressions";
import { GANGA, KING, LINE_W } from "../palette";

const CLOUDS = [
  makeCloud(31, -140, 60, 620, -80, 110, 130, 260, 6),
  makeCloud(32, -100, 380, 400, 120, 110, 110, 200, 5),
  makeCloud(33, 1300, -100, 2060, 100, 90, 130, 260, 6),
  makeCloud(34, 1540, 160, 2060, 420, 100, 110, 220, 5),
  makeCloud(35, 760, -160, 1240, -150, 20, 90, 150, 4),
];

const HORIZON = 800;

const River: React.FC = () => {
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const y = HORIZON + 30 + i * 22 + i * i * 0.6;
    const amp = 6 + i * 1.2;
    const seg = 160 + i * 20;
    let d = `M${-200 + (i % 3) * 60},${y}`;
    for (let x = -200; x < W + 200; x += seg) {
      d += ` q${seg / 4},${-amp} ${seg / 2},0 t${seg / 2},0`;
    }
    lines.push(<path key={i} d={d} opacity={0.35 + 0.03 * i} />);
  }
  return (
    <g>
      <defs>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f6a" />
          <stop offset="1" stopColor="#1b1540" />
        </linearGradient>
      </defs>
      <rect y={HORIZON} width={W} height={1080 - HORIZON} fill="url(#river)" />
      <g fill="none" stroke={GANGA.robeLine} strokeWidth={LINE_W} strokeLinecap="round">
        {lines}
      </g>
    </g>
  );
};

/** Banks and reeds as flat ink. */
const FarBank: React.FC = () => (
  <path
    fill={KING.ink}
    d={`M0,${HORIZON - 30} C300,${HORIZON - 56} 700,${HORIZON - 36} 1100,${HORIZON - 20} C1400,${HORIZON - 10} 1700,${HORIZON - 30} 1920,${HORIZON - 26} L1920,${HORIZON + 4} L0,${HORIZON + 4} Z`}
  />
);

const Bank: React.FC = () => (
  <g fill={KING.ink}>
    {/* near bank, left, drawn over the king's hem so he stands on it; deep burgundy so his ink separates */}
    <path d={`M0,856 C300,836 620,846 820,896 C900,920 930,1000 920,1080 L0,1080 Z`} fill="#2a0d0d" />
    <path d={`M0,856 C300,836 620,846 820,896 C900,920 930,1000 920,1080`} fill="none" stroke={KING.line} strokeWidth={LINE_W} opacity={0.5} />
    <g stroke={KING.ink} strokeWidth={LINE_W * 1.2} strokeLinecap="round" fill="none">
      {[90, 130, 170, 210, 1760, 1800, 1840, 1880].map((x, i) => {
        const base = i < 4 ? 884 : HORIZON - 20;
        return (
          <g key={x}>
            <path d={`M${x},${base} C${x - 10},${base - 100} ${x + 20},${base - 190} ${x + (i % 2 ? 24 : -16)},${base - 250}`} />
            <path d={`M${x + 4},${base - 120} C${x + 40},${base - 150} ${x + 60},${base - 190} ${x + 56},${base - 230}`} />
          </g>
        );
      })}
    </g>
    {/* ink lotus leaves at the water's edge */}
    <ellipse cx={1000} cy={1040} rx={70} ry={16} />
    <ellipse cx={1140} cy={1062} rx={54} ry={12} />
  </g>
);

const Lotus: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={KING.accent}>
    <path d="M0,0 C-16,-24 -14,-60 0,-78 C14,-60 16,-24 0,0 Z" />
    <path d="M-4,0 C-30,-14 -48,-42 -42,-70 C-22,-58 -8,-34 -2,-6 Z" />
    <path d="M4,0 C30,-14 48,-42 42,-70 C22,-58 8,-34 2,-6 Z" />
    <path d="M-8,2 C-42,-4 -66,-22 -74,-48 C-50,-46 -28,-28 -6,-4 Z" />
    <path d="M8,2 C42,-4 66,-22 74,-48 C50,-46 28,-28 6,-4 Z" />
    <path d="M-12,4 C-50,6 -80,-4 -94,-22 C-66,-26 -36,-14 -10,0 Z" />
    <path d="M12,4 C50,6 80,-4 94,-22 C66,-26 36,-14 10,0 Z" />
  </g>
);

export const Wide: React.FC = () => (
  <Frame>
    <Sky mood="warm" glowX={1010} glowY={520} clouds={CLOUDS} />
    <LooseCurls mood="warm" items={[[1180, 120, 28], [860, 420, 20]]} />
    <River />
    <FarBank />
    <Shantanu x={560} y={230} scale={0.36} expression={EXPRESSIONS.neutral} turn={0.6} arm="offer" />
    <Bank />
    {/* ripple rings where Ganga stands on the water */}
    <g fill="none" stroke={GANGA.robeLine} strokeWidth={LINE_W} opacity={0.5}>
      <ellipse cx={1330} cy={1000} rx={210} ry={22} />
      <ellipse cx={1330} cy={1004} rx={300} ry={34} opacity={0.6} />
      <ellipse cx={1330} cy={1010} rx={400} ry={48} opacity={0.35} />
    </g>
    <Ganga x={1330} y={310} scale={0.365} expression={EXPRESSIONS.smile} turn={-0.5} phase={0.6} />
    <Lotus x={1090} y={1030} s={1.0} />
  </Frame>
);
