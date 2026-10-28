// Body acting shared by both characters: the pose table shape, the walk cycle, and idle motion.
import type { ActorProps, Pose } from "../shared/contract";
import { lerp } from "./geom";

export type Hand = "rest" | "open" | "palmUp" | "fist" | "point" | "chin";

/** Angles in degrees. `fwd` swings the limb toward +x (the way the actor faces); `bend` folds the forearm the same way. */
export type ArmSpec = { fwd: number; bend: number; wrist?: number; hand: Hand };

export type PoseSpec = {
  /** torso lean at the hips, degrees, + toward +x */
  lean: number;
  /** -1..1 head and chest turn toward +x */
  turn: number;
  /** head tilt, degrees, + rolls the crown toward +x */
  tilt: number;
  /** head nod, degrees, + bows */
  nod: number;
  /** arm on the +x side (leads the way the actor faces) */
  lead: ArmSpec;
  /** arm on the -x side (nearer the camera in a 3/4 stance) */
  trail: ArmSpec;
};

export type PoseTable = Record<Pose, PoseSpec>;

export type Foot = { x: number; lift: number };

/** What the body does this frame once pose, walk phase and idle motion are folded together. */
export type BodyState = PoseSpec & {
  /** vertical offset in figure units (negative lifts) */
  bob: number;
  /** each foot's offset along +x and its lift, in figure units */
  leadFoot: Foot;
  trailFoot: Foot;
  /** -1..1 swing of the hem toward +x */
  hemSway: number;
  walking: boolean;
};

const TAU = Math.PI * 2;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * One foot through a cycle: t=0 is its heel strike. Half the cycle it is planted and slides back
 * under the body (the body travels 2*half per half cycle), half it swings forward lifted.
 */
const footCycle = (t0: number, half: number, lift: number): Foot => {
  const t = ((t0 % 1) + 1) % 1;
  if (t < 0.5) return { x: half * (1 - 4 * t), lift: 0 };
  const u = smoothstep((t - 0.5) * 2);
  return { x: -half + 2 * half * u, lift: Math.sin(u * Math.PI) * lift };
};

/** Ground covered per cycle, in figure units, when the feet do not slide. */
export const travelPerCycle = (half: number) => 4 * half;

/**
 * Body state from the actor props. `half` is half a step in figure units; the lead foot strikes at
 * walkPhase 0, the trail foot at 0.5. Idle motion (breath, head drift, talk emphasis) comes from `frame`.
 */
export const bodyState = (p: ActorProps, table: PoseTable, half: number): BodyState => {
  const base = table[p.pose] ?? table.stand;
  const walking = p.pose === "walk";
  const ph = p.walkPhase;
  const breath = Math.sin(p.frame / 19);
  const drift = Math.sin(p.frame / 31 + 1);
  const talkPulse = p.pose === "talk" ? p.mouth * 7 : 0;

  if (walking) {
    const swing = -24 * Math.cos(ph * TAU);
    return {
      lean: base.lean + breath * 0.3,
      turn: base.turn,
      tilt: base.tilt + drift * 0.6,
      nod: base.nod + 2 * Math.abs(Math.sin(ph * TAU)),
      lead: { fwd: swing, bend: 16 + 12 * Math.max(0, swing / 24), hand: "rest" },
      trail: { fwd: -swing, bend: 16 + 12 * Math.max(0, -swing / 24), hand: "rest" },
      bob: (-14 * (1 - Math.cos(ph * TAU * 2))) / 2,
      leadFoot: footCycle(ph, half, 44),
      trailFoot: footCycle(ph + 0.5, half, 44),
      hemSway: Math.sin(ph * TAU),
      walking,
    };
  }
  return {
    lean: base.lean + breath * 0.4,
    turn: base.turn,
    tilt: base.tilt + drift * 0.8,
    nod: base.nod + breath * 0.6 + talkPulse * 0.25,
    lead: { ...base.lead, fwd: base.lead.fwd + talkPulse },
    trail: { ...base.trail, bend: base.trail.bend + talkPulse * 0.5 },
    bob: breath * 1.5,
    leadFoot: { x: 0, lift: 0 },
    trailFoot: { x: 0, lift: 0 },
    hemSway: 0,
    walking,
  };
};

const mixArm = (a: ArmSpec, b: ArmSpec, t: number): ArmSpec => ({
  fwd: lerp(a.fwd, b.fwd, t),
  bend: lerp(a.bend, b.bend, t),
  wrist: lerp(a.wrist ?? 0, b.wrist ?? 0, t),
  hand: t < 0.5 ? a.hand : b.hand,
});

export const blendPose = (a: PoseSpec, b: PoseSpec, t: number): PoseSpec => ({
  lean: lerp(a.lean, b.lean, t),
  turn: lerp(a.turn, b.turn, t),
  tilt: lerp(a.tilt, b.tilt, t),
  nod: lerp(a.nod, b.nod, t),
  lead: mixArm(a.lead, b.lead, t),
  trail: mixArm(a.trail, b.trail, t),
});
