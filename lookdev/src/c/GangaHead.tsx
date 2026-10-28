import React from 'react';
import {FaceInput, FaceRig, lerp, mouthGeom, resolveRig} from './face';
import {COOL, FACE} from './style';

export type HeadProps = FaceInput & {id: string; ink?: number; t?: number; veil?: boolean; showNeck?: boolean};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const eyePaths = (rig: FaceRig, s: -1 | 1, ew: number, upMax: number, loMax: number) => {
  const inner: [number, number] = [-s * ew, 1.5];
  const outer: [number, number] = [s * ew, -0.5];
  const loC = loMax * (1 - 0.85 * rig.lidLower);
  const upC = lerp(loC, -upMax, rig.lidOpen);
  const upper = `M${outer[0]},${outer[1]} C${s * ew * 0.55},${upC} ${-s * ew * 0.5},${upC * 0.95} ${inner[0]},${inner[1]}`;
  const lower = `C${-s * ew * 0.45},${loC} ${s * ew * 0.5},${loC} ${outer[0]},${outer[1]}`;
  return {upper, shape: `${upper} ${lower} Z`, lowerOnly: `M${inner[0]},${inner[1]} ${lower}`, upC, loC, inner, outer};
};

const browPath = (rig: FaceRig, s: -1 | 1, k: {x0: number; x1: number; y: number; arch: number; lift: number; tilt: number; asym: number}) => {
  const base = k.y - rig.browLift * k.lift - rig.browAsym * s * k.asym;
  const yi = base - rig.browTilt * k.tilt;
  const yo = base + rig.browTilt * k.tilt * 0.35;
  const arch = k.arch * (1 - 0.5 * Math.abs(rig.browTilt));
  const xi = s * k.x0;
  const xo = s * k.x1;
  return `M${xi},${yi} C${lerp(xi, xo, 0.35)},${lerp(yi, yo, 0.35) - arch} ${lerp(xi, xo, 0.7)},${lerp(yi, yo, 0.7) - arch} ${xo},${yo}`;
};

export const GangaHead: React.FC<HeadProps> = (props) => {
  const {id, ink = 1, t = 0, turn = 0, veil = true, showNeck = true} = props;
  const rig = resolveRig(props);
  const T = clamp(turn, -1, 1);
  const fx = T * 15;
  const sw = (n: number) => n * ink;
  const flow = Math.sin(t * 0.07) * 4;

  const eye = (s: -1 | 1) => {
    const squash = 1 - 0.32 * Math.max(0, s * T);
    const grow = 1 + 0.06 * Math.max(0, -s * T);
    const cx = s * 30 + fx * (s * T > 0 ? 1.15 : 0.85);
    const e = eyePaths(rig, s, 17, 14.5, 9.5);
    const irisR = 9.6 * (0.55 + 0.45 * rig.pupil);
    const ix = rig.gazeX * 5.5 + T * 2;
    const iy = 0.5 + rig.gazeY * 4;
    const open = e.loC - e.upC > 1.2;
    const clip = `${id}-eye${s}`;
    return (
      <g transform={`translate(${cx} 0) scale(${squash * grow} ${grow})`}>
        <defs>
          <clipPath id={clip}>
            <path d={e.shape} />
          </clipPath>
        </defs>
        {open && (
          <>
            <path d={e.shape} fill="#fffdfe" />
            <g clipPath={`url(#${clip})`}>
              <circle cx={ix} cy={iy} r={irisR} fill={FACE.iris} />
              <circle cx={ix} cy={iy} r={irisR * 0.66 * (0.5 + 0.5 * rig.pupil)} fill={FACE.pupil} />
              <circle cx={ix - irisR * 0.38} cy={iy - irisR * 0.36} r={irisR * 0.27} fill="#ffffff" />
              <path d={e.upper} fill="none" stroke={FACE.ink} strokeWidth={sw(5)} opacity={0.22} transform="translate(0 2)" />
            </g>
          </>
        )}
        <path d={e.lowerOnly} fill="none" stroke={FACE.ink} strokeWidth={sw(0.9)} opacity={open ? 0.55 : 0} strokeLinecap="round" />
        <path d={e.upper} fill="none" stroke={FACE.lash} strokeWidth={sw(2.7)} strokeLinecap="round" />
        <path d={`M${e.outer[0]},${e.outer[1]} q${s * 3},${-1.5} ${s * 5},${-3.5}`} fill="none" stroke={FACE.lash} strokeWidth={sw(2)} strokeLinecap="round" />
        {open && rig.lidOpen > 0.45 && (
          <path d={e.upper} fill="none" stroke={FACE.ink} strokeWidth={sw(0.9)} transform={`translate(${s * 1} ${-5 - 2 * (rig.lidOpen - 1)}) scale(0.9 1)`} opacity={0.7} strokeLinecap="round" />
        )}
      </g>
    );
  };

  const brow = (s: -1 | 1) => (
    <path
      d={browPath(rig, s, {x0: 10, x1: 48, y: -27, arch: 4.5, lift: 9, tilt: 9, asym: 7})}
      transform={`translate(${fx} 0) scale(${s * T > 0 ? 1 - 0.3 * s * T : 1} 1)`}
      fill="none"
      stroke={FACE.ink}
      strokeWidth={sw(1.5)}
      strokeLinecap="round"
    />
  );

  const m = mouthGeom(rig, 10.5, 15, 5.5);
  const mx = fx * 1.15;
  const my = 54;
  const chinX = T * 12;

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-skin`} cx="0.5" cy="0.38" r="0.62">
          <stop offset="0" stopColor={FACE.light} />
          <stop offset="0.62" stopColor={FACE.light} />
          <stop offset="1" stopColor={FACE.edge} />
        </radialGradient>
        <radialGradient id={`${id}-blush`}>
          <stop offset="0" stopColor={FACE.blush} stopOpacity={0.75} />
          <stop offset="0.6" stopColor={FACE.blush} stopOpacity={0.35} />
          <stop offset="1" stopColor={FACE.blush} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#857288" />
          <stop offset="0.4" stopColor="#ad99ad" />
          <stop offset="1" stopColor="#d3c5d3" />
        </linearGradient>
        <clipPath id={`${id}-mouth`}>
          <path d={m.outline} />
        </clipPath>
      </defs>

      {veil && (
        <g>
          <path
            d={`M-70,-72 C-68,-124 68,-124 70,-72 C98,10 128,160 ${158 + flow},330 L${-158 - flow},330 C-128,160 -98,10 -70,-72 Z`}
            fill={COOL.pale}
            opacity={0.22}
          />
          <g fill="none" stroke={COOL.pale} strokeWidth={sw(1.4)} opacity={0.75} strokeLinecap="round">
            <path d={`M-70,-72 C-98,10 -128,160 ${-158 - flow},330`} />
            <path d={`M70,-72 C98,10 128,160 ${158 + flow},330`} />
            <path d={`M-58,-40 C-80,60 -100,170 ${-118 - flow * 0.6},330`} opacity={0.5} />
            <path d={`M58,-40 C80,60 100,170 ${118 + flow * 0.6},330`} opacity={0.5} />
          </g>
        </g>
      )}

      <path transform={`translate(${-T * 5} 0)`} d="M-72,-56 C-74,-106 74,-106 72,-56 L84,310 L-84,310 Z" fill={COOL.hood} />

      {showNeck && <path d={`M${-11 + chinX * 0.4},80 L${-13},190 L13,190 L${11 + chinX * 0.4},80 Z`} fill={`url(#${id}-neck)`} />}

      <path
        d={`M-56,-62 L56,-62 C${58 - T * 3},-10 ${58 - T * 4},20 ${57 - T * 5},36 C${52 - T * 4},66 ${25 + chinX},98 ${chinX},110 C${-25 + chinX},98 ${-52 - T * 2},66 ${-57 - T * 1},36 C-58,20 -58,-10 -56,-62 Z`}
        fill={`url(#${id}-skin)`}
        stroke={FACE.ink}
        strokeWidth={sw(1.3)}
      />

      <ellipse cx={fx * 0.9} cy={21} rx={58} ry={13} fill={`url(#${id}-blush)`} opacity={clamp(rig.blush, 0, 1)} />

      {brow(-1)}
      {brow(1)}
      {eye(-1)}
      {eye(1)}

      <path
        d={`M${fx * 0.85 - 3},-6 C${fx * 0.95 - 3},8 ${fx * 1.1 - 6},26 ${fx * 1.12 - 6},37 C${fx * 1.12 - 4},40 ${fx * 1.15 + 3},40 ${fx * 1.15 + 8 + T * 6},37`}
        fill="none"
        stroke={FACE.ink}
        strokeWidth={sw(1.3)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g transform={`translate(${mx} ${my})`}>
        {m.open > 0.04 ? (
          <>
            <path d={m.outline} fill={FACE.mouth} />
            <g clipPath={`url(#${id}-mouth)`}>
              <rect x={-40} y={-20} width={80} height={20 + rig.teeth * (2.5 + m.open * 3)} fill="#fbf6f7" opacity={rig.teeth > 0.05 ? 1 : 0} />
              <ellipse cx={0} cy={m.lowerY + 4} rx={7} ry={4} fill="#b0607a" opacity={0.6} />
            </g>
            <path d={m.outline} fill="none" stroke={FACE.ink} strokeWidth={sw(1.1)} strokeLinejoin="round" />
            <path d={m.upperLine} fill="none" stroke={FACE.lip} strokeWidth={sw(2.6)} strokeLinecap="round" />
          </>
        ) : (
          <>
            <path
              d={`${m.upperLine} C${m.right[0] * 0.55},${m.right[1] - 2.5} ${2.5},${m.midY - 4.2} ${rig.mouthSkew * 3},${m.midY - 2.6} C${-2.5},${m.midY - 4.2} ${m.left[0] * 0.55},${m.left[1] - 2.5} ${m.left[0]},${m.left[1]} Z`}
              fill={FACE.lip}
            />
            <path d={m.upperLine} fill="none" stroke={FACE.ink} strokeWidth={sw(1.2)} strokeLinecap="round" />
            <path
              d={`M${-4.5 + rig.mouthSkew * 3},${6.5 + Math.max(0, rig.mouthCurve) * 0.8} Q${rig.mouthSkew * 3},${8 + Math.max(0, rig.mouthCurve) * 1.2} ${4.5 + rig.mouthSkew * 3},${6.5 + Math.max(0, rig.mouthCurve) * 0.8}`}
              fill="none"
              stroke={FACE.lip}
              strokeWidth={sw(1.8)}
              strokeLinecap="round"
              opacity={0.7}
            />
          </>
        )}
        {rig.mouthCurve > 0.5 && (
          <g fill="none" stroke={FACE.ink} strokeWidth={sw(0.9)} strokeLinecap="round" opacity={0.6}>
            <path d={`M${m.left[0] - 2},${m.left[1] - 2} q-2,2 -1,5`} />
            <path d={`M${m.right[0] + 2},${m.right[1] - 2} q2,2 1,5`} />
          </g>
        )}
      </g>

      <g transform={`translate(${T * 4} 0)`}>
        <path d="M0,-66 C-24,-64 -46,-52 -54,-24 C-57,0 -57,30 -58,60 C-60,120 -60,200 -56,320 L-86,320 C-88,180 -86,0 -80,-50 C-72,-88 -32,-94 0,-92 Z" fill={COOL.hair} />
        <path d="M0,-66 C24,-64 46,-52 54,-24 C57,0 57,30 58,60 C60,120 60,200 56,320 L86,320 C88,180 86,0 80,-50 C72,-88 32,-94 0,-92 Z" fill={COOL.hair} />
        <path d="M0,-66 C-24,-64 -46,-52 -54,-24 C-57,0 -57,30 -58,60 C-60,120 -60,200 -56,320 L-67,320 C-71,200 -69,120 -67,60 C-65,20 -64,-10 -61,-30 C-53,-60 -26,-75 0,-76 Z" fill={COOL.hairLight} />
        <path d="M0,-66 C24,-64 46,-52 54,-24 C57,0 57,30 58,60 C60,120 60,200 56,320 L67,320 C71,200 69,120 67,60 C65,20 64,-10 61,-30 C53,-60 26,-75 0,-76 Z" fill={COOL.hairLight} />
        <g fill="none" stroke={COOL.hairLine} strokeWidth={sw(1.2)} strokeLinecap="round" opacity={0.9}>
          <path d="M-6,-82 C-30,-78 -60,-62 -68,-20 C-71,40 -72,160 -70,300" />
          <path d="M-14,-88 C-44,-84 -72,-62 -77,-10 C-79,80 -78,200 -77,310" opacity={0.6} />
          <path d="M6,-82 C30,-78 60,-62 68,-20 C71,40 72,160 70,300" />
          <path d="M14,-88 C44,-84 72,-62 77,-10 C79,80 78,200 77,310" opacity={0.6} />
        </g>
        <g fill="none" stroke={COOL.pale} strokeWidth={sw(1.3)} strokeLinecap="round">
          <path d="M-38,-80 C-20,-90 20,-90 38,-80" opacity={0.8} />
          {[-30, -18, -6, 6, 18, 30].map((x) => (
            <circle key={x} cx={x} cy={-85 - Math.cos(x / 22) * 3} r={1.6} fill={COOL.pale} stroke="none" />
          ))}
          <g transform="translate(0 -90) scale(0.62) translate(0 90)">
            <path d="M0,-90 C-7,-98 -6,-110 0,-118 C6,-110 7,-98 0,-90 Z" fill={COOL.blossom} />
            <path d="M-2,-91 C-12,-94 -18,-104 -17,-110 C-10,-108 -4,-100 -2,-91 Z M2,-91 C12,-94 18,-104 17,-110 C10,-108 4,-100 2,-91 Z" fill={COOL.blossom} />
          </g>
        </g>
      </g>
      <circle cx={fx * 0.85 - 2} cy={-14} r={2} fill="#7a5aa0" opacity={0.8} />
    </g>
  );
};
