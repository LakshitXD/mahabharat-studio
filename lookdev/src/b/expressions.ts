import { Pt } from './geom';

export const EXPRESSIONS = ['neutral', 'smile', 'sad', 'surprised', 'angry', 'thinking'] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** The dark king: expression lives in brows, lit eye slits, mouth and mustache. */
export type KingFace = {
  /** brow inner end offset (px, + = down) and outer end offset */
  browIn: number;
  browOut: number;
  /** eye slit half-height in px */
  eyeOpen: number;
  /** lower-lid lift (squint), px */
  squint: number;
  pupil: Pt;
  /** mouth corner lift (px, + = smile) */
  mouthCurve: number;
  /** 0 closed .. 1 wide open */
  mouthOpen: number;
  /** mustache curl lift, px */
  mustache: number;
};

export const KING: Record<Expression, KingFace> = {
  neutral: { browIn: 8, browOut: -6, eyeOpen: 4.5, squint: 0, pupil: [0, 0], mouthCurve: 0, mouthOpen: 0, mustache: 0 },
  smile: { browIn: -2, browOut: -2, eyeOpen: 4, squint: 2.5, pupil: [0, 0], mouthCurve: 9, mouthOpen: 0.15, mustache: -7 },
  sad: { browIn: -12, browOut: 8, eyeOpen: 4.5, squint: 0, pupil: [0, 4], mouthCurve: -8, mouthOpen: 0, mustache: 5 },
  surprised: { browIn: -18, browOut: -16, eyeOpen: 9, squint: -2, pupil: [0, 0], mouthCurve: 0, mouthOpen: 0.85, mustache: -3 },
  angry: { browIn: 18, browOut: -14, eyeOpen: 4.5, squint: 3, pupil: [0, 1], mouthCurve: -6, mouthOpen: 0.35, mustache: 3 },
  thinking: { browIn: 4, browOut: -10, eyeOpen: 4, squint: 2, pupil: [9, -4], mouthCurve: -3, mouthOpen: 0, mustache: 2 },
};

/** The pale-faced goddess, f2 idiom: big eyes, high brows, tiny mouth, blush. */
export type QueenFace = {
  /** brow lift (px, + = up) and inner-end tilt (+ = inner end raised: worry) */
  browLift: number;
  browTilt: number;
  /** 0..1 eye opening (1 = wide, as f2) */
  eyeOpen: number;
  /** lower-lid lift, 0..1 (smile squint) */
  squint: number;
  pupil: Pt;
  mouthCurve: number;
  mouthOpen: number;
  blush: number;
  /** extra lift of the viewer-right brow (quizzical) */
  browAsym?: number;
};

export const QUEEN: Record<Expression, QueenFace> = {
  neutral: { browLift: 0, browTilt: 0, eyeOpen: 0.8, squint: 0, pupil: [0, 0], mouthCurve: 0, mouthOpen: 0, blush: 0.55 },
  smile: { browLift: 4, browTilt: 4, eyeOpen: 0.6, squint: 0.85, pupil: [0, 0], mouthCurve: 10, mouthOpen: 0.25, blush: 1 },
  sad: { browLift: 6, browTilt: 22, eyeOpen: 0.62, squint: 0.15, pupil: [0, 7], mouthCurve: -9, mouthOpen: 0, blush: 0.45 },
  surprised: { browLift: 22, browTilt: 2, eyeOpen: 1.12, squint: 0, pupil: [0, 0], mouthCurve: 0, mouthOpen: 0.9, blush: 0.35 },
  angry: { browLift: -12, browTilt: -22, eyeOpen: 0.55, squint: 0.45, pupil: [0, 0], mouthCurve: -7, mouthOpen: 0.12, blush: 0.75 },
  thinking: { browLift: 2, browTilt: -6, eyeOpen: 0.7, squint: 0.2, pupil: [10, -9], mouthCurve: -4, mouthOpen: 0, blush: 0.5, browAsym: 14 },
};
