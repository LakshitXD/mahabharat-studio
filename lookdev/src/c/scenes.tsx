import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Arrow, CoolCorners, Halo, LotusThicket, NightSky, Petal, SepiaSky, WarmCorners} from './backdrops';
import {ArmPose, Ganga, Shantanu, kingHandPoint} from './Characters';
import {EXPRESSIONS, EXPRESSION_RIGS, Expression, FaceRig, Speech, Viseme, mixRig} from './face';
import {COOL, Frame, H, W, WARM, spiralPath} from './style';

const River: React.FC<{t: number}> = ({t}) => {
  const top = 800;
  const rows = [830, 870, 915, 965, 1020];
  return (
    <g>
      <defs>
        <linearGradient id="c-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a4234" />
          <stop offset="0.35" stopColor={WARM.cloud} />
          <stop offset="1" stopColor={WARM.cloudDeep} />
        </linearGradient>
      </defs>
      <path d={`M0,${top} C400,${top - 14} 1400,${top - 14} ${W},${top} L${W},${H} L0,${H} Z`} fill="url(#c-river)" />
      <path d={`M0,${top} C400,${top - 14} 1400,${top - 14} ${W},${top}`} fill="none" stroke={WARM.wallLight} strokeWidth={3} opacity={0.8} />
      <g fill="none" stroke="#a8604c" strokeLinecap="round">
        {rows.map((y, r) => {
          const amp = 6 + r * 2;
          const len = 150 + r * 40;
          const off = ((t * (1.2 + r * 0.3) + r * 97) % len) - len;
          const segs: string[] = [];
          for (let x = off; x < W + len; x += len) {
            segs.push(`M${x},${y} q${len * 0.25},${-amp} ${len * 0.5},0 t${len * 0.5},0`);
          }
          return <path key={y} d={segs.join(' ')} strokeWidth={2.4 + r * 0.4} opacity={0.75 - r * 0.08} />;
        })}
        {[260, 700, 1150, 1700].map((x, i) => (
          <path key={x} d={spiralPath(x + ((t * 1.5) % 40), 900 + (i % 2) * 70, 16 + i * 2, 1.2, i % 2 ? 1 : -1, 0, 40)} strokeWidth={2.6} opacity={0.7} />
        ))}
      </g>
    </g>
  );
};

const Bank: React.FC = () => (
  <g>
    <path d="M0,830 C200,812 480,804 700,818 C780,824 830,852 850,890 C870,940 910,990 990,1080 L0,1080 Z" fill={WARM.ink} />
    <g fill="none" stroke={WARM.cream} strokeWidth={2.4} strokeLinecap="round" opacity={0.9}>
      <path d="M700,818 C780,824 830,852 850,890 C870,940 910,990 990,1080" />
    </g>
  </g>
);

const shikhara = (x: number, base: number, h: number) => {
  const w = h * 0.34;
  return `M${x - w},${base} C${x - w},${base - h * 0.5} ${x - w * 0.55},${base - h * 0.85} ${x - w * 0.22},${base - h * 0.9} L${x - w * 0.4},${base - h * 0.95} L${x + w * 0.4},${base - h * 0.95} L${x + w * 0.22},${base - h * 0.9} C${x + w * 0.55},${base - h * 0.85} ${x + w},${base - h * 0.5} ${x + w},${base} Z M${x},${base - h * 0.95} L${x},${base - h * 1.06}`;
};

const FarBank: React.FC = () => {
  const base = 800;
  const fill = '#8e4a3c';
  const line = '#b5715a';
  return (
    <g>
      <path d={`M0,${base} L0,${base - 30} C300,${base - 50} 700,${base - 40} 980,${base - 30} C1300,${base - 22} 1600,${base - 48} ${W},${base - 36} L${W},${base} Z`} fill={fill} />
      {[
        [1060, 120],
        [1110, 70],
        [1000, 60],
        [1650, 90],
        [1700, 54],
      ].map(([x, h], i) => (
        <path key={i} d={shikhara(x, base - 26, h)} fill={fill} stroke={line} strokeWidth={2.2} strokeLinejoin="round" />
      ))}
      <path d={`M0,${base - 30} C300,${base - 50} 700,${base - 40} 980,${base - 30} C1300,${base - 22} 1600,${base - 48} ${W},${base - 36}`} fill="none" stroke={line} strokeWidth={2.2} />
    </g>
  );
};

export const Wide: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Frame bg={WARM.wallMid}>
      <SepiaSky cx={980} cy={600} />
      <WarmCorners dx={t * 0.6} mid={false} />
      <FarBank />
      <River t={t} />
      <g>
        <ellipse cx={1380} cy={905} rx={170} ry={18} fill="none" stroke={COOL.pale} strokeWidth={2.4} opacity={0.65} />
        <ellipse cx={1380} cy={912} rx={250} ry={28} fill="none" stroke={COOL.pale} strokeWidth={1.8} opacity={0.35} />
      </g>
      <Ganga id="gw" x={1380} y={395} scale={0.6} full t={t} turn={-0.55} expression="smile" headTilt={-5} armL={{shoulder: 28, elbow: 48}} armR={{shoulder: -4, elbow: -24}} holdLotus />
      <Bank />
      <Shantanu id="sw" x={520} y={350} scale={0.6} full turn={0.6} expression="surprised" headTilt={4} armR={{shoulder: -40, elbow: -42}} armL={{shoulder: 4, elbow: 0}} />
      <Arrow x1={110} y1={1030} x2={700} y2={958} w={9} />
    </Frame>
  );
};

const CLOSE_ARM: ArmPose = {shoulder: 14, elbow: 96};

export const ShantanuClose: React.FC = () => {
  const t = useCurrentFrame();
  const [hx, hy] = kingHandPoint(960, 300, 2.1, 1, CLOSE_ARM);
  const k = 0.82;
  return (
    <Frame bg={WARM.wallMid}>
      <SepiaSky cx={900} cy={560} />
      <WarmCorners dx={t * 0.6} low />
      <Shantanu id="sc" x={960} y={300} scale={2.1} expression="determined" armR={CLOSE_ARM} grip />
      <Arrow x1={hx - 1000} y1={hy - 1000 * k} x2={hx + 260} y2={hy + 260 * k} w={16} />
    </Frame>
  );
};

const GangaNight: React.FC<{t: number; face: Partial<React.ComponentProps<typeof Ganga>>}> = ({t, face}) => (
  <Frame bg={COOL.violet}>
    <NightSky />
    <CoolCorners dx={t * 1.2} />
    <LotusThicket side={1} t={t} />
    <LotusThicket side={-1} t={t + 40} />
    {[
      [300, 260, 30, 20],
      [1650, 520, 26, -30],
      [420, 780, 22, 60],
      [1530, 180, 18, 110],
      [1780, 820, 24, 200],
      [150, 560, 16, -70],
    ].map(([x, y, s, r], i) => (
      <Petal key={i} x={x + Math.sin((t + i * 30) * 0.04) * 10} y={y + ((t * 0.8 + i * 20) % 60) - 30} s={s} rot={r + t * 0.5} opacity={0.85} />
    ))}
    <Halo x={960} y={380} r={400} t={t} />
    <Ganga id="gc" x={960} y={360} scale={3.3} t={t} {...face} />
  </Frame>
);

export const GangaClose: React.FC = () => {
  const t = useCurrentFrame();
  return <GangaNight t={t} face={{expression: 'neutral', turn: 0.15, headTilt: -2}} />;
};

const CELL = W / 9;

export const Expressions: React.FC = () => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{display: 'block'}}>
    <defs>
      <linearGradient id="c-xcool" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={COOL.violet} />
        <stop offset="1" stopColor={COOL.indigo2} />
      </linearGradient>
      <linearGradient id="c-xwarm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={WARM.glow} />
        <stop offset="1" stopColor={WARM.wallMid} />
      </linearGradient>
      {EXPRESSIONS.map((_, i) => (
        <React.Fragment key={i}>
          <clipPath id={`c-xg${i}`}>
            <rect x={i * CELL + 3} y={0} width={CELL - 6} height={540} />
          </clipPath>
          <clipPath id={`c-xs${i}`}>
            <rect x={i * CELL + 3} y={540} width={CELL - 6} height={540} />
          </clipPath>
        </React.Fragment>
      ))}
    </defs>
    <rect width={W} height={540} fill="url(#c-xcool)" />
    <rect y={540} width={W} height={540} fill="url(#c-xwarm)" />
    {EXPRESSIONS.map((e, i) => (
      <g key={e}>
        <g clipPath={`url(#c-xg${i})`}>
          <Ganga id={`xg${i}`} x={i * CELL + CELL / 2} y={200} scale={1.45} expression={e} ink={1.5} />
          <rect x={i * CELL} y={474} width={CELL} height={66} fill={COOL.nightDeep} opacity={0.92} />
        </g>
        <g clipPath={`url(#c-xs${i})`}>
          <Shantanu id={`xs${i}`} x={i * CELL + CELL / 2} y={730} scale={1.6} expression={e} ink={1.45} />
          <rect x={i * CELL} y={1012} width={CELL} height={68} fill={WARM.cloudDeep} opacity={0.92} />
        </g>
        <text x={i * CELL + CELL / 2} y={518} textAnchor="middle" fontFamily="serif" fontSize={30} fill={COOL.pale} letterSpacing={2}>
          {e}
        </text>
        <text x={i * CELL + CELL / 2} y={1056} textAnchor="middle" fontFamily="serif" fontSize={30} fill={WARM.cream} letterSpacing={2}>
          {e}
        </text>
      </g>
    ))}
  </svg>
);

type Key = {f: number; e: Expression};
const EXPR_KEYS: Key[] = [
  {f: 0, e: 'neutral'},
  {f: 24, e: 'neutral'},
  {f: 32, e: 'smile'},
  {f: 54, e: 'smile'},
  {f: 63, e: 'sad'},
  {f: 90, e: 'sad'},
];

const rigAt = (f: number): FaceRig => {
  for (let i = 0; i < EXPR_KEYS.length - 1; i++) {
    const a = EXPR_KEYS[i];
    const b = EXPR_KEYS[i + 1];
    if (f >= a.f && f <= b.f) {
      const u = (f - a.f) / Math.max(1, b.f - a.f);
      const ease = u * u * (3 - 2 * u);
      return mixRig(EXPRESSION_RIGS[a.e], EXPRESSION_RIGS[b.e], ease);
    }
  }
  return EXPRESSION_RIGS[EXPR_KEYS[EXPR_KEYS.length - 1].e];
};

const BLINKS = [16, 52, 80];
const blinkAt = (f: number) => {
  for (const b of BLINKS) {
    const d = f - b;
    if (d >= 0 && d < 6) return [0.5, 1, 1, 0.6, 0.25, 0][d];
  }
  return 0;
};

const LINE: [number, Viseme][] = [
  [4, 'MBP'], [7, 'AI'], [10, 'E'], [13, 'O'], [16, 'MBP'], [19, 'AI'], [22, 'FV'], [25, 'E'], [28, 'AI'], [31, 'MBP'], [34, 'O'], [37, 'E'], [40, 'AI'], [44, 'MBP'],
  [64, 'AI'], [67, 'O'], [70, 'FV'], [73, 'E'], [76, 'MBP'], [79, 'AI'], [82, 'O'], [86, 'MBP'],
];
const speechAt = (f: number): Speech | undefined => {
  for (let i = 0; i < LINE.length - 1; i++) {
    const [fa, va] = LINE[i];
    const [fb] = LINE[i + 1];
    if (f >= fa && f < fb && fb - fa <= 4) {
      const u = (f - fa) / (fb - fa);
      return {viseme: va, amount: va === 'MBP' ? 1 : Math.sin(Math.PI * (0.35 + 0.65 * u))};
    }
  }
  return undefined;
};

export const Motion: React.FC = () => {
  const f = useCurrentFrame();
  return <GangaNight t={f} face={{rig: rigAt(f), blink: blinkAt(f), speech: speechAt(f), turn: 0.15 + Math.sin(f * 0.05) * 0.1, headTilt: -2 + Math.sin(f * 0.07) * 1.5}} />;
};
