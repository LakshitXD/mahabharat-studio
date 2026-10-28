// Ganga. Head and hair: variant A's construction, a long pale oval under a dark hood whose hair flows
// down past the shoulders into the body as four tapering falls drawn over the dress, so the hair is
// never a detached cap. Features: variant C's FaceRig on A's eye, nose and mouth drawings.
// Dress, veil, neckline ornament and bloom: variant B. Figure units: hood top at (0,0), soles at y=2900.
import React from "react";
import type { ActorProps } from "../shared/contract";
import { FaceRig, mouthGeom, rigFor } from "./face";
import { Figure } from "./figure";
import { clamp, mirrorSmooth, Pt, rad, swirlPath } from "./geom";
import { SKIN } from "./palette";
import { ArmSpec, BodyState, bodyState, Hand, PoseTable } from "./rig";

export const GANGA_UNITS = 2900;
export const GANGA_PX = 940;
const HIP = 1400;
const STRIDE = 120;
const SHOULDER: Pt = [205, 770];
const UPPER = 430;
const FORE = 380;

export const GANGA_POSES: PoseTable = {
  stand: { lean: 0, turn: 0.1, tilt: 0, nod: 0, lead: { fwd: -14, bend: -4, hand: "open" }, trail: { fwd: 14, bend: 4, hand: "open" } },
  walk: { lean: 2, turn: 0.3, tilt: 0, nod: 0, lead: { fwd: 0, bend: 10, hand: "rest" }, trail: { fwd: 0, bend: 10, hand: "rest" } },
  talk: { lean: 0, turn: 0.3, tilt: 2, nod: 1, lead: { fwd: 22, bend: 84, wrist: -14, hand: "open" }, trail: { fwd: -8, bend: 12, hand: "rest" } },
  point: { lean: 2, turn: 0.5, tilt: -2, nod: 0, lead: { fwd: 82, bend: 8, wrist: 0, hand: "point" }, trail: { fwd: -6, bend: 8, hand: "rest" } },
  offer: { lean: 3, turn: 0.5, tilt: 3, nod: 4, lead: { fwd: 48, bend: 42, wrist: 22, hand: "palmUp" }, trail: { fwd: 18, bend: 64, wrist: 22, hand: "palmUp" } },
  bow: { lean: 22, turn: 0.3, tilt: 0, nod: 16, lead: { fwd: -8, bend: 8, hand: "rest" }, trail: { fwd: -10, bend: 126, wrist: -8, hand: "open" } },
  think: { lean: -1, turn: 0.3, tilt: 5, nod: 3, lead: { fwd: -10, bend: 62, hand: "rest" }, trail: { fwd: 30, bend: 150, wrist: 0, hand: "chin" } },
};

// Head (variant A rows: brows 214, eyes 256, nose foot 330, mouth 378, chin 460).

const Eye: React.FC<{ side: 1 | -1; r: FaceRig; id: string }> = ({ side, r, id }) => {
  const open = Math.max(0, r.lidOpen);
  const cx = 58 * side;
  const cy = 258;
  const hw = 38;
  const hh = Math.max(0.8, 20 * Math.min(open, 1.5));
  const gx = r.gazeX * 10;
  const gy = r.gazeY * 5;
  const irisR = 18 * (0.8 + 0.2 * r.pupil);
  const closed = open < 0.12;
  const lowerC = cy + hh * 0.9 - r.lidLower * hh * 0.7;
  const upper = `M${cx - hw},${cy + 3} Q${cx},${cy - hh * 1.5} ${cx + hw},${cy + 3}`;
  const lower = `Q${cx},${lowerC} ${cx - hw},${cy + 3}`;
  return (
    <g>
      {!closed && (
        <>
          <clipPath id={id}>
            <path d={`${upper} ${lower} Z`} />
          </clipPath>
          <path d={`${upper} ${lower} Z`} fill="#fbf8fc" stroke="none" />
          <g clipPath={`url(#${id})`} stroke="none">
            <circle cx={cx + gx} cy={cy + 2 + gy} r={irisR} fill={SKIN.iris} />
            <circle cx={cx + gx} cy={cy + 2 + gy} r={irisR * 0.52 * (0.6 + 0.4 * r.pupil)} fill={SKIN.pupil} />
            <circle cx={cx + gx - 5} cy={cy - 4 + gy} r={3.8} fill="#fff" />
          </g>
        </>
      )}
      <path d={upper} fill="none" stroke={SKIN.contour} strokeWidth={4.2} />
      {!closed && <path d={`M${cx + hw},${cy + 3} ${lower}`} fill="none" stroke={SKIN.contour} strokeWidth={2} opacity={0.55} />}
      {closed && <path d={`M${cx - hw},${cy + 3} Q${cx},${cy + 14} ${cx + hw},${cy + 3}`} fill="none" stroke={SKIN.contour} strokeWidth={3.6} />}
    </g>
  );
};

const Brow: React.FC<{ side: 1 | -1; r: FaceRig }> = ({ side, r }) => {
  const asym = side === 1 ? r.browAsym : 0;
  const raise = r.browLift * 18 + asym * 14;
  const angle = -r.browTilt * 26 - asym * 10;
  const ox = 96 * side;
  const oy = 220 - raise;
  const ix = 26 * side;
  const iy = 214 - raise + angle;
  const mx = 66 * side;
  const my = 204 - raise - 1;
  return <path d={`M${ox},${oy} Q${mx},${my} ${ix},${iy}`} fill="none" stroke={SKIN.contour} strokeWidth={3} />;
};

const Mouth: React.FC<{ r: FaceRig; id: string }> = ({ r, id }) => {
  const m = mouthGeom(r, 14, 22, 6);
  return (
    <g transform="translate(0 378)">
      {m.open > 0.05 ? (
        <>
          <clipPath id={id}>
            <path d={m.outline} />
          </clipPath>
          <path d={m.outline} fill={SKIN.mouth} stroke="none" />
          {r.teeth > 0.05 && <rect clipPath={`url(#${id})`} x={-40} y={-30} width={80} height={30 + r.teeth * (3 + m.open * 4)} fill="#fbf6f7" stroke="none" />}
          <path d={m.outline} fill="none" stroke={SKIN.contour} strokeWidth={2.2} />
          <path d={m.upperLine} fill="none" stroke={SKIN.lipDark} strokeWidth={3} />
        </>
      ) : (
        <>
          <path d={`${m.upperLine} Q${r.mouthSkew * 3},${8 + m.lowerY} ${m.left[0]},${m.left[1]} Z`} fill={SKIN.lip} stroke={SKIN.contour} strokeWidth={2} />
          <path d={m.upperLine} fill="none" stroke={SKIN.contour} strokeWidth={2.4} opacity={0.9} />
        </>
      )}
    </g>
  );
};

export const GangaHead: React.FC<{ rig: FaceRig; turn: number; tilt: number; nod: number; id: string }> = ({ rig, turn, tilt, nod, id }) => {
  const fx = turn * 30;
  const sx = 1 - Math.abs(turn) * 0.14;
  return (
    <g transform={`rotate(${tilt} 0 560) translate(${turn * 6} ${nod * 1.4})`}>
      <g transform={`translate(${fx} ${nod * 1.2}) scale(${sx},1)`}>
        <path d="M0,88 C70,88 102,170 102,262 C102,350 62,456 0,460 C-62,456 -102,350 -102,262 C-102,170 -70,88 0,88 Z" fill={SKIN.face} stroke={SKIN.contour} strokeWidth={2.6} />
        <path d="M-104,250 C-102,150 -66,82 0,82 C66,82 102,150 104,250 L110,250 C112,120 66,56 0,56 C-66,56 -112,120 -110,250 Z" fill={SKIN.hair} stroke="none" />
        <g stroke="none" opacity={clamp(rig.blush * 1.2, 0, 1)}>
          <ellipse cx={-62} cy={306} rx={44} ry={22} fill={SKIN.blush} opacity={0.6} />
          <ellipse cx={62} cy={306} rx={44} ry={22} fill={SKIN.blush} opacity={0.6} />
          <ellipse cx={0} cy={312} rx={90} ry={14} fill={SKIN.blush} opacity={0.3} />
        </g>
        <Brow side={-1} r={rig} />
        <Brow side={1} r={rig} />
        <Eye side={-1} r={rig} id={`${id}l`} />
        <Eye side={1} r={rig} id={`${id}r`} />
        <path d="M8,250 C9,280 10,305 9,328 L-9,332" fill="none" stroke={SKIN.contour} strokeWidth={3} />
        <Mouth r={rig} id={`${id}m`} />
      </g>
      <g fill={SKIN.silver} stroke={SKIN.silverLine} strokeWidth={2.2} transform="translate(0 92) scale(0.78)">
        <path d="M-122,-16 Q0,-60 122,-16 L114,-40 Q0,-86 -114,-40 Z" />
        <path d="M0,-170 Q-40,-120 -28,-72 L28,-72 Q40,-120 0,-170Z" />
        <path d="M0,-146 Q-16,-112 0,-82 Q16,-112 0,-146Z" fill="#f8f7ff" />
        {[-1, 1].map((k) => (
          <path key={k} d={`M${k * 40},-72 Q${k * 52},-110 ${k * 84},-118 Q${k * 106},-116 ${k * 100},-96 Q${k * 92},-82 ${k * 78},-92 Q${k * 74},-80 ${k * 96},-62 Z`} />
        ))}
        <circle cx={0} cy={-46} r={8} fill="#f6f4ff" />
      </g>
    </g>
  );
};

// Body.

const HOOD = mirrorSmooth([[0, 0], [112, 8], [168, 100], [176, 260], [182, 480], [200, 700], [0, 730]]);

const fall = (s: 1 | -1, sway: number) =>
  `M${s * 138},690 C${s * 150},690 ${s * 180},690 ${s * 202},696 C${s * 214},900 ${s * 206 + sway},1150 ${s * 180 + sway * 1.6},1400 C${s * 170 + sway * 2}, 1500 ${s * 160 + sway * 2.4},1590 ${s * 150 + sway * 2.6},1690 L${s * 130 + sway * 2.4},1620 C${s * 122 + sway * 1.6},1400 ${s * 122 + sway * 0.6},1200 ${s * 126},980 C${s * 130},860 ${s * 136},760 ${s * 138},690 Z`;

const fallInner = (s: 1 | -1, sway: number) =>
  `M${s * 94},690 L${s * 140},690 C${s * 136},860 ${s * 128},1000 ${s * 120},1180 C${s * 112 + sway * 0.8},1340 ${s * 98 + sway * 1.4},1440 ${s * 84 + sway * 1.8},1540 L${s * 70 + sway * 1.6},1480 C${s * 76 + sway},1360 ${s * 82 + sway * 0.4},1200 ${s * 88},1000 C${s * 92},880 ${s * 94},780 ${s * 94},690 Z`;

const dressPath = (sway: number, leadLift: number, trailLift: number) => {
  const sx = (y: number) => (sway * 80 * (y - HIP)) / (2850 - HIP);
  const pts: Pt[] = [
    [0, 556], [62, 560], [150, 596], [236, 690], [268, 840], [246, 1100], [218, HIP], [246 + sx(1900), 1900], [300 + sx(2400), 2400], [372 + sx(2760), 2760],
    [392 + sx(2832), 2832 - leadLift], [0, 2850 - (leadLift + trailLift) * 0.3], [-392 + sx(2832), 2832 - trailLift], [-372 + sx(2760), 2760], [-300 + sx(2400), 2400],
    [-246 + sx(1900), 1900], [-218, HIP], [-246, 1100], [-268, 840], [-236, 690], [-150, 610], [-62, 580],
  ];
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

const VEIL = mirrorSmooth([[0, -4], [120, 24], [196, 200], [236, 600], [262, 1200], [300, 1800], [372, 2300], [480, 2700], [500, 2830], [0, 2850]]);

const Foot: React.FC<{ x: number; lift: number }> = ({ x, lift }) => (
  <path transform={`translate(${x} ${2846 - lift})`} d="M-46,-30 C-54,-6 -48,40 0,50 C48,40 54,-6 46,-30 Z" fill={SKIN.faceShade} stroke="none" />
);

const HandShape: React.FC<{ hand: Hand; side: 1 | -1 }> = ({ hand, side }) => {
  const skin = { fill: SKIN.face, stroke: SKIN.contour, strokeWidth: 2.2 };
  switch (hand) {
    case "point":
      return (
        <g>
          <path d="M-32,0 C-40,30 -40,70 -28,98 Q0,110 28,98 C40,70 40,30 32,0 Z" {...skin} />
          <path d="M-9,80 L-8,186 Q0,196 8,186 L9,80 Z" {...skin} />
          <path d={`M${-30 * side},18 Q${-48 * side},40 ${-36 * side},66`} fill="none" stroke={SKIN.contour} strokeWidth={2} opacity={0.7} />
        </g>
      );
    case "open":
    case "palmUp":
      return (
        <g>
          <path d="M-32,0 C-46,24 -66,50 -62,80 C-58,96 -46,94 -38,80 C-40,116 -30,150 -18,172 Q-10,184 -4,172 L-4,124 L4,178 Q10,190 16,178 L14,124 L26,160 Q34,166 36,154 L30,96 C40,60 40,24 30,0 Z" {...skin} />
          <path d="M-36,80 Q-10,72 18,78" fill="none" stroke={SKIN.contour} strokeWidth={1.8} opacity={0.6} />
        </g>
      );
    case "chin":
      return (
        <g>
          <path d="M-32,0 C-42,30 -40,76 -26,104 Q0,116 26,104 C40,76 42,30 32,0 Z" {...skin} />
          <path d="M10,0 C26,-30 34,-70 26,-104 Q18,-116 8,-104 C6,-70 0,-30 -6,0" {...skin} />
          <path d="M-22,54 Q0,62 22,54 M-18,82 Q0,90 18,82" fill="none" stroke={SKIN.contour} strokeWidth={1.8} opacity={0.6} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M-32,0 C-44,40 -42,96 -28,136 Q0,150 28,136 C42,96 44,40 32,0 Z" {...skin} />
          <path d="M-10,60 L-9,126 M9,60 L8,126" fill="none" stroke={SKIN.contour} strokeWidth={1.8} opacity={0.6} />
          <path d={`M${-30 * side},26 Q${-46 * side},52 ${-34 * side},86`} fill="none" stroke={SKIN.contour} strokeWidth={2} opacity={0.7} />
        </g>
      );
  }
};

const GangaArm: React.FC<{ side: 1 | -1; arm: ArmSpec }> = ({ side, arm }) => {
  const raised = clamp(Math.sin(rad(arm.fwd + arm.bend)), 0, 1);
  const drape = 170 * raised;
  const wrist = arm.wrist ?? 0;
  return (
    <g transform={`translate(${side * SHOULDER[0]} ${SHOULDER[1]}) rotate(${-arm.fwd})`}>
      <path d={`M-64,-24 Q-84,200 -62,${UPPER} L62,${UPPER} Q84,200 64,-24 Q0,-56 -64,-24 Z`} fill={SKIN.robe} stroke="none" />
      <path d={`M${-48 * side},40 Q${-60 * side},220 ${-46 * side},${UPPER - 10}`} fill="none" stroke={SKIN.robeLine} strokeWidth={2.6} opacity={0.6} />
      <g transform={`translate(0 ${UPPER}) rotate(${-arm.bend})`}>
        <path d={`M-52,0 C${-60 - drape * 0.3},120 ${-90 - drape},280 ${-100 - drape * 0.4},${FORE} L-40,${FORE} Z`} fill={SKIN.veil} stroke="none" opacity={0.45} />
        <path d={`M-52,-20 Q-58,190 -74,${FORE} L74,${FORE} Q58,190 52,-20 Z`} fill={SKIN.robe} stroke="none" />
        <path d={`M-66,${FORE - 40} Q0,${FORE - 24} 66,${FORE - 40} M-72,${FORE - 14} Q0,${FORE + 2} 72,${FORE - 14}`} fill="none" stroke={SKIN.robeLine} strokeWidth={2.6} opacity={0.8} />
        <g transform={`translate(0 ${FORE}) rotate(${-wrist})`}>
          <HandShape hand={arm.hand} side={side} />
        </g>
      </g>
    </g>
  );
};

const Body: React.FC<{ b: BodyState; frame: number; id: string }> = ({ b, frame, id }) => {
  const sway = Math.sin(frame / 23) * 10 + b.hemSway * 30;
  const leadLift = (Math.max(0, b.leadFoot.x) / STRIDE) * 24;
  const trailLift = (Math.max(0, b.trailFoot.x) / STRIDE) * 24;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}v`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={SKIN.veil} stopOpacity={0.5} />
          <stop offset={1} stopColor={SKIN.veil} stopOpacity={0.2} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset={0} stopColor={SKIN.face} stopOpacity={0.4} />
          <stop offset={0.4} stopColor={SKIN.halo} stopOpacity={0.18} />
          <stop offset={1} stopColor={SKIN.halo} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={330} rx={720} ry={820} fill={`url(#${id}g)`} stroke="none" />
      <g transform={`rotate(${b.lean * 0.5} 0 ${HIP})`}>
        <path d={VEIL} fill={`url(#${id}v)`} stroke="none" />
        <g fill="none" stroke={SKIN.veilLine} strokeWidth={2.6} opacity={0.8}>
          <path d={`M120,24 Q220,300 240,800 Q262,1400 320,2000 Q400,2500 ${500 + sway},2800`} />
          <path d={`M-120,24 Q-220,300 -240,800 Q-262,1400 -320,2000 Q-400,2500 ${-500 + sway},2800`} />
        </g>
      </g>
      <Foot x={-80 + b.trailFoot.x} lift={b.trailFoot.lift} />
      <Foot x={80 + b.leadFoot.x} lift={b.leadFoot.lift} />
      <path d={dressPath(b.hemSway, leadLift, trailLift)} fill={SKIN.robe} stroke="none" />
      <g fill="none" stroke={SKIN.robeLine} strokeWidth={2.8} opacity={0.75}>
        <path d={`M-120,${HIP - 300} C${-140 + sway},1700 -170,2200 ${-210 + b.hemSway * 60},2820`} opacity={0.6} />
        <path d={`M120,${HIP - 300} C${140 + sway},1700 170,2200 ${210 + b.hemSway * 60},2820`} opacity={0.6} />
        <path d={`M${-380 + b.hemSway * 70},${2800 - trailLift} Q${b.hemSway * 60},2770 ${380 + b.hemSway * 70},${2800 - leadLift}`} opacity={0.6} />
        <path d="M0,1020 C-18,1050 -18,1080 0,1100 C18,1080 18,1050 0,1020 Z M-30,1050 C-40,1075 -26,1098 0,1100 M30,1050 C40,1075 26,1098 0,1100" opacity={0.8} />
      </g>
      <g transform={`rotate(${b.lean} 0 ${HIP})`}>
        <path d={HOOD} fill={SKIN.hair} stroke="none" />
        <path d="M-46,420 L-50,580 L50,580 L46,420 Z" fill={SKIN.face} stroke="none" />
        <path d="M-150,640 Q0,760 150,640 L150,590 Q0,710 -150,590 Z" fill={SKIN.robeDeep} stroke="none" />
        <path d="M-60,560 Q0,640 60,560" fill="none" stroke={SKIN.faceShade} strokeWidth={2.6} />
        <g fill="#eef0ff" stroke="none">
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            return <circle key={i} cx={-100 + 200 * t} cy={620 + 76 * (1 - (2 * t - 1) ** 2)} r={i === 4 ? 8 : 5} />;
          })}
        </g>
        <g fill={SKIN.robeLine} stroke="none" opacity={0.9}>
          {[-1, 1].map((s) =>
            [0, 1].map((k) => <path key={`${s}${k}`} d={swirlPath({ x: s * (60 + k * 50), y: 760 - k * 26, rot: s > 0 ? -18 : 198, size: 13, w: 3.2, tail: 2.2, flip: s < 0 })} />),
          )}
        </g>
        <path d={fallInner(-1, -sway * 0.4)} fill={SKIN.hair} stroke="none" />
        <path d={fallInner(1, sway * 0.4)} fill={SKIN.hair} stroke="none" />
        <path d={fall(-1, -sway * 0.5)} fill={SKIN.hair} stroke="none" />
        <path d={fall(1, sway * 0.5)} fill={SKIN.hair} stroke="none" />
        <g fill="none" stroke={SKIN.strand} strokeWidth={3} opacity={0.65}>
          <path d={`M-136,140 C-150,280 -156,440 -160,640 C-168,900 ${-170 - sway * 0.4},1200 ${-152 - sway * 1.6},1560`} />
          <path d={`M136,140 C150,280 156,440 160,640 C168,900 ${170 + sway * 0.4},1200 ${152 + sway * 1.6},1560`} />
          <path d="M-60,40 C-104,70 -126,110 -134,170" opacity={0.6} />
          <path d="M60,40 C104,70 126,110 134,170" opacity={0.6} />
        </g>
      </g>
    </g>
  );
};

export const Ganga: React.FC<ActorProps> = (p) => {
  const rig = rigFor(p);
  const b = bodyState(p, GANGA_POSES, STRIDE);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <Figure unitsTall={GANGA_UNITS} pxTall={GANGA_PX} variant={p.variant}>
      <g transform={`translate(0 ${b.bob})`}>
        <Body b={b} frame={p.frame} id={`gm${id}`} />
        <g transform={`rotate(${b.lean} 0 ${HIP})`}>
          <GangaArm side={1} arm={b.lead} />
          <GangaArm side={-1} arm={b.trail} />
          <GangaHead rig={rig} turn={b.turn} tilt={b.tilt} nod={b.nod} id={`gm${id}`} />
        </g>
      </g>
    </Figure>
  );
};
