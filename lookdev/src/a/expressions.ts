export type ExpressionName =
  | "neutral"
  | "smile"
  | "sad"
  | "surprised"
  | "angry"
  | "thinking";

export const EXPRESSION_NAMES: ExpressionName[] = [
  "neutral",
  "smile",
  "sad",
  "surprised",
  "angry",
  "thinking",
];

/**
 * All values are unitless and signed.
 * browAngle: + lowers the inner brow end (frown), - raises it (sorrow).
 * browRaise: + lifts the whole brow.
 * eyeOpen: 1 = default aperture, 0 = closed.
 * mouthCurve: + corners up.
 * mouthOpen: 0..1 jaw drop.
 * asym: 0..1, how much the right side differs (used by thinking).
 * gaze: -1..1 horizontal pupil shift.
 */
export type Expression = {
  browAngle: number;
  browRaise: number;
  eyeOpen: number;
  mouthCurve: number;
  mouthOpen: number;
  asym: number;
  gaze: number;
};

export const EXPRESSIONS: Record<ExpressionName, Expression> = {
  neutral: { browAngle: 0.15, browRaise: 0, eyeOpen: 1, mouthCurve: 0, mouthOpen: 0, asym: 0, gaze: 0 },
  smile: { browAngle: -0.1, browRaise: 0.3, eyeOpen: 0.6, mouthCurve: 1, mouthOpen: 0.1, asym: 0, gaze: 0 },
  sad: { browAngle: -0.9, browRaise: 0.4, eyeOpen: 0.7, mouthCurve: -1, mouthOpen: 0, asym: 0, gaze: 0 },
  surprised: { browAngle: -0.2, browRaise: 1, eyeOpen: 1.5, mouthCurve: 0, mouthOpen: 0.8, asym: 0, gaze: 0 },
  angry: { browAngle: 1, browRaise: -0.4, eyeOpen: 0.8, mouthCurve: -0.7, mouthOpen: 0.05, asym: 0, gaze: 0 },
  thinking: { browAngle: 0.2, browRaise: 0.6, eyeOpen: 0.9, mouthCurve: -0.2, mouthOpen: 0, asym: 1, gaze: 0.8 },
};
