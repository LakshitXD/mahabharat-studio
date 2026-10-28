import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { QUEEN } from '../expressions';
import { GangaNight } from './GangaClose';

/** Mouth shapes as (opening, roundness). */
const VISEMES = {
  rest: [0, 0],
  m: [0, 0.2],
  a: [0.85, 0],
  e: [0.45, -0.4],
  i: [0.28, -0.7],
  o: [0.6, 0.9],
  u: [0.3, 1],
} as const;
type Viseme = keyof typeof VISEMES;

/** "Shantanu, I will be your queen" as rough mouth shapes, one per 4 frames from frame 26. */
const LINE: readonly Viseme[] = ['rest', 'a', 'a', 'm', 'a', 'u', 'rest', 'a', 'i', 'i', 'm', 'i', 'e', 'o', 'u', 'rest', 'u', 'i', 'e', 'rest'];
const START = 26;
const STEP = 4;

const mouthAt = (f: number) => {
  const k = (f - START) / STEP;
  if (k < 0 || k >= LINE.length - 1) return { open: 0, round: 0 };
  const i = Math.floor(k);
  const t = k - i;
  const a = VISEMES[LINE[i]], b = VISEMES[LINE[i + 1]];
  return { open: a[0] + (b[0] - a[0]) * t, round: a[1] + (b[1] - a[1]) * t };
};

const BLINKS = [14, 70];
const blinkAt = (f: number) =>
  Math.max(0, ...BLINKS.map((b) => interpolate(f, [b - 2, b, b + 3], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));

export const Motion: React.FC<{ grain?: boolean }> = ({ grain = true }) => {
  const f = useCurrentFrame();
  const m = mouthAt(f);
  return (
    <GangaNight
      grain={grain}
      drift={f * 0.9}
      grainSeed={1 + Math.floor(f / 2)}
      ganga={{
        face: QUEEN.neutral,
        blink: blinkAt(f),
        mouth: m.open,
        round: m.round,
        ripple: (f / 90) % 1,
        tilt: Math.sin((f / 90) * Math.PI * 2) * 1.2,
      }}
    />
  );
};
