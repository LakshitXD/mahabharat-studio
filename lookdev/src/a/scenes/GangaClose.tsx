import React from "react";
import { Frame } from "./Frame";
import { LooseCurls, Sky, makeCloud } from "../Sky";
import { Ganga } from "../Ganga";
import { EXPRESSIONS, type Expression } from "../expressions";
import { GANGA, LINE_W } from "../palette";

const NIGHT_CLOUDS = [
  makeCloud(21, -200, 140, 560, -120, 130, 170, 300, 5),
  makeCloud(22, -160, 700, 380, 300, 150, 150, 250, 4),
  makeCloud(23, 1340, -140, 2120, 120, 120, 170, 320, 5),
  makeCloud(24, 1560, 380, 2100, 700, 140, 150, 250, 4),
];

/** Pale lotus: a fan of pointed petals, inner petal lines in the ornament colour. */
const Blossom: React.FC<{ x: number; y: number; r: number; a?: number }> = ({ x, y, r, a = 0 }) => {
  const petals: React.ReactNode[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + ((i - (n - 1) / 2) / (n - 1)) * Math.PI * 1.2;
    const len = r * (i === (n - 1) / 2 ? 1 : 0.82 + 0.08 * Math.abs(i - (n - 1) / 2));
    const tx = Math.cos(ang) * len;
    const ty = Math.sin(ang) * len;
    const px = -Math.sin(ang) * r * 0.4;
    const py = Math.cos(ang) * r * 0.4;
    petals.push(
      <path
        key={i}
        d={`M0,0 Q${tx * 0.45 + px},${ty * 0.45 + py} ${tx},${ty} Q${tx * 0.45 - px},${ty * 0.45 - py} 0,0 Z`}
      />,
    );
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${(a * 180) / Math.PI})`}>
      <circle cx={0} cy={-r * 0.3} r={r * 1.1} fill={GANGA.halo} opacity={0.08} />
      <g fill={GANGA.halo} opacity={0.92}>{petals}</g>
      <g fill="none" stroke="#9a86c8" strokeWidth={1.6} opacity={0.8}>
        {petals}
      </g>
    </g>
  );
};

export const GangaCloseShot: React.FC<{ frame?: number; expression?: Expression; mouth?: number; blink?: number }> = ({
  frame = 0,
  expression = EXPRESSIONS.neutral,
  mouth,
  blink = 0,
}) => {
  const drift = frame * 0.6;
  return (
    <Frame grain={0.22} mottle={0.5}>
      <Sky mood="night" glowX={960} glowY={420} clouds={NIGHT_CLOUDS} drift={drift} />
      <LooseCurls mood="night" items={[[330, 520, 34], [1600, 420, 30]]} drift={drift} />
      <g transform={`translate(${drift * 0.3},0)`}>
        {/* lotus stems framing the face, in the ornament colour, with blade leaves */}
        <g fill="none" stroke="#503f8d" strokeWidth={LINE_W * 1.6} strokeLinecap="round">
          <path d="M-40,1120 C200,900 260,600 180,260 C160,180 220,120 300,110" />
          <path d="M120,1120 C300,980 420,760 380,520 C360,420 420,360 480,340" opacity={0.8} />
          <path d="M1980,1140 C1760,940 1660,700 1740,420 C1760,340 1700,240 1600,220" />
          <path d="M1860,1140 C1680,1040 1560,880 1540,700" opacity={0.8} />
        </g>
        <g fill="#503f8d" opacity={0.9}>
          <path d="M210,560 C150,520 130,440 160,380 C210,420 230,500 210,560 Z" />
          <path d="M1700,620 C1760,580 1780,500 1750,440 C1700,480 1680,560 1700,620 Z" />
          <path d="M360,820 C300,800 270,740 290,690 C340,720 370,770 360,820 Z" opacity={0.8} />
        </g>
        <Blossom x={300} y={110} r={88} a={-0.3} />
        <Blossom x={480} y={340} r={60} a={0.5} />
        <Blossom x={1600} y={220} r={78} a={0.2} />
        <Blossom x={1540} y={700} r={66} a={-0.6} />
        <Blossom x={180} y={760} r={48} a={0.9} />
      </g>
      <Ganga x={960} y={10} scale={1.8} expression={expression} mouth={mouth} blink={blink} phase={frame * 0.08} bust />
    </Frame>
  );
};

export const GangaClose: React.FC = () => <GangaCloseShot />;
