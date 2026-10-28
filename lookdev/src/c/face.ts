export const EXPRESSIONS = [
  'neutral',
  'smile',
  'grin',
  'sad',
  'surprised',
  'angry',
  'thinking',
  'fear',
  'determined',
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export const VISEMES = ['MBP', 'AI', 'E', 'O', 'FV'] as const;
export type Viseme = (typeof VISEMES)[number];

export type FaceRig = {
  browLift: number;
  browTilt: number;
  browAsym: number;
  lidOpen: number;
  lidLower: number;
  pupil: number;
  gazeX: number;
  gazeY: number;
  mouthCurve: number;
  mouthWidth: number;
  mouthOpen: number;
  mouthRound: number;
  mouthSkew: number;
  teeth: number;
  blush: number;
};

const BASE: FaceRig = {
  browLift: 0,
  browTilt: 0,
  browAsym: 0,
  lidOpen: 1,
  lidLower: 0,
  pupil: 1,
  gazeX: 0,
  gazeY: 0,
  mouthCurve: 0,
  mouthWidth: 1,
  mouthOpen: 0,
  mouthRound: 0,
  mouthSkew: 0,
  teeth: 0,
  blush: 0.5,
};

export const EXPRESSION_RIGS: Record<Expression, FaceRig> = {
  neutral: BASE,
  smile: {...BASE, browLift: 0.25, browTilt: 0.15, lidLower: 0.45, mouthCurve: 0.85, mouthWidth: 1.2, blush: 0.85},
  grin: {...BASE, browLift: 0.45, lidOpen: 0.85, lidLower: 0.8, mouthCurve: 1, mouthWidth: 2, mouthOpen: 0.7, teeth: 1, blush: 1},
  sad: {...BASE, browLift: 0.1, browTilt: 1, lidOpen: 0.6, gazeY: 0.5, mouthCurve: -0.85, mouthWidth: 0.9, blush: 0.65},
  surprised: {...BASE, browLift: 1, browTilt: 0.15, lidOpen: 1.45, pupil: 0.8, mouthOpen: 0.85, mouthRound: 1, mouthWidth: 0.85, blush: 0.35},
  angry: {...BASE, browLift: -0.6, browTilt: -1, lidOpen: 0.62, lidLower: 0.3, gazeY: -0.1, mouthCurve: -0.6, mouthWidth: 1.45, mouthOpen: 0.42, teeth: 1, blush: 0.2},
  thinking: {...BASE, browAsym: 1, browTilt: 0.2, lidOpen: 0.8, gazeX: 0.75, gazeY: -0.75, mouthCurve: -0.2, mouthSkew: 1, mouthWidth: 0.85, blush: 0.4},
  fear: {...BASE, browLift: 0.85, browTilt: 1, lidOpen: 1.4, pupil: 0.55, gazeX: -0.3, mouthCurve: -0.6, mouthOpen: 0.45, mouthWidth: 1.15, teeth: 0.6, blush: 0.1},
  determined: {...BASE, browLift: -0.3, browTilt: -0.4, lidOpen: 0.78, lidLower: 0.35, gazeX: 0.25, mouthCurve: -0.3, mouthWidth: 0.85, mouthSkew: 0.35, blush: 0.3},
};

type VisemeShape = {open: number; width: number; round: number; teeth: number};

const VISEME_SHAPES: Record<Viseme, VisemeShape> = {
  MBP: {open: 0, width: 0.9, round: 0, teeth: 0},
  AI: {open: 0.85, width: 1.15, round: 0.15, teeth: 0.3},
  E: {open: 0.35, width: 1.4, round: 0, teeth: 1},
  O: {open: 0.75, width: 0.75, round: 1, teeth: 0},
  FV: {open: 0.18, width: 1.05, round: 0, teeth: 1},
};

export type Speech = {viseme: Viseme; amount: number};

export const mixRig = (a: FaceRig, b: FaceRig, t: number): FaceRig => {
  const out = {...a};
  for (const k of Object.keys(a) as (keyof FaceRig)[]) {
    out[k] = a[k] + (b[k] - a[k]) * t;
  }
  return out;
};

export const applySpeech = (rig: FaceRig, speech: Speech | undefined): FaceRig => {
  if (!speech || speech.amount <= 0) return rig;
  const s = VISEME_SHAPES[speech.viseme];
  const t = Math.min(1, speech.amount);
  return {
    ...rig,
    mouthOpen: rig.mouthOpen + (s.open - rig.mouthOpen) * t,
    mouthWidth: rig.mouthWidth + (rig.mouthWidth * s.width - rig.mouthWidth) * t,
    mouthRound: rig.mouthRound + (s.round - rig.mouthRound) * t,
    mouthCurve: rig.mouthCurve * (1 - 0.5 * t * s.round),
    teeth: rig.teeth + (s.teeth - rig.teeth) * t,
  };
};

export type FaceInput = {
  expression?: Expression;
  rig?: FaceRig;
  speech?: Speech;
  blink?: number;
  turn?: number;
};

export const resolveRig = ({expression = 'neutral', rig, speech, blink = 0}: FaceInput): FaceRig => {
  const r = applySpeech(rig ?? EXPRESSION_RIGS[expression], speech);
  return {...r, lidOpen: r.lidOpen * (1 - Math.min(1, Math.max(0, blink)))};
};

export type Pt = readonly [number, number];

export type MouthGeom = {
  outline: string;
  upperLine: string;
  lowerY: number;
  open: number;
  left: Pt;
  right: Pt;
  midY: number;
};

export const mouthGeom = (rig: FaceRig, halfWidth: number, openDepth: number, curveDepth: number): MouthGeom => {
  const hw = halfWidth * rig.mouthWidth * (1 - 0.45 * rig.mouthRound);
  const open = Math.max(0, rig.mouthOpen);
  const skew = rig.mouthSkew;
  const cy = curveDepth * rig.mouthCurve;
  const left: Pt = [-hw + skew * hw * 0.35, -cy + skew * curveDepth * 0.6];
  const right: Pt = [hw + skew * hw * 0.35, -cy - skew * curveDepth * 0.6];
  const midX = skew * hw * 0.35;
  const depth = open * openDepth;
  const upY = -depth * (0.18 + 0.3 * rig.mouthRound) + Math.max(0, cy) * 0.15;
  const loY = depth + Math.max(0, cy) * 0.25 - Math.min(0, cy) * 0.1;
  const bulge = 0.55 + 0.45 * rig.mouthRound;
  const upperLine = `M${left[0]},${left[1]} C${midX - hw * bulge},${upY} ${midX + hw * bulge},${upY} ${right[0]},${right[1]}`;
  const outline = `${upperLine} C${midX + hw * bulge * 1.05},${loY} ${midX - hw * bulge * 1.05},${loY} ${left[0]},${left[1]} Z`;
  return {outline, upperLine, lowerY: loY * 0.75, open, left, right, midY: 0.25 * (left[1] + right[1]) / 2 + 0.75 * upY};
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
