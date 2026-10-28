import React, { useId } from 'react';
import { Mood } from './palette';
import { Pt, SpiralSpec, swirlPath } from './geom';

export const W = 1920;
export const H = 1080;

export const useSvgId = (p: string) => p + useId().replace(/[^a-zA-Z0-9]/g, '');

/** Radial colour field: hot core behind the subject falling to dark corners. */
export const Ground: React.FC<{ mood: Mood; c: Pt; rx: number; ry: number }> = ({ mood, c, rx, ry }) => {
  const id = useSvgId('ground');
  const n = mood.ground.length;
  return (
    <>
      <defs>
        <radialGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          cx={0}
          cy={0}
          r={1}
          gradientTransform={`translate(${c[0]} ${c[1]}) scale(${rx} ${ry})`}
        >
          {mood.ground.map((col, i) => (
            <stop key={i} offset={(i / n) * 0.82 + (i ? 0.04 : 0)} stopColor={col} />
          ))}
          <stop offset={1} stopColor={mood.corner} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

export type Shaft = { angle: number; spread: number; len: number; opacity: number };

/** Faint rubbed light streaks fanning out of the glow core. */
export const Shafts: React.FC<{ mood: Mood; c: Pt; shafts: readonly Shaft[] }> = ({ mood, c, shafts }) => {
  const id = useSvgId('shaft');
  return (
    <>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={c[0]} cy={c[1]} r={1100}>
          <stop offset={0} stopColor={mood.shaft} stopOpacity={1} />
          <stop offset={0.55} stopColor={mood.shaft} stopOpacity={0.5} />
          <stop offset={1} stopColor={mood.shaft} stopOpacity={0} />
        </radialGradient>
      </defs>
      {shafts.map((s, i) => {
        const a0 = ((s.angle - s.spread / 2) * Math.PI) / 180;
        const a1 = ((s.angle + s.spread / 2) * Math.PI) / 180;
        const d = `M${c[0]} ${c[1]}L${c[0] + Math.cos(a0) * s.len} ${c[1] + Math.sin(a0) * s.len}L${
          c[0] + Math.cos(a1) * s.len
        } ${c[1] + Math.sin(a1) * s.len}Z`;
        return <path key={i} d={d} fill={`url(#${id})`} opacity={s.opacity} />;
      })}
    </>
  );
};

export type Lobe = { x: number; y: number; r: number };

export type CloudBankSpec = {
  lobes: readonly Lobe[];
  /** offset of the airbrushed shadow band */
  shadow: Pt;
  spirals: readonly SpiralSpec[];
  far?: boolean;
};

const SoftLobes: React.FC<{ lobes: readonly Lobe[]; fill: string; feather: number; dx?: number; dy?: number }> = ({
  lobes,
  fill,
  feather,
  dx = 0,
  dy = 0,
}) => (
  <>
    {lobes.map((l, i) => (
      <circle key={i} cx={l.x + dx} cy={l.y + dy} r={l.r * (1 + feather)} fill={fill} />
    ))}
  </>
);

/** Opaque white to r, fading out over the feather ring (objectBoundingBox, so per-lobe). */
const SoftStops: React.FC<{ id: string; feather: number; peak?: number }> = ({ id, feather, peak = 1 }) => {
  const k = 1 / (1 + feather);
  return (
    <radialGradient id={id}>
      <stop offset={0} stopColor="#fff" stopOpacity={peak} />
      <stop offset={k * 0.97} stopColor="#fff" stopOpacity={peak} />
      <stop offset={Math.min(0.99, k + (1 - k) * 0.25)} stopColor="#fff" stopOpacity={peak * 0.45} />
      <stop offset={1} stopColor="#fff" stopOpacity={0} />
    </radialGradient>
  );
};

const EDGE = 0.08;
const SHADOW = 0.32;

/**
 * A tone-on-tone cloud mass: union of round lobes masked with an airbrushed
 * edge, a soft shadow band below it, and swirl ornament on top.
 */
export const CloudBank: React.FC<{ mood: Mood; spec: CloudBankSpec; glow: Pt; dx?: number }> = ({
  mood,
  spec,
  glow,
  dx = 0,
}) => {
  const id = useSvgId('cloud');
  const [sx, sy] = spec.shadow;
  return (
    <g transform={`translate(${dx} 0)`}>
      <defs>
        <radialGradient id={`${id}c`} gradientUnits="userSpaceOnUse" cx={glow[0] - dx} cy={glow[1]} r={1150}>
          <stop offset={0.3} stopColor={spec.far ? mood.farLit : mood.cloudLit} />
          <stop offset={0.5} stopColor={spec.far ? mood.farDeep : mood.cloudDeep} />
          <stop offset={1} stopColor={spec.far ? mood.farDeep : mood.cloudDeep} />
        </radialGradient>
        <SoftStops id={`${id}e`} feather={EDGE} />
        <SoftStops id={`${id}s`} feather={SHADOW} peak={0.8} />
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H}>
          <SoftLobes lobes={spec.lobes} fill={`url(#${id}e)`} feather={EDGE} />
        </mask>
        <mask id={`${id}n`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H}>
          <SoftLobes lobes={spec.lobes} fill={`url(#${id}s)`} feather={SHADOW} dx={sx} dy={sy} />
        </mask>
      </defs>
      <rect x={-W} y={-H} width={3 * W} height={3 * H} fill={mood.cloudShadow} opacity={0.38} mask={`url(#${id}n)`} />
      <rect x={-W} y={-H} width={3 * W} height={3 * H} fill={`url(#${id}c)`} mask={`url(#${id}m)`} />
      <g fill={spec.far ? mood.swirlOnGround : mood.swirlOnCloud} opacity={spec.far ? 0.75 : 1}>
        {spec.spirals.map((s, i) => (
          <path key={i} d={swirlPath(s)} />
        ))}
      </g>
    </g>
  );
};

export const GroundSwirls: React.FC<{ color: string; spirals: readonly SpiralSpec[]; opacity?: number; dx?: number }> = ({
  color,
  spirals,
  opacity = 0.7,
  dx = 0,
}) => (
  <g fill={color} opacity={opacity} transform={`translate(${dx} 0)`}>
    {spirals.map((s, i) => (
      <path key={i} d={swirlPath(s)} />
    ))}
  </g>
);

export const Vignette: React.FC<{ mood: Mood; c?: Pt; strength?: number }> = ({ mood, c = [W / 2, H * 0.42], strength = 0.6 }) => {
  const id = useSvgId('vig');
  return (
    <>
      <defs>
        <radialGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          cx={0}
          cy={0}
          r={1}
          gradientTransform={`translate(${c[0]} ${c[1]}) scale(${W * 0.62} ${H * 0.78})`}
        >
          <stop offset={0.45} stopColor={mood.vignette} stopOpacity={0} />
          <stop offset={0.8} stopColor={mood.vignette} stopOpacity={strength * 0.55} />
          <stop offset={1} stopColor={mood.vignette} stopOpacity={strength} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

/**
 * Whole-frame surface: a fine speckle (spray paint / pastel tooth) plus a
 * low-frequency mottle that breaks up the gradients. One filter pass each.
 */
export const Grain: React.FC<{ seed: number; opacity: number; mottle?: number }> = ({ seed, opacity, mottle = 0.2 }) => {
  const fine = useSvgId('grain');
  const soft = useSvgId('mottle');
  return (
    <>
      <defs>
        <filter id={fine} x={0} y={0} width={W} height={H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.95} numOctaves={2} seed={seed} />
          <feColorMatrix type="matrix" values="2.4 0 0 0 -0.7  2.4 0 0 0 -0.7  2.4 0 0 0 -0.7  0 0 0 0 1" />
        </filter>
        <filter id={soft} x={0} y={0} width={W} height={H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.0045} numOctaves={4} seed={7} />
          <feColorMatrix type="matrix" values="1.6 0 0 0 -0.3  1.6 0 0 0 -0.3  1.6 0 0 0 -0.3  0 0 0 0 1" />
        </filter>
      </defs>
      <rect width={W} height={H} filter={`url(#${soft})`} opacity={mottle} style={{ mixBlendMode: 'soft-light' }} />
      <rect width={W} height={H} filter={`url(#${fine})`} opacity={opacity} style={{ mixBlendMode: 'overlay' }} />
    </>
  );
};
