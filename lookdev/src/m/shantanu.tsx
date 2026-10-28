// King Shantanu. Head: variant A's row-by-row measurement of the owner-pick king (crown, hair column,
// beard, slit eyes, wedge brows, mustache curls), with the features driven by variant C's FaceRig.
// Body: new full figure in the same idiom. Figure units: crown peak at (0,0), soles at y=2750.
import React from "react";
import type { ActorProps } from "../shared/contract";
import { FaceRig, mouthGeom, rigFor } from "./face";
import { Figure } from "./figure";
import { clamp, mirrorSmooth, Pt, rad, spiralPath } from "./geom";
import { INK } from "./palette";
import { ArmSpec, BodyState, bodyState, Hand, PoseTable } from "./rig";

export const KING_UNITS = 2750;
export const KING_PX = 1000;
const HIP = 1300;
export const KING_HALF_STEP = 170;
const STRIDE = KING_HALF_STEP;
/** Chest-up framing (variant "close"): the owner-pick king grips a shaft across his body. */
const GRIP: ArmSpec = { fwd: -34, bend: 112, wrist: 14, hand: "fist" };
const SHOULDER: Pt = [292, 560];
const UPPER = 480;
const FORE = 420;

export const KING_POSES: PoseTable = {
  stand: { lean: 0, turn: 0.15, tilt: 0, nod: 0, lead: { fwd: 5, bend: 8, hand: "rest" }, trail: { fwd: -3, bend: 10, hand: "rest" } },
  walk: { lean: 4, turn: 0.35, tilt: 0, nod: 0, lead: { fwd: 0, bend: 20, hand: "rest" }, trail: { fwd: 0, bend: 20, hand: "rest" } },
  talk: { lean: 1, turn: 0.4, tilt: -1, nod: 2, lead: { fwd: 28, bend: 78, wrist: -15, hand: "open" }, trail: { fwd: -2, bend: 12, hand: "rest" } },
  point: { lean: 4, turn: 0.6, tilt: -2, nod: 0, lead: { fwd: 96, bend: -4, wrist: 0, hand: "point" }, trail: { fwd: -8, bend: 10, hand: "rest" } },
  offer: { lean: 5, turn: 0.6, tilt: 2, nod: 3, lead: { fwd: 52, bend: 36, wrist: 24, hand: "palmUp" }, trail: { fwd: -12, bend: 22, hand: "rest" } },
  bow: { lean: 26, turn: 0.3, tilt: 0, nod: 16, lead: { fwd: -6, bend: 12, hand: "rest" }, trail: { fwd: -14, bend: 118, wrist: -10, hand: "open" } },
  think: { lean: -2, turn: 0.3, tilt: 4, nod: 5, lead: { fwd: -6, bend: 72, hand: "rest" }, trail: { fwd: 16, bend: 136, wrist: 12, hand: "chin" } },
};

// Head (variant A geometry, rows measured off dragonbee-f1 at 4x).

const Brow: React.FC<{ side: 1 | -1; r: FaceRig }> = ({ side, r }) => {
  const asym = side === 1 ? r.browAsym : 0;
  const raise = r.browLift * 20 + asym * 14;
  const angle = -r.browTilt * 20 - asym * 14;
  const frown = Math.max(0, -r.browTilt);
  const ix = 16 * side;
  const iy = 178 - raise + angle;
  const mx = 50 * side;
  const my = 166 - raise + angle * 0.3;
  const ox = 94 * side;
  const oy = 164 - raise - frown * 4;
  const tIn = 5 + frown * 3;
  const tOut = 2.4;
  return <path d={`M${ix},${iy} Q${mx},${my} ${ox},${oy} L${ox},${oy + tOut} Q${mx},${my + tOut + 1.5} ${ix},${iy + tIn} Z`} fill={INK.cream} stroke="none" />;
};

const Eye: React.FC<{ side: 1 | -1; r: FaceRig }> = ({ side, r }) => {
  const open = Math.max(0, r.lidOpen * (1 - 0.3 * r.lidLower));
  const ix = 24 * side;
  const ox = 84 * side;
  const iy = 198;
  const oy = 189 - Math.max(0, r.browLift) * 2;
  const h = Math.max(0.5, 4.6 * open);
  const mx = (ix + ox) / 2;
  const my = (iy + oy) / 2;
  const lower = h * 0.9 * (1 - 0.6 * r.lidLower);
  const slit = `M${ix},${iy} Q${mx + 2 * side},${my - h * 1.6} ${ox},${oy} Q${mx},${my + lower} ${ix},${iy} Z`;
  const pr = Math.min(2.9, h * 0.65) * (0.6 + 0.4 * r.pupil);
  return (
    <g>
      <path d={slit} fill={INK.eyeLit} stroke="none" />
      {open > 0.45 && <circle cx={mx + r.gazeX * 10} cy={my - 0.5 + r.gazeY * 1.5} r={pr} fill={INK.pupil} stroke="none" />}
      <path d={`M${ix - 2 * side},${iy - 2} Q${mx + 2 * side},${my - h * 1.6 - 5} ${ox + 4 * side},${oy - 3}`} fill="none" opacity={0.8} />
    </g>
  );
};

const Mustache: React.FC<{ side: 1 | -1; r: FaceRig }> = ({ side, r }) => {
  const lift = r.mouthCurve * 10 + r.mouthSkew * side * 5 + Math.max(0, r.mouthOpen) * 7;
  const a0 = -2.1;
  const rad0 = 15;
  const endX = 80;
  const endY = 324 - lift;
  const cx = endX - Math.cos(a0) * rad0;
  const cy = endY - Math.sin(a0) * rad0;
  return (
    <g transform={side === -1 ? "scale(-1,1)" : undefined} fill="none">
      <path d={`M8,284 C34,286 62,${300 - lift * 0.4} ${endX},${endY}`} />
      <path d={spiralPath(cx, cy, rad0, 1.3, a0, -1)} />
    </g>
  );
};

/**
 * Closed, the mouth is one hairline hidden under the mustache, as in the reference. Open, it becomes a
 * lit cream shape around a dark cavity (the same device as the eye slits) so speech reads at phone size.
 */
const Mouth: React.FC<{ r: FaceRig; id: string }> = ({ r, id }) => {
  const m = mouthGeom(r, 28, 40, 8);
  const open = m.open;
  if (open <= 0.04) {
    return (
      <g transform="translate(0 314)">
        <path d={m.upperLine} fill="none" opacity={0.8} />
        <path d="M0,22 L0,90" opacity={0.92} />
      </g>
    );
  }
  const hw = 28 * r.mouthWidth * (1 - 0.45 * r.mouthRound);
  const depth = open * 40;
  const midX = r.mouthSkew * hw * 0.35;
  const cy = depth * 0.46;
  const rx = hw * 0.62;
  const ry = Math.max(2.5, depth * 0.36);
  return (
    <g transform={`translate(0 ${314 + open * 10})`}>
      <clipPath id={id}>
        <ellipse cx={midX} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <path d={m.outline} fill={INK.eyeLit} stroke="none" opacity={0.95} />
      <ellipse cx={midX} cy={cy} rx={rx} ry={ry} fill={INK.silhouette} stroke="none" />
      {r.teeth > 0.05 && <rect clipPath={`url(#${id})`} x={midX - rx} y={cy - ry} width={rx * 2} height={r.teeth * ry * 0.8} fill={INK.cream} stroke="none" />}
      <path d={m.outline} fill="none" opacity={0.9} />
      <path d={`M${-open * 14},${depth + 18} L${-open * 5},90 M${open * 14},${depth + 18} L${open * 5},90`} opacity={0.92} />
    </g>
  );
};

export const KingHead: React.FC<{ rig: FaceRig; turn: number; tilt: number; nod: number; id: string }> = ({ rig, turn, tilt, nod, id }) => {
  const fx = turn * 30;
  const sx = 1 - Math.abs(turn) * 0.14;
  return (
    <g transform={`rotate(${tilt} 0 380) translate(${turn * 8} ${nod * 1.2})`}>
      <path
        d="M-100,112 C-104,200 -104,280 -134,330 C-146,350 -152,364 -156,384 L156,384 C152,364 146,350 134,330 C104,280 104,200 100,112 L104,112 L132,46 C96,48 62,40 44,12 Q14,-28 0,-38 Q-14,-28 -44,12 C-62,40 -96,48 -132,46 L-104,112 Z"
        fill={INK.silhouette}
        stroke="none"
      />
      <g fill="none" stroke={INK.cream} opacity={0.92}>
        <path d="M-100,106 L-125,50 C-93,52 -60,44 -42,16 Q-12,-22 0,-30 Q12,-22 42,16 C60,44 93,52 125,50 L100,106" />
        <path d="M-88,100 C-80,76 -52,62 -34,36 Q-8,4 0,-2 Q8,4 34,36 C52,62 80,76 88,100" opacity={0.7} />
        <path d="M0,74 L9,90 L0,106 L-9,90 Z" />
        <path d="M-124,114 Q-60,110 0,118 Q60,110 124,114" />
        <path d="M-118,118 L-118,150 M118,118 L118,150" opacity={0.7} />
        <path d="M-118,150 l-5,10 l5,10 l5,-10 z M118,150 l-5,10 l5,10 l5,-10 z" opacity={0.7} />
        <path d="M-96,118 C-100,200 -100,280 -130,330 C-142,350 -148,364 -152,380" />
        <path d="M96,118 C100,200 100,280 130,330 C142,350 148,364 152,380" />
        <path d="M-108,250 C-114,300 -126,340 -134,378 M108,250 C114,300 126,340 134,378" opacity={0.5} />
        <path d="M-92,300 C-88,340 -50,380 0,404 C50,380 88,340 92,300" />
                <path d="M-44,336 C-36,360 -16,380 -6,396 M44,336 C36,360 16,380 6,396" opacity={0.5} />
        <g transform={`translate(${fx} ${nod * 1.4}) scale(${sx},1)`}>
          <path d="M-84,124 C-90,170 -92,220 -86,260 C-82,280 -76,292 -70,300" opacity={0.75} />
          <path d="M84,124 C90,170 92,220 86,260 C82,280 76,292 70,300" opacity={0.75} />
          <path d="M0,176 L0,260" />
          <path d="M-18,258 Q-8,274 0,268 Q8,274 18,258" />
          {rig.browTilt < -0.6 && <path d="M-5,172 L-3,190 M5,172 L3,190" opacity={0.7} />}
          <Mouth r={rig} id={id} />
          <Mustache side={-1} r={rig} />
          <Mustache side={1} r={rig} />
          <Brow side={-1} r={rig} />
          <Brow side={1} r={rig} />
          <Eye side={-1} r={rig} />
          <Eye side={1} r={rig} />
        </g>
      </g>
    </g>
  );
};

// Body.

const UPPER_BODY = mirrorSmooth([
  [0, 372], [152, 378], [250, 398], [340, 446], [396, 500], [422, 580], [414, 700], [382, 880], [334, 1060], [298, 1250], [300, HIP + 30], [0, HIP + 30],
]);

const skirtPath = (sway: number, leadLift: number, trailLift: number) => {
  const sx = (y: number) => (sway * 90 * (y - HIP)) / (2672 - HIP);
  const right: Pt[] = [
    [0, HIP - 60], [300, HIP - 60], [294, 1400], [302 + sx(1700), 1700], [324 + sx(2100), 2100], [340 + sx(2450), 2450], [348 + sx(2640), 2640 - leadLift],
    [0, 2676 - (leadLift + trailLift) * 0.3],
  ];
  const left: Pt[] = [
    [-348 + sx(2640), 2640 - trailLift], [-340 + sx(2450), 2450], [-324 + sx(2100), 2100], [-302 + sx(1700), 1700], [-294, 1400], [-300, HIP - 60],
  ];
  return mirrorSmoothAsym(right, left);
};

/** Closed smooth shape from a right half and an explicit left half (the hem is asymmetric mid-stride). */
const mirrorSmoothAsym = (right: readonly Pt[], left: readonly Pt[]) => {
  const pts = [...right, ...left];
  let d = "";
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n];
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    if (i === 0) d += `M${p1[0]} ${p1[1]}`;
    d += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d + "Z";
};

const Foot: React.FC<{ x: number; lift: number }> = ({ x, lift }) => (
  <path transform={`translate(${x} ${2706 - lift})`} d="M-72,-40 C-84,-10 -74,40 0,46 C74,40 84,-10 72,-40 Z" fill={INK.silhouette} stroke="none" />
);

export const KingHand: React.FC<{ hand: Hand; side: 1 | -1 }> = ({ hand, side }) => {
  switch (hand) {
    case "fist":
      return (
        <g>
          <path d="M-48,0 C-60,40 -58,96 -42,128 Q0,146 42,128 C58,96 60,40 48,0 Z" fill={INK.silhouette} stroke="none" />
          <path d="M-36,60 Q0,70 36,60 M-32,92 Q0,100 32,92" fill="none" opacity={0.8} />
          <path d={`M${-44 * side},24 Q${-66 * side},50 ${-54 * side},86`} fill="none" opacity={0.8} />
        </g>
      );
    case "point":
      return (
        <g>
          <path d="M-48,0 C-60,40 -58,96 -42,126 Q0,142 42,126 C58,96 60,40 48,0 Z" fill={INK.silhouette} stroke="none" />
          <path d="M-14,100 L-12,228 Q0,240 12,228 L14,100 Z" fill={INK.silhouette} stroke="none" />
          <path d="M-36,62 Q0,72 36,62 M-30,96 Q-8,104 -14,118" fill="none" opacity={0.8} />
          <path d="M-12,120 L-11,224 M12,120 L11,224" fill="none" opacity={0.6} />
          <path d={`M${-44 * side},26 Q${-66 * side},52 ${-54 * side},88`} fill="none" opacity={0.8} />
        </g>
      );
    case "open":
    case "palmUp":
      return (
        <g>
          <path d="M-46,0 C-64,30 -92,62 -86,100 C-80,120 -62,116 -52,98 C-56,140 -44,178 -24,198 Q0,206 24,198 C44,178 54,140 52,98 C56,50 52,20 46,0 Z" fill={INK.silhouette} stroke="none" />
          <path d="M-18,118 L-16,190 M3,122 L3,196 M22,116 L20,186" fill="none" opacity={0.65} />
          <path d="M-50,96 Q-20,86 20,92" fill="none" opacity={0.7} />
        </g>
      );
    case "chin":
      return (
        <g>
          <path d="M-48,0 C-62,40 -60,100 -40,134 Q0,150 40,134 C60,100 62,40 48,0 Z" fill={INK.silhouette} stroke="none" />
          <path d="M-30,70 Q0,82 30,70 M-26,104 Q0,114 26,104" fill="none" opacity={0.8} />
          <path d="M14,0 C34,-30 48,-70 40,-110 Q30,-124 18,-110 C14,-70 6,-30 -4,0" fill={INK.silhouette} stroke="none" />
          <path d="M18,-100 C22,-60 14,-30 6,-4" fill="none" opacity={0.6} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M-46,0 C-62,50 -58,112 -40,160 Q0,176 40,160 C58,112 62,50 46,0 Z" fill={INK.silhouette} stroke="none" />
          <path d="M-14,70 L-12,150 M12,70 L10,150" fill="none" opacity={0.6} />
          <path d={`M${-42 * side},30 Q${-62 * side},60 ${-50 * side},100`} fill="none" opacity={0.7} />
        </g>
      );
  }
};

const KingArm: React.FC<{ side: 1 | -1; arm: ArmSpec }> = ({ side, arm }) => {
  const raised = clamp(Math.sin(rad(arm.fwd + arm.bend)), 0, 1);
  const drape = 170 * raised;
  const wrist = arm.wrist ?? 0;
  return (
    <g transform={`translate(${side * SHOULDER[0]} ${SHOULDER[1]}) rotate(${-arm.fwd})`}>
      <path d={`M-74,-30 C-100,120 -94,320 -70,${UPPER} L70,${UPPER} C94,320 100,120 74,-30 Q0,-62 -74,-30 Z`} fill={INK.silhouette} stroke="none" />
      <path d={`M${-54 * side},40 C${-66 * side},180 ${-62 * side},330 ${-48 * side},${UPPER - 20}`} fill="none" opacity={0.55} />
      <g transform={`translate(0 ${UPPER}) rotate(${-arm.bend})`}>
        <path d={`M-56,-30 C${-68 - drape * 0.5},140 ${-104 - drape},330 ${-110 - drape * 0.4},${FORE} L-50,${FORE} Z`} fill={INK.silhouette} stroke="none" />
        <path d={`M-62,-30 C-68,140 -84,300 -110,${FORE} L110,${FORE} C84,300 68,140 62,-30 Z`} fill={INK.silhouette} stroke="none" />
        <path d={`M-100,${FORE - 44} Q0,${FORE - 24} 100,${FORE - 44} M-106,${FORE - 16} Q0,${FORE + 4} 106,${FORE - 16}`} fill="none" opacity={0.85} />
        <path d={`M-58,20 C${-70 - drape * 0.4},160 ${-96 - drape * 0.9},320 ${-104 - drape * 0.4},${FORE - 60}`} fill="none" opacity={0.5 * (0.4 + raised)} />
        <g transform={`translate(0 ${FORE}) rotate(${-wrist})`}>
          <KingHand hand={arm.hand} side={side} />
        </g>
      </g>
    </g>
  );
};

const Torso: React.FC<{ b: BodyState }> = ({ b }) => {
  const tx = b.turn * 40;
  const leadLift = (Math.max(0, b.leadFoot.x) / STRIDE) * 30;
  const trailLift = (Math.max(0, b.trailFoot.x) / STRIDE) * 30;
  const seamEnd = (b.leadFoot.x + b.trailFoot.x) * 0.5 + b.hemSway * 60;
  return (
    <g>
      <Foot x={-110 + b.trailFoot.x} lift={b.trailFoot.lift} />
      <Foot x={110 + b.leadFoot.x} lift={b.leadFoot.lift} />
      <path d={skirtPath(b.hemSway, leadLift, trailLift)} fill={INK.silhouette} stroke="none" />
      <g fill="none" stroke={INK.cream} opacity={0.92}>
        <path d={`M${tx * 0.5},${HIP - 40} C${tx * 0.4},1700 ${seamEnd * 0.6},2200 ${seamEnd},2660`} />
        <path d={`M-182,${HIP - 30} C-188,1600 -200,2100 ${-216 + b.hemSway * 60},2650`} opacity={0.55} />
        <path d={`M182,${HIP - 30} C188,1600 200,2100 ${216 + b.hemSway * 60},2650`} opacity={0.55} />
        <path d={`M${-340 + b.hemSway * 80},${2628 - trailLift} Q${b.hemSway * 70},${2600 - (leadLift + trailLift) * 0.3} ${340 + b.hemSway * 80},${2628 - leadLift}`} opacity={0.75} />
        <path d={`M${-330 + b.hemSway * 76},${2594 - trailLift} Q${b.hemSway * 66},${2566 - (leadLift + trailLift) * 0.3} ${330 + b.hemSway * 76},${2594 - leadLift}`} opacity={0.45} />
      </g>
      <g transform={`rotate(${b.lean} 0 ${HIP})`}>
        <path d={UPPER_BODY} fill={INK.silhouette} stroke="none" />
        <g fill="none" stroke={INK.cream} opacity={0.92}>
          <path d="M-150,392 C-250,410 -344,452 -392,512" opacity={0.8} />
          <path d="M150,392 C250,410 344,452 392,512" opacity={0.8} />
          <g transform={`translate(${tx} 0)`}>
            <path d="M-150,392 C-110,500 -50,590 0,640 C50,590 110,500 150,392" />
            <path d="M-112,400 C-84,488 -38,556 0,596 C38,556 84,488 112,400" opacity={0.6} />
            <path d="M0,640 C60,700 150,760 230,840" opacity={0.9} />
            <path d="M0,640 C-60,700 -150,760 -230,840" opacity={0.9} />
            <path d={`M0,404 L0,${HIP - 40}`} />
          </g>
          <path d={`M-384,520 C-350,660 -318,920 -300,${HIP - 60}`} opacity={0.8} />
          <path d={`M384,520 C350,660 318,920 300,${HIP - 60}`} opacity={0.8} />
          <path d={`M-300,${HIP - 70} Q${tx * 0.3},${HIP - 110} 300,${HIP - 70}`} opacity={0.85} />
          <path d={`M-296,${HIP - 38} Q${tx * 0.3},${HIP - 78} 296,${HIP - 38}`} opacity={0.6} />
        </g>
      </g>
    </g>
  );
};

const stateFor = (p: ActorProps) => {
  const b = bodyState(p, KING_POSES, STRIDE);
  return p.variant === "close" && p.pose === "stand" ? { ...b, trail: GRIP } : b;
};

export const Shantanu: React.FC<ActorProps> = (p) => {
  const rig = rigFor(p);
  const b = stateFor(p);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <Figure unitsTall={KING_UNITS} pxTall={KING_PX} variant={p.variant}>
      <g transform={`translate(0 ${b.bob})`} stroke={INK.cream}>
        <Torso b={b} />
        <g transform={`rotate(${b.lean} 0 ${HIP})`}>
          <KingArm side={1} arm={b.lead} />
          <KingArm side={-1} arm={b.trail} />
          <KingHead rig={rig} turn={b.turn} tilt={b.tilt} nod={b.nod} id={`km${id}`} />
        </g>
      </g>
    </Figure>
  );
};

/** Wrist of one hand in figure units (crown peak at 0,0; soles at KING_UNITS), for props such as the arrow. */
export const kingHand = (p: ActorProps, side: "lead" | "trail") => {
  const b = stateFor(p);
  const arm = b[side];
  const sx = side === "lead" ? 1 : -1;
  const a1 = rad(arm.fwd);
  const a2 = a1 + rad(arm.bend);
  const ex = sx * SHOULDER[0] + Math.sin(a1) * UPPER;
  const ey = SHOULDER[1] + Math.cos(a1) * UPPER;
  const wx = ex + Math.sin(a2) * FORE;
  const wy = ey + Math.cos(a2) * FORE;
  // undo the lean about the hips, then the bob
  const c = Math.cos(rad(b.lean)), sn = Math.sin(rad(b.lean));
  const dy = wy - HIP;
  const rotation = -(arm.fwd + arm.bend + (arm.wrist ?? 0)) + b.lean;
  const x = wx * c - dy * sn;
  const y = HIP + wx * sn + dy * c + b.bob;
  // the palm centre sits 70 units down the hand's own axis
  return { x, y, rotation, hand: arm.hand, palm: { x: x - Math.sin(rad(rotation)) * 70, y: y + Math.cos(rad(rotation)) * 70 } };
};
