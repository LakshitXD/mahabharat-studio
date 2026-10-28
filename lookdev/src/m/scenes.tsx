import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ActorProps, Expression, Pose, Viseme } from "../shared/contract";
import { CLOSE_SKY, Grain, H, Lotus, Motes, NIGHT_CLOSE_SKY, RedArrow, Reed, Reeds, Sky, Vignette, W } from "./atmosphere";
import { EXPRESSION_RIGS, EXPRESSIONS } from "./face";
import { Ganga, GANGA_PX, GANGA_UNITS, GangaHead } from "./ganga";
import { DAY, INK, NIGHT, SKIN } from "./palette";
import { travelPerCycle } from "./rig";
import { gangaTat } from "./set";
import { KING_HALF_STEP, KING_PX, KING_UNITS, KingHand, KingHead, kingHand, Shantanu } from "./shantanu";
import { Figure } from "./figure";

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </svg>
  </AbsoluteFill>
);

const actor = (over: Partial<ActorProps> & { pose: Pose; expression: Expression }): ActorProps => ({
  mouth: 0,
  blink: 0,
  facing: "right",
  walkPhase: 0,
  frame: 0,
  ...over,
});

/** The player's placement: feet at (x, y), scale, mirrored when facing left. */
const Place: React.FC<{ x: number; y: number; scale: number; facing?: "left" | "right"; children: React.ReactNode }> = ({ x, y, scale, facing = "right", children }) => (
  <g transform={`translate(${x} ${y}) scale(${facing === "left" ? -scale : scale} ${scale})`}>{children}</g>
);

const POSES: Pose[] = ["stand", "walk", "talk", "point", "offer", "bow", "think"];
const LABEL = { fontFamily: "Georgia, serif", fontSize: 26, fill: "#f0dcc2", letterSpacing: 2 } as const;

// Wide: the riverbank at day, the king offering, Ganga standing in the water.

export const Wide: React.FC = () => {
  const frame = useCurrentFrame();
  const ground = gangaTat.groundY * H;
  const s = gangaTat.actorScale;
  return (
    <Frame>
      <gangaTat.Back mood="day" frame={frame} />
      <Place x={1300} y={ground} scale={s} facing="left">
        <Ganga {...actor({ pose: "stand", expression: "smile", frame })} />
      </Place>
      <Place x={640} y={ground} scale={s}>
        <Shantanu {...actor({ pose: "offer", expression: "smile", frame })} />
      </Place>
      {gangaTat.Front && <gangaTat.Front mood="day" frame={frame} />}
    </Frame>
  );
};

// Shantanu close-up in the owner-pick framing: eyes at 27% of the height, chest cut by the frame edge.

const KING_CLOSE = { scale: (KING_UNITS / KING_PX) * 0.92, eyeY: 292, eyeRow: 190 };

export const ShantanuClose: React.FC<{ expression?: Expression; mouth?: number; viseme?: Viseme; blink?: number; frame?: number }> = ({
  expression = "neutral",
  mouth = 0,
  viseme,
  blink = 0,
  frame = 0,
}) => {
  const px = KING_CLOSE.scale * (KING_PX / KING_UNITS);
  const feetY = KING_CLOSE.eyeY + (KING_UNITS - KING_CLOSE.eyeRow) * px;
  const props = actor({ pose: "stand", expression, mouth, viseme, blink, frame, variant: "close" });
  const hand = kingHand(props, "trail");
  const fist: [number, number] = [960 + hand.palm.x * px, feetY + (hand.palm.y - KING_UNITS) * px];
  const dir: [number, number] = [Math.cos(0.8), Math.sin(0.8)];
  const from: [number, number] = [fist[0] - dir[0] * 1150, fist[1] - dir[1] * 1150];
  const to: [number, number] = [fist[0] + dir[0] * 330, fist[1] + dir[1] * 330];
  return (
    <Frame>
      <Sky mood={DAY} layout={CLOSE_SKY} />
      <Vignette mood={DAY} c={[960, 800]} strength={0.3} />
      <Place x={960} y={feetY} scale={KING_CLOSE.scale}>
        <Shantanu {...props} />
      </Place>
      <RedArrow from={from} to={to} width={13} color={INK.red} fletchAt={0.9} />
      <Place x={960} y={feetY} scale={KING_CLOSE.scale}>
        <Figure unitsTall={KING_UNITS} pxTall={KING_PX} variant="close">
          <g transform={`translate(${hand.x} ${hand.y}) rotate(${hand.rotation})`} stroke={INK.cream}>
            <KingHand hand={hand.hand} side={-1} />
          </g>
        </Figure>
      </Place>
      <Grain seed={3} opacity={DAY.grainOpacity} />
    </Frame>
  );
};

// Ganga close-up at night (f2 framing): the face carries its own glow among lotus and reeds.

const REEDS: readonly Reed[] = [
  { pts: [[40, 1100], [150, 880], [250, 720], [300, 560]], w: 13, leaves: [{ at: 0.2, len: 190, side: -1 }, { at: 0.45, len: 160, side: 1 }, { at: 0.7, len: 120, side: -1 }] },
  { pts: [[-30, 1000], [70, 820], [130, 640], [130, 470]], w: 11, leaves: [{ at: 0.35, len: 150, side: 1 }, { at: 0.65, len: 120, side: -1 }] },
  { pts: [[260, 1100], [330, 960], [420, 862]], w: 10, leaves: [{ at: 0.3, len: 130, side: -1 }, { at: 0.6, len: 100, side: 1 }] },
  { pts: [[1880, 1100], [1770, 880], [1670, 720], [1620, 560]], w: 13, leaves: [{ at: 0.2, len: 190, side: 1 }, { at: 0.45, len: 160, side: -1 }, { at: 0.7, len: 120, side: 1 }] },
  { pts: [[1950, 1000], [1850, 820], [1790, 640], [1790, 470]], w: 11, leaves: [{ at: 0.35, len: 150, side: -1 }, { at: 0.65, len: 120, side: 1 }] },
  { pts: [[1660, 1100], [1590, 960], [1500, 862]], w: 10, leaves: [{ at: 0.3, len: 130, side: 1 }, { at: 0.6, len: 100, side: -1 }] },
];

const GANGA_CLOSE = { scale: (GANGA_UNITS / GANGA_PX) * 1.14, eyeY: 430, eyeRow: 258 };

export const GangaClose: React.FC<{ expression?: Expression; mouth?: number; viseme?: Viseme; blink?: number; frame?: number }> = ({
  expression = "neutral",
  mouth = 0,
  viseme,
  blink = 0,
  frame = 0,
}) => {
  const px = GANGA_CLOSE.scale * (GANGA_PX / GANGA_UNITS);
  const feetY = GANGA_CLOSE.eyeY + (GANGA_UNITS - GANGA_CLOSE.eyeRow) * px;
  return (
    <Frame>
      <Sky mood={NIGHT} layout={NIGHT_CLOSE_SKY} drift={frame * 0.9} />
      <Motes seed={11} n={40} color="#d6ccff" drift={frame * 1.8} />
      <Reeds reeds={REEDS} color="#161233" />
      <Lotus x={300} y={560} size={70} rot={-20} />
      <Lotus x={130} y={470} size={52} rot={-5} />
      <Lotus x={1620} y={560} size={70} rot={20} />
      <Lotus x={1790} y={470} size={52} rot={5} />
      <Lotus x={420} y={862} size={44} rot={30} />
      <Lotus x={1500} y={862} size={44} rot={-30} />
      <Vignette mood={NIGHT} c={[960, 480]} strength={0.5} />
      <Place x={960} y={feetY} scale={GANGA_CLOSE.scale}>
        <Ganga {...actor({ pose: "stand", expression, mouth, viseme, blink, frame, variant: "close" })} />
      </Place>
      <Grain seed={5} opacity={NIGHT.grainOpacity} />
    </Frame>
  );
};

// Expression sheet: both heads, all nine rigs, at a phone-close-up size.

export const Expressions: React.FC = () => {
  const cell = W / EXPRESSIONS.length;
  return (
    <Frame>
      <style>{`.m-ns path,.m-ns circle,.m-ns ellipse,.m-ns rect{vector-effect:non-scaling-stroke}`}</style>
      <defs>
        <linearGradient id="exprWarm" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#7a3c33" />
          <stop offset={0.5} stopColor="#e2ab84" />
          <stop offset={1} stopColor="#efc298" />
        </linearGradient>
        <linearGradient id="exprNight" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#2a2258" />
          <stop offset={0.6} stopColor="#5d4c9e" />
          <stop offset={1} stopColor="#3a2e6e" />
        </linearGradient>
      </defs>
      <rect width={W} height={H / 2} fill="url(#exprWarm)" />
      <rect y={H / 2} width={W} height={H / 2} fill="url(#exprNight)" />
      {EXPRESSIONS.map((name, i) => {
        const x = cell * (i + 0.5);
        return (
          <g key={name} className="m-ns" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
            <g transform={`translate(${x} 70) scale(0.62)`}>
              <path d="M-152,376 C-290,386 -400,410 -440,470 L-440,760 L440,760 L440,470 C400,410 290,386 152,376 Z" fill={INK.silhouette} />
              <path d="M-150,390 C-290,400 -400,424 -436,470 M150,390 C290,400 400,424 436,470" fill="none" stroke={INK.cream} opacity={0.8} />
              <KingHead rig={EXPRESSION_RIGS[name]} turn={0} tilt={0} nod={0} id={`xk${i}`} />
            </g>
            <g transform={`translate(${x} ${H / 2 + 40}) scale(0.62)`}>
              <path d="M0,0 C112,0 170,80 174,220 C178,400 186,600 200,780 L-200,780 C-186,600 -178,400 -174,220 C-170,80 -112,0 0,0 Z" fill={SKIN.hair} />
              <path d="M-46,420 L-50,600 L50,600 L46,420 Z" fill={SKIN.face} />
              <path d="M-150,660 Q0,780 150,660 L150,610 Q0,730 -150,610 Z" fill={SKIN.robeDeep} />
              <path d="M-240,790 L-150,610 L150,610 L240,790 Z" fill={SKIN.robe} />
              <GangaHead rig={EXPRESSION_RIGS[name]} turn={0} tilt={0} nod={0} id={`xg${i}`} />
            </g>
          </g>
        );
      })}
      {EXPRESSIONS.map((name, i) => (
        <g key={name}>
          <text x={cell * (i + 0.5)} y={H / 2 - 18} textAnchor="middle" {...LABEL}>
            {name}
          </text>
          <text x={cell * (i + 0.5)} y={H - 18} textAnchor="middle" {...LABEL} fill="#e4ddff">
            {name}
          </text>
        </g>
      ))}
    </Frame>
  );
};

// Pose sheet: both characters, all seven poses, full body.

export const Poses: React.FC = () => {
  const cell = W / POSES.length;
  const s = 0.44;
  return (
    <Frame>
      <defs>
        <linearGradient id="poseWarm" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#7a3c33" />
          <stop offset={0.45} stopColor="#d89d7b" />
          <stop offset={1} stopColor="#a06350" />
        </linearGradient>
        <linearGradient id="poseNight" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#2a2258" />
          <stop offset={0.5} stopColor="#5d4c9e" />
          <stop offset={1} stopColor="#3a2e6e" />
        </linearGradient>
      </defs>
      <rect width={W} height={H / 2} fill="url(#poseWarm)" />
      <rect y={H / 2} width={W} height={H / 2} fill="url(#poseNight)" />
      <path d={`M0,${H / 2 - 40} L${W},${H / 2 - 40}`} stroke="#2b1413" strokeWidth={3} opacity={0.5} />
      <path d={`M0,${H - 40} L${W},${H - 40}`} stroke="#120f2c" strokeWidth={3} opacity={0.5} />
      {POSES.map((pose, i) => {
        const x = cell * (i + 0.5) - 20;
        const wp = pose === "walk" ? 0.18 : 0;
        return (
          <g key={pose}>
            <Place x={x} y={H / 2 - 40} scale={s}>
              <Shantanu {...actor({ pose, expression: pose === "think" ? "thinking" : pose === "bow" ? "neutral" : "smile", walkPhase: wp })} />
            </Place>
            <text x={x} y={H / 2 - 8} textAnchor="middle" {...LABEL}>
              {pose}
            </text>
            <Place x={x} y={H - 40} scale={s}>
              <Ganga {...actor({ pose, expression: pose === "think" ? "thinking" : pose === "bow" ? "neutral" : "smile", walkPhase: wp })} />
            </Place>
            <text x={x} y={H - 8} textAnchor="middle" {...LABEL} fill="#e4ddff">
              {pose}
            </text>
          </g>
        );
      })}
    </Frame>
  );
};

// Walk: 60 frames, two cycles each, travelling so the planted foot does not slide.

const CYCLE = 30;

export const Walk: React.FC = () => {
  const frame = useCurrentFrame();
  const ground = gangaTat.groundY * H;
  const s = gangaTat.actorScale;
  const phase = (frame % CYCLE) / CYCLE;
  const cycles = frame / CYCLE;
  const kingTravel = travelPerCycle(KING_HALF_STEP) * (KING_PX / KING_UNITS) * s;
  const gangaTravel = travelPerCycle(120) * (GANGA_PX / GANGA_UNITS) * s;
  return (
    <Frame>
      <gangaTat.Back mood="evening" frame={frame} />
      <Place x={1040 + cycles * gangaTravel} y={ground} scale={s}>
        <Ganga {...actor({ pose: "walk", expression: "neutral", walkPhase: phase + 0.3, frame })} />
      </Place>
      <Place x={420 + cycles * kingTravel} y={ground} scale={s}>
        <Shantanu {...actor({ pose: "walk", expression: "determined", walkPhase: phase, frame })} />
      </Place>
      {gangaTat.Front && <gangaTat.Front mood="evening" frame={frame} />}
    </Frame>
  );
};

// Motion: 90 frames. The king offers, then speaks; Ganga listens and warms to a smile.

const SYLLABLES: readonly (Viseme | null)[] = ["AI", "AI", "MBP", "E", "O", null, "AI", "E", "MBP", "O", "FV", "AI", null, "E", "AI", "MBP", null];

const speech = (f: number, start: number, step: number): { mouth: number; viseme?: Viseme } => {
  const k = (f - start) / step;
  if (k < 0 || k >= SYLLABLES.length) return { mouth: 0 };
  const v = SYLLABLES[Math.floor(k)];
  if (!v) return { mouth: 0 };
  const t = k - Math.floor(k);
  return { mouth: Math.sin(t * Math.PI) * 0.9 + 0.1, viseme: v };
};

const blinkAt = (f: number, at: readonly number[]) =>
  Math.max(0, ...at.map((b) => interpolate(f, [b - 2, b, b + 3], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const ground = gangaTat.groundY * H;
  const s = gangaTat.actorScale;
  const kingPose: Pose = frame < 36 ? "offer" : "talk";
  const sp = speech(frame, 38, 3);
  const gangaExpr: Expression = frame < 50 ? "neutral" : frame < 70 ? "surprised" : "smile";
  return (
    <Frame>
      <gangaTat.Back mood="day" frame={frame} />
      <Place x={1300} y={ground} scale={s} facing="left">
        <Ganga {...actor({ pose: frame < 70 ? "stand" : "offer", expression: gangaExpr, blink: blinkAt(frame, [22, 74]), frame })} />
      </Place>
      <Place x={640} y={ground} scale={s}>
        <Shantanu {...actor({ pose: kingPose, expression: frame < 36 ? "determined" : "smile", mouth: sp.mouth, viseme: sp.viseme, blink: blinkAt(frame, [12, 60]), frame })} />
      </Place>
      {gangaTat.Front && <gangaTat.Front mood="day" frame={frame} />}
    </Frame>
  );
};
