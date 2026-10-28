import React from 'react';
import { KingFace } from './expressions';
import { mirrorSmooth, Pt, ribbon, swirlPath } from './geom';
import { INK } from './palette';

/**
 * King Shantanu in the owner-pick idiom: a flat near-black cut-out whose form is
 * carried only by sparse pale cream hairlines. Local origin is the neck base
 * (where the head column meets the shoulders); at scale 1 the crown tip is 440 px up.
 */

type Seg = { c?: Pt; p: Pt };
const mirrorPath = (segs: readonly Seg[]) => {
  let d = `M${segs[0].p}`;
  for (const s of segs.slice(1)) d += s.c ? `Q${s.c} ${s.p}` : `L${s.p}`;
  for (let i = segs.length - 1; i >= 1; i--) {
    const prev = segs[i - 1].p;
    const c = segs[i].c;
    d += c ? `Q${-c[0]},${c[1]} ${-prev[0]},${prev[1]}` : `L${-prev[0]},${prev[1]}`;
  }
  return d + 'Z';
};

const CROWN = mirrorPath([
  { p: [0, -470] },
  { c: [14, -452], p: [15, -434] },
  { c: [14, -424], p: [10, -418] },
  { c: [44, -410], p: [62, -380] },
  { p: [86, -340] },
  { c: [124, -336], p: [146, -344] },
  { c: [156, -350], p: [158, -366] },
  { c: [166, -324], p: [130, -298] },
  { p: [126, -262] },
  { p: [0, -262] },
]);

const NECK: Pt[] = [
  [0, -290],
  [120, -290],
  [122, -170],
  [126, -90],
  [146, -36],
  [210, -6],
  [330, 4],
];

/** Bust: the owner-pick block shoulders. Full: narrower shoulders, waist, flared hem. */
const bodyPath = (hem: number) =>
  hem <= 700
    ? mirrorSmooth([...NECK, [458, 14], [498, 28], [513, 70], [518, 150], [520, hem], [0, hem]])
    : mirrorSmooth([...NECK, [380, 18], [408, 54], [414, 140], [396, 420], [350, 720], [372, 1000], [430, hem - 30], [436, hem], [0, hem]]);

/** Where the arms hang from: wider on the bust build. */
const shoulderX = (hem: number) => (hem <= 700 ? 430 : 336);

export type ArmPose = {
  shoulder: number;
  elbow: number;
  /** wrist bend, degrees */
  wrist?: number;
  hand?: 'open' | 'fist';
  /** drawn in hand space under the fingers (e.g. an arrow through the fist) */
  holds?: React.ReactNode;
};

/** Arm parts nest on pivots: shoulder -> elbow -> wrist. At 0 degrees the arm hangs straight down. */
const Arm: React.FC<{ side: 1 | -1; pose: ArmPose; lw: number; sx: number }> = ({ side, pose, lw, sx }) => (
  <g transform={`translate(${side * sx} 96) rotate(${pose.shoulder})`} fill={INK.silhouette} stroke={INK.cream} strokeWidth={lw}>
    <path d="M-60,-40 Q-80,170 -60,330 Q0,350 60,330 Q78,170 60,-40 Q0,-70 -60,-40 Z" />
    <g transform={`translate(0 316) rotate(${pose.elbow})`}>
      <path d="M-50,0 Q-46,140 -36,262 L36,262 Q46,140 50,0 Z" />
      <path d="M-40,214 L40,214 M-38,234 L38,234" fill="none" />
      <path d={`M${side * 60},-8 Q${side * 90},90 ${side * 40},160`} fill="none" />
      <g transform={`translate(0 258) rotate(${pose.wrist ?? 0})`}>
        {pose.holds}
        {pose.hand === 'fist' ? (
          <>
            <rect x={-44} y={-4} width={88} height={84} rx={30} />
            <path d="M-42,24 L42,24 M-42,48 L40,48" fill="none" />
          </>
        ) : (
          <>
            <path d="M-36,0 Q-44,50 -34,92 L-30,150 Q-22,160 -16,150 L-14,104 L-8,162 Q0,172 6,162 L8,104 L14,154 Q22,164 28,152 L26,96 Q40,50 36,0 Z" />
            <path d={`M${side * -34},20 Q${side * -74},44 ${side * -64},84`} fill="none" />
          </>
        )}
      </g>
    </g>
  </g>
);

const Eye: React.FC<{ s: 1 | -1; f: KingFace; blink: number; id: string }> = ({ s, f, blink, id }) => {
  const cy = -200 + f.browIn * 0.1;
  const inner: Pt = [s * 22, cy + 4];
  const outer: Pt = [s * 84, cy - 6];
  const h = Math.max(0.6, f.eyeOpen * (1 - blink));
  const mx = s * 52;
  const up: Pt = [mx, cy - 1 - 2 * h];
  const lo: Pt = [mx, cy - 1 + 2 * Math.max(0.3, h - f.squint * (1 - blink))];
  const d = `M${inner} Q${up} ${outer} Q${lo} ${inner}Z`;
  return (
    <>
      <clipPath id={`${id}${s}`}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={INK.eyeLit} />
      <circle cx={mx - s * 4 + f.pupil[0]} cy={cy - 1 + f.pupil[1]} r={5.5} fill={INK.silhouette} clipPath={`url(#${id}${s})`} />
      <path d={d} fill="none" />
    </>
  );
};

const Brow: React.FC<{ s: 1 | -1; f: KingFace }> = ({ s, f }) => {
  const a: Pt = [s * 14, -220 + f.browIn];
  const b: Pt = [s * 100, -236 + f.browOut];
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 7];
  const pts: Pt[] = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    return [
      (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * m[0] + t * t * b[0],
      (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * m[1] + t * t * b[1],
    ];
  });
  return <path d={ribbon(pts, (t) => 11 - 7 * t)} fill={INK.cream} stroke="none" />;
};

const Mouth: React.FC<{ f: KingFace; open: number }> = ({ f, open }) => {
  const y = -80;
  const c = f.mouthCurve;
  if (open < 0.08)
    return <path d={`M-24,${y - c} Q0,${y + c * 0.6} 24,${y - c}`} fill="none" />;
  const h = 6 + open * 26;
  return (
    <path
      d={`M-22,${y - c} Q0,${y - 4 + c * 0.3} 22,${y - c} Q${14},${y + h} 0,${y + h} Q${-14},${y + h} -22,${y - c}Z`}
      fill="#2a0806"
    />
  );
};

const Mustache: React.FC<{ f: KingFace; lw: number }> = ({ f, lw }) => (
  <>
    {([1, -1] as const).map((s) => {
      const lift = f.mustache;
      const curl = swirlPath({
        x: s * 86,
        y: -84 + lift,
        rot: s > 0 ? 196 : -16,
        size: 14,
        w: lw * 1.05,
        turns: 1.25,
        tail: 6.4,
        flip: s < 0,
        bend: -0.12,
      });
      return (
        <g key={s}>
          <path d={curl} fill={INK.cream} stroke="none" />
          <path d={`M0,-104 Q${s * 44},${-104 + lift * 0.4} ${s * 76},${-80 + lift}`} fill="none" />
        </g>
      );
    })}
  </>
);

export type ShantanuProps = {
  x: number;
  y: number;
  scale: number;
  /** on-screen hairline width in px */
  line: number;
  face: KingFace;
  blink?: number;
  /** overrides face.mouthOpen when set (speech) */
  mouth?: number;
  /** head tilt, degrees, pivot at the neck */
  tilt?: number;
  /** -1..1: features slide toward the side the head turns to */
  turn?: number;
  hem?: number;
  arms?: { left?: ArmPose; right?: ArmPose };
  /** close-up: fist gripping the arrow, in local coords */
  fistAt?: Pt;
  fistAngle?: number;
  /** drawn in world space between the body and the gripping fist (the arrow shaft) */
  holding?: React.ReactNode;
  /** drawn in world space over the fist (the fletching) */
  holdingFront?: React.ReactNode;
  idPrefix: string;
};

export const Shantanu: React.FC<ShantanuProps> = ({
  x,
  y,
  scale,
  line,
  face,
  blink = 0,
  mouth,
  tilt = 0,
  turn = 0,
  hem = 700,
  arms = {},
  fistAt,
  fistAngle = 0,
  holding,
  holdingFront,
  idPrefix,
}) => {
  const lw = line / scale;
  const fx = turn * 20;
  return (
    <>
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g stroke={INK.cream} strokeWidth={lw} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={bodyPath(hem)} fill={INK.silhouette} stroke="none" />
        {/* robe: lapels crossing, centre seam, panels, sleeves, sash, necklace */}
        {hem <= 700 ? (
          <>
            <path d="M150,-6 C90,110 -30,260 -230,700 M-150,-6 C-90,110 30,260 230,700" />
            <path d="M0,40 L0,700" />
            <path d="M205,8 Q228,300 250,700 M-205,8 Q-228,300 -250,700" />
            <path d="M420,16 Q408,300 396,700 M-420,16 Q-408,300 -396,700" />
            <path d="M-518,360 L170,700" />
          </>
        ) : (
          <>
            <path d="M150,-6 C100,180 40,420 0,600 M-150,-6 C-100,180 -40,420 0,600" />
            <path d="M0,40 L0,600 M-370,640 Q0,690 370,640 M-372,700 Q0,750 372,700" />
            <path d="M-300,30 Q-340,340 -300,640 M300,30 Q340,340 300,640" />
            <path d={`M0,740 L0,${hem - 80} M-120,740 Q-140,1100 -190,${hem - 80} M120,740 Q140,1100 190,${hem - 80} M-260,740 Q-300,1100 -350,${hem - 80} M260,740 Q300,1100 350,${hem - 80}`} />
          </>
        )}
        <path d="M-168,2 Q0,200 168,2" />
        <path d="M0,96 l-9,20 l9,16 l9,-16 Z M-66,76 l-7,16 l7,12 l7,-12 Z M66,76 l-7,16 l7,12 l7,-12 Z" fill={INK.silhouette} />
        {hem > 700 && (
          <>
            <path d={`M-430,${hem - 50} ${Array.from({ length: 18 }, (_, i) => {
              const xx = -430 + i * 48;
              return `L${xx},${hem - 50 - (i % 2 ? 22 : 0)} L${xx + 48},${hem - 50 - (i % 2 ? 22 : 0)}`;
            }).join(' ')}`} />
            <path d={`M-440,${hem - 16} L440,${hem - 16}`} />
          </>
        )}
        {/* long hair falling onto the shoulders */}
        {([1, -1] as const).map((s) => (
          <path
            key={s}
            d={`M${s * 126},-262 C${s * 132},-150 ${s * 126},-60 ${s * 196},-8 C${s * 250},26 ${s * 270},90 ${s * 262},170 M${s * 110},-230 C${s * 112},-140 ${s * 110},-70 ${s * 160},-20`}
          />
        ))}
        {arms.left && <Arm side={-1} pose={arms.left} lw={lw} sx={shoulderX(hem)} />}
        {arms.right && <Arm side={1} pose={arms.right} lw={lw} sx={shoulderX(hem)} />}
        <g transform={`rotate(${tilt} 0 -40)`}>
          <path d={CROWN} fill={INK.silhouette} stroke="none" />
          {/* crown: bands, lotus petals, spire, jewel */}
          <path d="M-128,-302 Q0,-290 128,-302 M-127,-274 Q0,-262 127,-274" />
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={i} d={`M${i * 46 - 21},-304 Q${i * 46},${-346 + Math.abs(i) * 8} ${i * 46 + 21},-304`} />
          ))}
          <path d="M-86,-336 Q0,-322 86,-336 M-60,-378 Q0,-368 60,-378 M-10,-416 Q0,-408 10,-416 M0,-460 L0,-426 M-128,-310 Q-148,-326 -156,-360 M128,-310 Q148,-326 156,-360" />
          {[-1, 0, 1].map((i) => (
            <path key={i} d={`M${i * 40 - 16},-340 Q${i * 40},-372 ${i * 40 + 16},-340`} />
          ))}
          <circle cx={0} cy={-394} r={8} />
          {/* earrings */}
          {([1, -1] as const).map((s) => (
            <path key={s} d={`M${s * 134},-182 a15,15 0 1,0 0.1,0 M${s * 134},-152 l-6,12 l6,10 l6,-10 Z`} fill={INK.silhouette} />
          ))}
          <g transform={`translate(${fx} 0)`}>
            {/* Vaishnava tilak continuing into the nose line */}
            <path d="M-15,-262 Q0,-222 15,-262 M0,-268 L0,-238" />
            <path d={`M${turn * 6},-232 L${turn * 10},-150 M${turn * 10 - 15},-146 Q${turn * 10},-134 ${turn * 10 + 15},-146`} />
            {([1, -1] as const).map((s) => (
              <g key={s}>
                <Brow s={s} f={face} />
                <Eye s={s} f={face} blink={blink} id={idPrefix} />
              </g>
            ))}
            <Mustache f={face} lw={lw} />
            <Mouth f={face} open={mouth ?? face.mouthOpen} />
            {/* beard */}
            <path d="M-114,-160 Q-106,-30 0,34 Q106,-30 114,-160 M-62,-66 Q-44,-8 -12,18 M62,-66 Q44,-8 12,18 M0,-62 L0,30" />
          </g>
        </g>
      </g>
    </g>
    {holding}
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g stroke={INK.cream} strokeWidth={lw} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {fistAt && (
          <g transform={`translate(${fistAt[0]} ${fistAt[1]}) rotate(${fistAngle}) scale(1.25)`} strokeWidth={lw / 1.25}>
            <path d="M-70,-150 Q-96,-40 -64,20 M70,-150 Q96,-40 64,20" />
            <rect x={-62} y={-10} width={124} height={108} rx={34} fill={INK.silhouette} />
            <path d="M-60,22 L60,22 M-60,50 L58,50 M-56,76 L52,76 M-62,10 Q-96,30 -80,66" />
          </g>
        )}
      </g>
    </g>
    {holdingFront}
    </>
  );
};

/** The single saturated accent: a red arrow with diamond head and flared fletching. */
export const RedArrow: React.FC<{
  from: Pt;
  to: Pt;
  width: number;
  head?: number;
  /** 0..1 along the shaft; 0 hides it */
  fletchAt?: number;
  part?: 'all' | 'shaft' | 'fletch';
}> = ({ from, to, width, head = 1, fletchAt = 1, part = 'all' }) => {
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const hs = 34 * head;
  return (
    <g transform={`translate(${from[0]} ${from[1]}) rotate(${ang})`} fill={INK.red}>
      {part !== 'fletch' && (
        <>
          <rect x={0} y={-width / 2} width={len} height={width} />
          <path d={`M${-hs * 1.8},0 L0,${-hs * 0.55} L${hs * 0.9},0 L0,${hs * 0.55}Z`} />
          <path d={`M${hs * 4.2},0 L${hs * 4.9},${-hs * 0.32} L${hs * 5.8},0 L${hs * 4.9},${hs * 0.32}Z`} />
        </>
      )}
      {part !== 'shaft' && fletchAt > 0 && (
        <g transform={`translate(${len * fletchAt + 90} 0)`}>
          {[-1, 1].map((s) =>
            [0, 1, 2].map((k) => (
              <path
                key={`${s}${k}`}
                d={`M${-40 - k * 26},0 Q${-80 - k * 30},${s * (30 + k * 10)} ${-130 - k * 30},${s * (46 + k * 14)} Q${-90 - k * 26},${s * 12} ${-40 - k * 26 + 14},0Z`}
              />
            )),
          )}
        </g>
      )}
    </g>
  );
};

