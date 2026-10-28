import React from 'react';
import { CloudBank, CloudBankSpec, Ground, GroundSwirls, Shaft, Shafts } from '../Atmosphere';
import { Mood } from '../palette';
import { edgeSwirls, Pt, SpiralSpec } from '../geom';

export type SkyLayout = {
  glow: Pt;
  rx: number;
  ry: number;
  shafts: readonly Shaft[];
  far: readonly CloudBankSpec[];
  near: readonly CloudBankSpec[];
  open: readonly SpiralSpec[];
};

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
      lobes: [
        { x: 520, y: 150, r: 170 },
        { x: 700, y: 30, r: 150 },
        { x: 380, y: 300, r: 120 },
      ],
      shadow: [0, 30],
      spirals: [
        { x: 600, y: 120, rot: 150, size: 46, w: 8, tail: 3.6, flip: true },
        { x: 470, y: 330, rot: -40, size: 34, w: 7, tail: 3.2 },
      ],
    },
    {
      far: true,
      lobes: [
        { x: 1780, y: 400, r: 150 },
        { x: 1610, y: 380, r: 100 },
        { x: 1960, y: 470, r: 160 },
        { x: 1290, y: 110, r: 110 },
      ],
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
      lobes: [
        { x: 40, y: 170, r: 280 },
        { x: 300, y: 0, r: 200 },
        { x: -110, y: 460, r: 160 },
      ],
      shadow: [18, 40],
      spirals: [
        { x: 70, y: 245, rot: 70, size: 66, w: 9, turns: 1.6, tail: 3.2 },
        { x: 290, y: 110, rot: 210, size: 52, w: 9, turns: 1.4, tail: 3.6, flip: true },
        ...edgeSwirls([[30, 590], [170, 470], [300, 330], [420, 190]], { size: 40, w: 8, flip: true, stretch: 0.8, hook: 0.4 }),
      ],
    },
    {
      lobes: [
        { x: 1500, y: 80, r: 230 },
        { x: 1760, y: 200, r: 240 },
        { x: 1960, y: 380, r: 200 },
        { x: 1290, y: -60, r: 190 },
        { x: 1940, y: 20, r: 220 },
      ],
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

export const Sky: React.FC<{ mood: Mood; layout: SkyLayout; drift?: number }> = ({ mood, layout, drift = 0 }) => (
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
      lobes: [
        { x: 480, y: 90, r: 160 },
        { x: 300, y: 260, r: 150 },
        { x: 640, y: -30, r: 150 },
      ],
      shadow: [0, 30],
      spirals: [
        { x: 470, y: 120, rot: 160, size: 44, w: 8, tail: 3.6, flip: true },
        { x: 310, y: 290, rot: -30, size: 34, w: 7, tail: 3.2, hook: 0.4 },
      ],
    },
    {
      far: true,
      lobes: [
        { x: 1440, y: 90, r: 160 },
        { x: 1620, y: 260, r: 150 },
        { x: 1280, y: -30, r: 150 },
      ],
      shadow: [0, 30],
      spirals: [
        { x: 1450, y: 120, rot: 20, size: 44, w: 8, tail: 3.6 },
        { x: 1610, y: 290, rot: 210, size: 34, w: 7, tail: 3.2, flip: true, hook: 0.4 },
      ],
    },
  ],
  near: [
    {
      lobes: [
        { x: 60, y: 140, r: 260 },
        { x: 260, y: -20, r: 190 },
        { x: -60, y: 430, r: 200 },
      ],
      shadow: [16, 40],
      spirals: [
        { x: 80, y: 200, rot: 60, size: 60, w: 9, turns: 1.6, tail: 3.2 },
        ...edgeSwirls([[20, 600], [140, 470], [260, 320], [380, 180]], { size: 38, w: 8, flip: true, hook: 0.4 }),
      ],
    },
    {
      lobes: [
        { x: 1860, y: 140, r: 260 },
        { x: 1660, y: -20, r: 190 },
        { x: 1980, y: 430, r: 200 },
      ],
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
      lobes: [
        { x: 700, y: 560, r: 90 },
        { x: 560, y: 590, r: 80 },
        { x: 1500, y: 560, r: 100 },
        { x: 1660, y: 590, r: 90 },
        { x: 1300, y: 610, r: 70 },
        { x: 860, y: 610, r: 60 },
      ],
      shadow: [0, 18],
      spirals: [
        { x: 690, y: 545, rot: 170, size: 26, w: 6, tail: 3.6, flip: true },
        { x: 1500, y: 545, rot: 10, size: 28, w: 6, tail: 3.6 },
        { x: 1660, y: 585, rot: 200, size: 22, w: 6, tail: 3, flip: true, hook: 0.4 },
      ],
    },
    {
      far: true,
      lobes: [
        { x: 520, y: 40, r: 140 },
        { x: 1420, y: 30, r: 140 },
      ],
      shadow: [0, 26],
      spirals: [
        { x: 520, y: 80, rot: 160, size: 36, w: 7, tail: 3.6, flip: true },
        { x: 1420, y: 70, rot: 20, size: 36, w: 7, tail: 3.6 },
      ],
    },
  ],
  near: [
    {
      lobes: [
        { x: 60, y: 120, r: 240 },
        { x: 290, y: -20, r: 180 },
        { x: -80, y: 380, r: 160 },
      ],
      shadow: [16, 36],
      spirals: [
        { x: 80, y: 170, rot: 70, size: 56, w: 8, turns: 1.6, tail: 3.2 },
        ...edgeSwirls([[20, 520], [140, 400], [260, 270], [380, 140]], { size: 34, w: 7, flip: true, hook: 0.4 }),
      ],
    },
    {
      lobes: [
        { x: 1700, y: 90, r: 240 },
        { x: 1940, y: 260, r: 220 },
        { x: 1480, y: -40, r: 170 },
      ],
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
