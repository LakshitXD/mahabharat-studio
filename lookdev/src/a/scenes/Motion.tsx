import React from "react";
import { useCurrentFrame } from "remotion";
import { GangaCloseShot } from "./GangaClose";
import { EXPRESSIONS } from "../expressions";

/** 0 open .. 1 shut, a 7-frame blink starting at `at`. */
const blinkAt = (frame: number, at: number) => {
  const t = frame - at;
  if (t < 0 || t > 6) return 0;
  return t <= 2 ? t / 2 : 1 - (t - 2) / 4;
};

/** Mouth 0..1 from a short syllable score. */
const SYLLABLES: [number, number][] = [[12, 0.5], [18, 0.9], [25, 0.3], [31, 0.7], [38, 0.4], [50, 0.8], [57, 0.5], [63, 0.9], [70, 0.2]];
const mouthAt = (frame: number) => {
  let m = 0;
  for (const [f, amp] of SYLLABLES) {
    const d = Math.abs(frame - f);
    if (d < 4) m = Math.max(m, amp * (1 - d / 4));
  }
  return m;
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.max(blinkAt(frame, 20), blinkAt(frame, 66));
  const expression = frame < 45 ? EXPRESSIONS.neutral : EXPRESSIONS.smile;
  return <GangaCloseShot frame={frame} expression={expression} mouth={mouthAt(frame)} blink={blink} />;
};
