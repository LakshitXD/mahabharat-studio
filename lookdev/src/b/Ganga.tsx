import React from 'react';
import { useSvgId } from './Atmosphere';
import { QueenFace } from './expressions';
import { mirrorSmooth, Pt, smooth, swirlPath } from './geom';
import { SKIN } from './palette';

/**
 * Ganga in the f2 idiom: a long pale shield of a face that carries its own
 * glow, big simple eyes, a one-line nose, dark violet hair under a translucent
 * river-blue veil, and a ring of water-light behind the head.
 * Local origin is the centre of the eye line; at scale 1 the chin is 300 px below it.
 */

const FACE = mirrorSmooth([
  [0, -186],
  [96, -180],
  [124, -120],
  [128, -20],
  [121, 74],
  [102, 162],
  [68, 236],
  [28, 286],
  [0, 300],
]);

const BACK_HAIR = mirrorSmooth([
  [0, -300],
  [150, -276],
  [204, -170],
  [212, 40],
  [222, 240],
  [250, 420],
  [262, 560],
  [0, 560],
]);

const curtain = (s: 1 | -1) =>
  smooth(
    [
      [0, -200],
      [s * 70, -196],
      [s * 116, -140],
      [s * 132, -40],
      [s * 128, 80],
      [s * 128, 210],
      [s * 160, 340],
      [s * 196, 420],
      [s * 214, 300],
      [s * 206, 80],
      [s * 200, -130],
      [s * 150, -246],
      [s * 40, -262],
    ],
    true,
  );

export type GangaArm = { shoulder: number; elbow: number };

export type GangaProps = {
  x: number;
  y: number;
  scale: number;
  face: QueenFace;
  blink?: number;
  /** speech: 0 closed .. 1 open, overrides face.mouthOpen */
  mouth?: number;
  /** -1..1 lip roundness for 'o' shapes */
  round?: number;
  tilt?: number;
  /** hem of the dress in local px (560 = chest-up crop) */
  hem?: number;
  /** water-light rings behind the head; ripple phase 0..1 animates them outward */
  halo?: number;
  ripple?: number;
  /** 0..1 strength of the bloom around the face */
  glow?: number;
  arm?: GangaArm;
  /** which side the posed arm is on: 1 = viewer's right */
  armSide?: 1 | -1;
};

const Eye: React.FC<{ s: 1 | -1; f: QueenFace; blink: number; id: string }> = ({ s, f, blink, id }) => {
  const open = f.eyeOpen * (1 - blink);
  const inner: Pt = [s * 32, 6];
  const outer: Pt = [s * 112, -2];
  const up: Pt = [s * 70, 4 - 50 * open];
  const lo: Pt = [s * 72, 34 - 20 * f.squint];
  const shape = `M${inner} Q${up} ${outer} Q${lo} ${inner}Z`;
  const ix = s * 70 + f.pupil[0];
  const iy = 0 + f.pupil[1];
  if (open < 0.12) {
    return (
      <path
        d={`M${inner[0]},${inner[1] + 2} Q${s * 70},${22} ${outer[0]},${outer[1] + 2}`}
        stroke={SKIN.line}
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      <clipPath id={`${id}${s}`}>
        <path d={shape} />
      </clipPath>
      <path d={shape} fill="#fdfbfc" />
      <g clipPath={`url(#${id}${s})`}>
        <circle cx={ix} cy={iy} r={25} fill={`url(#${id}iris)`} />
        <circle cx={ix} cy={iy} r={25} fill="none" stroke={SKIN.irisDeep} strokeWidth={2} />
        <circle cx={ix} cy={iy + 1} r={12.5} fill={SKIN.pupil} />
        <circle cx={ix - 8} cy={iy - 9} r={5.5} fill="#fff" />
        <path d={`M${inner} Q${up} ${outer}`} stroke={SKIN.faceShade} strokeWidth={10} fill="none" opacity={0.6} />
      </g>
      <path
        d={`M${inner} Q${up} ${outer} l${s * 8},-3`}
        stroke={SKIN.line}
        strokeWidth={4.2}
        fill="none"
        strokeLinecap="round"
      />
      <path d={`M${s * 50},${22 - 6 * f.squint} Q${s * 74},${30 - 14 * f.squint} ${s * 98},${12}`} stroke={SKIN.faceDeep} strokeWidth={2} fill="none" />
    </>
  );
};

const Brow: React.FC<{ s: 1 | -1; f: QueenFace }> = ({ s, f }) => {
  const y = -102 - f.browLift - (s > 0 ? f.browAsym ?? 0 : 0);
  return (
    <path
      d={`M${s * 34},${y + 10 - f.browTilt} Q${s * 76},${y - 18 - f.browTilt * 0.3} ${s * 124},${y + 12}`}
      stroke={SKIN.line}
      strokeWidth={2.6}
      fill="none"
      strokeLinecap="round"
    />
  );
};

const Mouth: React.FC<{ f: QueenFace; open: number; round: number }> = ({ f, open, round }) => {
  const y = 180;
  const c = f.mouthCurve;
  const w = 21 - round * 7;
  const h = open * 22;
  return (
    <g>
      {h > 1.5 && (
        <path
          d={`M${-w + 2},${y - c} Q0,${y - 4} ${w - 2},${y - c} Q${w * 0.7},${y + h} 0,${y + h + 2} Q${-w * 0.7},${y + h} ${-w + 2},${y - c}Z`}
          fill="#4a3046"
        />
      )}
      <path d={`M${-w},${y - c} Q${-w / 2},${y - 7} 0,${y - 3} Q${w / 2},${y - 7} ${w},${y - c} Q0,${y + 3} ${-w},${y - c}Z`} fill={SKIN.lips} />
      <path d={`M${-w * 0.6},${y + 10 + h} Q0,${y + 15 + h} ${w * 0.6},${y + 10 + h}`} stroke={SKIN.faceDeep} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Arm: React.FC<{ s: 1 | -1; pose: GangaArm; sx: number }> = ({ s, pose, sx }) => (
  <g transform={`translate(${s * sx} 420) rotate(${pose.shoulder})`}>
    <path d={`M${-s * 50},40 Q${-s * 150},260 ${-s * 70},420 Q${-s * 30},300 0,330 Z`} fill={SKIN.veil} opacity={0.5} />
    <path d="M-56,-30 Q-72,200 -50,330 L50,330 Q72,200 56,-30 Z" fill={SKIN.robe} />
    <g transform={`translate(0 320) rotate(${pose.elbow})`}>
      <path d="M-40,0 L-30,250 L30,250 L40,0 Z" fill={SKIN.robe} />
      <path d="M-34,200 L34,200 M-32,216 L32,216" stroke={SKIN.robeLine} strokeWidth={3} />
      <path d="M-26,240 Q-36,300 -14,340 Q2,352 18,336 Q34,296 26,240 Z" fill={SKIN.face} />
      <path d={`M${s * -26},250 Q${s * -52},270 ${s * -42},300`} stroke={SKIN.faceDeep} strokeWidth={3} fill="none" />
    </g>
  </g>
);

export const Ganga: React.FC<GangaProps> = ({
  x,
  y,
  scale,
  face,
  blink = 0,
  mouth,
  round = 0,
  tilt = 0,
  hem = 560,
  halo = 1,
  ripple = 0,
  glow = 1,
  arm,
  armSide = 1,
}) => {
  const id = useSvgId('ganga');
  const veilBottom = Math.max(hem, 700);
  const full = hem > 720;
  const dress = full
    ? mirrorSmooth([[0, 300], [50, 330], [140, 366], [196, 420], [214, 540], [196, 820], [230, hem * 0.72], [330, hem], [0, hem]])
    : mirrorSmooth([[0, 300], [50, 330], [150, 372], [236, 430], [292, 540], [318, hem], [0, hem]]);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={`${id}bloom`}>
          <stop offset={0} stopColor={SKIN.face} stopOpacity={0.5} />
          <stop offset={0.35} stopColor={SKIN.halo} stopOpacity={0.22} />
          <stop offset={1} stopColor={SKIN.halo} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}face`} gradientUnits="userSpaceOnUse" cx={0} cy={-30} r={330}>
          <stop offset={0} stopColor={SKIN.face} />
          <stop offset={0.62} stopColor={SKIN.face} />
          <stop offset={1} stopColor={SKIN.faceShade} />
        </radialGradient>
        <radialGradient id={`${id}iris`}>
          <stop offset={0.3} stopColor="#e6c6d6" />
          <stop offset={0.75} stopColor={SKIN.iris} />
          <stop offset={1} stopColor={SKIN.irisDeep} />
        </radialGradient>
        <radialGradient id={`${id}blush`}>
          <stop offset={0} stopColor={SKIN.blush} stopOpacity={0.55} />
          <stop offset={1} stopColor={SKIN.blush} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}veil`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={SKIN.veil} stopOpacity={0.5} />
          <stop offset={1} stopColor={SKIN.veil} stopOpacity={0.22} />
        </linearGradient>
      </defs>
      {glow > 0 && <ellipse cx={0} cy={0} rx={560} ry={620} fill={`url(#${id}bloom)`} opacity={glow} />}
      {halo > 0 && (
        <g fill="none" stroke={SKIN.halo} strokeWidth={3}>
          {[0, 1, 2, 3, 4].map((i) => {
            const k = (i + ripple) / 5;
            return <circle key={i} cx={0} cy={-60} r={290 + k * 260} opacity={halo * 0.55 * (1 - k)} />;
          })}
        </g>
      )}
      <g transform={`rotate(${tilt} 0 300)`}>
        <path
          d={mirrorSmooth(
            full
              ? [[0, -300], [170, -290], [250, -150], [280, 120], [290, 420], [320, hem * 0.8], [400, hem], [0, hem]]
              : [[0, -300], [170, -290], [270, -150], [320, 120], [372, 420], [440, veilBottom * 0.92], [380, veilBottom], [0, veilBottom]],
          )}
          fill={`url(#${id}veil)`}
        />
        <g fill="none" stroke={SKIN.veilLine} strokeWidth={3} strokeLinecap="round" opacity={0.85}>
          {[-1, 1].map((s) => (
            <path key={s} d={`M${s * 170},-290 Q${s * 270},-150 ${s * 320},120 Q${s * 350},300 ${s * 372},420 Q${s * 400},600 ${s * 440},${veilBottom * 0.92}`} />
          ))}
          {[-1, 1].map((s) => (
            <path key={`i${s}`} d={`M${s * 150},-250 Q${s * 230},-80 ${s * 262},200 Q${s * 290},420 ${s * 330},${veilBottom}`} opacity={0.6} />
          ))}
        </g>
        <g fill={SKIN.veilLine} opacity={0.85}>
          {[-1, 1].map((s) =>
            [0, 1, 2, 3].map((k) => (
              <path
                key={`${s}${k}`}
                d={swirlPath({ x: s * (318 + k * 22), y: 60 + k * 150, rot: s > 0 ? 100 : 80, size: 18, w: 3.2, tail: 3, flip: s > 0, hook: 0.3 })}
              />
            )),
          )}
        </g>
        <path d={BACK_HAIR} fill={SKIN.hairDeep} />
      </g>
      <path d={dress} fill={SKIN.robe} />
      {/* skin of the neck and the open neckline */}
      <path d="M-44,230 L-46,360 Q0,430 46,360 L44,230 Z" fill={SKIN.faceShade} />
      <path d="M-46,330 Q0,372 46,330" stroke={SKIN.faceDeep} strokeWidth={3} fill="none" />
      {/* garment hairlines: wave curls along the neckline, drape lines */}
      <g fill="none" stroke={SKIN.robeLine} strokeWidth={3} strokeLinecap="round">
        <path d="M-150,372 Q0,500 150,372" />
        <path d={`M-236,440 Q-210,${Math.min(hem, 700) * 0.8} -250,${Math.min(hem, 700)} M236,440 Q210,${Math.min(hem, 700) * 0.8} 250,${Math.min(hem, 700)}`} />
        {hem > 700 &&
          [-1, 1].map((s) => (
            <path key={s} d={`M${s * 120},520 Q${s * 150},${hem * 0.6} ${s * 220},${hem}`} />
          ))}
      </g>
      <g fill={SKIN.robeLine}>
        {[-1, 1].map((s) =>
          [0, 1, 2].map((k) => (
            <path
              key={`${s}${k}`}
              d={swirlPath({ x: s * (40 + k * 46), y: 438 - k * 22 + k * k * 4, rot: s > 0 ? -18 : 198, size: 12, w: 3, tail: 2.2, flip: s < 0 })}
            />
          )),
        )}
      </g>
      <g fill="#eef0ff">
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const px = -110 + 220 * t;
          const py = 352 + 84 * (1 - (2 * t - 1) ** 2);
          return <circle key={i} cx={px} cy={py} r={i === 5 ? 9 : 5.5} />;
        })}
      </g>
      {arm && <Arm s={armSide} pose={arm} sx={full ? 176 : 200} />}
      <g transform={`rotate(${tilt} 0 300)`}>
        {([1, -1] as const).map((s) => (
          <path key={s} d={curtain(s)} fill={SKIN.hair} />
        ))}
        <path d={FACE} fill={`url(#${id}face)`} />
        <g fill="none" stroke={SKIN.hairLine} strokeWidth={2.4} strokeLinecap="round">
          {([1, -1] as const).map((s) => (
            <path
              key={s}
              d={`M${s * 30},-212 Q${s * 120},-190 ${s * 150},-60 Q${s * 160},120 ${s * 180},330 M${s * 60},-226 Q${s * 160},-200 ${s * 176},-40 Q${s * 182},140 ${s * 200},360`}
            />
          ))}
        </g>
        <ellipse cx={0} cy={64} rx={150} ry={36} fill={`url(#${id}blush)`} opacity={face.blush} />
        {/* moon-silver mukuta: a lotus bud on a band, keri curls at the sides */}
        <g fill="#e2e2f6" stroke="#7a74a8" strokeWidth={2.2} strokeLinejoin="round">
          <path d="M-122,-236 Q0,-288 122,-236 L114,-260 Q0,-310 -114,-260 Z" />
          <path d="M0,-400 Q-46,-346 -30,-292 L30,-292 Q46,-346 0,-400Z" />
          <path d="M0,-372 Q-18,-334 0,-300 Q18,-334 0,-372Z" fill="#f8f7ff" />
          {[-1, 1].map((k) => (
            <path
              key={k}
              d={`M${k * 40},-292 Q${k * 52},-330 ${k * 84},-338 Q${k * 106},-336 ${k * 100},-316 Q${k * 92},-302 ${k * 78},-312 Q${k * 74},-300 ${k * 96},-282 Z`}
            />
          ))}
        </g>
        <circle cx={0} cy={-264} r={8} fill="#f6f4ff" stroke="#7a74a8" strokeWidth={2} />
        {([1, -1] as const).map((s) => (
          <g key={s}>
            <Brow s={s} f={face} />
            <Eye s={s} f={face} blink={blink} id={id} />
          </g>
        ))}
        <path d="M10,-26 Q4,60 -4,138 Q4,148 16,144" stroke={SKIN.line} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <Mouth f={face} open={mouth ?? face.mouthOpen} round={round} />
      </g>
    </g>
  );
};
