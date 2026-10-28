import React from 'react';
import { Grain, Vignette } from '../Atmosphere';
import { QUEEN } from '../expressions';
import { Ganga, GangaProps } from '../Ganga';
import { NIGHT } from '../palette';
import { Frame } from './Frame';
import { Lotus, Motes, Reed, Reeds } from './night';
import { NIGHT_CLOSE_SKY, Sky } from './sky';

const REEDS: readonly Reed[] = [
  { pts: [[40, 1100], [150, 880], [250, 720], [300, 560]], w: 13, leaves: [{ at: 0.2, len: 190, side: -1 }, { at: 0.45, len: 160, side: 1 }, { at: 0.7, len: 120, side: -1 }] },
  { pts: [[-30, 1000], [70, 820], [130, 640], [130, 470]], w: 11, leaves: [{ at: 0.35, len: 150, side: 1 }, { at: 0.65, len: 120, side: -1 }] },
  { pts: [[260, 1100], [330, 960], [420, 862]], w: 10, leaves: [{ at: 0.3, len: 130, side: -1 }, { at: 0.6, len: 100, side: 1 }] },
  { pts: [[1880, 1100], [1770, 880], [1670, 720], [1620, 560]], w: 13, leaves: [{ at: 0.2, len: 190, side: 1 }, { at: 0.45, len: 160, side: -1 }, { at: 0.7, len: 120, side: 1 }] },
  { pts: [[1950, 1000], [1850, 820], [1790, 640], [1790, 470]], w: 11, leaves: [{ at: 0.35, len: 150, side: -1 }, { at: 0.65, len: 120, side: 1 }] },
  { pts: [[1660, 1100], [1590, 960], [1500, 862]], w: 10, leaves: [{ at: 0.3, len: 130, side: 1 }, { at: 0.6, len: 100, side: -1 }] },
];

export const GangaNight: React.FC<{ ganga: Partial<GangaProps>; drift?: number; grainSeed?: number; grain?: boolean }> = ({
  ganga,
  drift = 0,
  grainSeed = 5,
  grain = true,
}) => (
  <Frame>
    <Sky mood={NIGHT} layout={NIGHT_CLOSE_SKY} drift={drift} />
    <Motes seed={11} n={40} color="#d6ccff" drift={drift * 2} />
    <Reeds reeds={REEDS} color="#161233" />
    <Lotus x={300} y={560} size={70} rot={-20} />
    <Lotus x={130} y={470} size={52} rot={-5} />
    <Lotus x={1620} y={560} size={70} rot={20} />
    <Lotus x={1790} y={470} size={52} rot={5} />
    <Lotus x={420} y={862} size={44} rot={30} />
    <Lotus x={1500} y={862} size={44} rot={-30} />
    <Vignette mood={NIGHT} c={[960, 480]} strength={0.35} />
    <Ganga x={960} y={420} scale={0.95} face={QUEEN.neutral} hem={720} {...ganga} />
    {grain && <Grain seed={grainSeed} opacity={NIGHT.grainOpacity} />}
  </Frame>
);

export const GangaClose: React.FC = () => <GangaNight ganga={{}} />;
