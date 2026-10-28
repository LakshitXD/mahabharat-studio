import React from 'react';
import {FaceRig, lerp, mouthGeom, resolveRig} from './face';
import type {HeadProps} from './GangaHead';
import {WARM, spiralPath} from './style';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const slit = (rig: FaceRig, s: -1 | 1) => {
  const ew = 14;
  const inner: [number, number] = [-s * ew, 1.5];
  const outer: [number, number] = [s * ew, -2.5];
  const loC = 4.5 * (1 - 0.8 * rig.lidLower);
  const upC = lerp(loC, -6.5, rig.lidOpen);
  const upper = `M${outer[0]},${outer[1]} C${s * ew * 0.5},${upC} ${-s * ew * 0.5},${upC} ${inner[0]},${inner[1]}`;
  const shape = `${upper} C${-s * ew * 0.4},${loC} ${s * ew * 0.5},${loC} ${outer[0]},${outer[1]} Z`;
  return {upper, shape, upC, loC, outer};
};

export const ShantanuHead: React.FC<Omit<HeadProps, 'veil' | 'showNeck'>> = (props) => {
  const {id, ink = 1, turn = 0} = props;
  const rig = resolveRig(props);
  const T = clamp(turn, -1, 1);
  const fx = T * 12;
  const sw = (n: number) => n * ink;
  const C = WARM.cream;

  const eye = (s: -1 | 1) => {
    const e = slit(rig, s);
    const squash = 1 - 0.3 * Math.max(0, s * T);
    const cx = s * 24 + fx * (s * T > 0 ? 1.1 : 0.9);
    const open = e.loC - e.upC > 1;
    const clip = `${id}-slit${s}`;
    const pr = 3.1 * (0.55 + 0.45 * rig.pupil);
    return (
      <g transform={`translate(${cx} 0) scale(${squash} 1)`}>
        <defs>
          <clipPath id={clip}>
            <path d={e.shape} />
          </clipPath>
        </defs>
        {open && (
          <>
            <path d={e.shape} fill={C} />
            <circle clipPath={`url(#${clip})`} cx={rig.gazeX * 6 + T * 2} cy={0.5 + rig.gazeY * 2.5} r={pr} fill={WARM.ink} />
          </>
        )}
        <path d={e.upper} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round" />
        <path d={`M${e.outer[0]},${e.outer[1]} q${s * 4},${-1} ${s * 8},${-4}`} fill="none" stroke={C} strokeWidth={sw(1.6)} strokeLinecap="round" />
        <path d={`M${-s * 9},${10 - rig.lidLower * 3} q${s * 9},${3} ${s * 18},${-1}`} fill="none" stroke={C} strokeWidth={sw(1)} strokeLinecap="round" opacity={0.7} />
      </g>
    );
  };

  const brow = (s: -1 | 1) => {
    const base = -15 - rig.browLift * 9 - rig.browAsym * s * 8;
    const yi = base - rig.browTilt * 11;
    const yo = base + rig.browTilt * 3;
    const xi = s * 7;
    const xo = s * 36;
    return (
      <path
        transform={`translate(${fx} 0) scale(${s * T > 0 ? 1 - 0.3 * s * T : 1} 1)`}
        d={`M${xi},${yi} C${lerp(xi, xo, 0.35)},${lerp(yi, yo, 0.35) - 3} ${lerp(xi, xo, 0.7)},${lerp(yi, yo, 0.7) - 3} ${xo},${yo} q${s * 4},${2} ${s * 3},${6}`}
        fill="none"
        stroke={C}
        strokeWidth={sw(2.8)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const mus = (s: -1 | 1) => {
    const lift = -s * rig.mouthCurve * 14 + s * rig.mouthSkew * 8;
    return (
      <g transform={`translate(${fx * 1.1} 0) rotate(${lift} ${s * 2} 29)`} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round">
        <path d={`M${s * 1},28 C${s * 10},24 ${s * 20},27 ${s * 28},32 C${s * 34},35 ${s * 38},31 ${s * 37},25`} />
        <path d={spiralPath(s * 33, 26, 4.4, 1.15, s === 1 ? -1 : 1, s === 1 ? 0 : Math.PI)} />
        <path d={`M${s * 1},33 C${s * 9},33 ${s * 18},35 ${s * 27},37`} />
      </g>
    );
  };

  const m = mouthGeom(rig, 12, 18, 4.5);

  return (
    <g>
      <path
        transform={`translate(${T * 3} 0)`}
        d="M-57,-50 C-63,-58 -62,-70 -54,-74 C-46,-66 -38,-63 -28,-64 C-18,-72 -10,-80 0,-87 C10,-80 18,-72 28,-64 C38,-63 46,-66 54,-74 C62,-70 63,-58 57,-50 L50,-40 L49,-30 C47,0 48,24 51,46 C54,66 62,82 76,98 L-76,98 C-62,82 -54,66 -51,46 C-48,24 -47,0 -49,-30 L-50,-40 Z"
        fill={WARM.ink}
      />
      <g transform={`translate(${T * 3} 0)`} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round" strokeLinejoin="round">
        <path d="M-50,-40 L50,-40 M-49,-29 L49,-29" />
        <path d="M-46,-31 L-40,-38 L-34,-31 L-28,-38 L-22,-31 L-16,-38 L-10,-31 L-4,-38 L2,-31 L8,-38 L14,-31 L20,-38 L26,-31 L32,-38 L38,-31 L44,-38" strokeWidth={sw(1.2)} />
        <path d="M-44,-42 C-34,-52 -14,-62 0,-74 C14,-62 34,-52 44,-42" />
        <path d="M-52,-52 C-50,-58 -51,-64 -54,-68 M52,-52 C50,-58 51,-64 54,-68" strokeWidth={sw(1.2)} />
        <path d="M0,-42 L0,-66" />
        <path d="M-30,-44 C-24,-50 -20,-54 -14,-56 M30,-44 C24,-50 20,-54 14,-56" strokeWidth={sw(1.2)} />
      </g>
      <g transform={`translate(${fx * 0.9} 0)`} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round">
        <path d="M-5,-27 C-5,-20 -3,-15 0,-13 C3,-15 5,-20 5,-27" />
      </g>
      {brow(-1)}
      {brow(1)}
      {eye(-1)}
      {eye(1)}
      <g transform={`translate(${fx * 1.05} 0)`} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M-2,-4 L${-7 - T * 2},20 Q${-1 + T * 4},26 ${7 + T * 6},21`} />
      </g>
      <g transform={`translate(${fx * 1.1} 55)`}>
        {m.open > 0.04 ? (
          <>
            <defs>
              <clipPath id={`${id}-mouth`}>
                <path d={m.outline} />
              </clipPath>
            </defs>
            <rect clipPath={`url(#${id}-mouth)`} x={-40} y={-20} width={80} height={20 + rig.teeth * (3 + m.open * 3)} fill={C} opacity={rig.teeth > 0.05 ? 1 : 0} />
            <path d={m.outline} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinejoin="round" />
          </>
        ) : (
          <path d={m.upperLine} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round" />
        )}
      </g>
      {mus(-1)}
      {mus(1)}
      <g transform={`translate(${fx * 0.6} 0)`} fill="none" stroke={C} strokeWidth={sw(1.8)} strokeLinecap="round">
        <path d={`M0,${70 + Math.max(0, rig.mouthOpen) * 6} L0,98`} />
        <path d="M-40,-26 C-42,0 -41,30 -31,56 C-23,74 -11,86 0,94" />
        <path d="M40,-26 C42,0 41,30 31,56 C23,74 11,86 0,94" />
        <path d="M-14,72 C-13,80 -10,86 -6,90 M14,72 C13,80 10,86 6,90" opacity={0.6} strokeWidth={sw(1.2)} />
      </g>
    </g>
  );
};
