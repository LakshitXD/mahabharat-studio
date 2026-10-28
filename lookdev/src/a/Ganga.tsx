import React from "react";
import { GANGA, LINE_W } from "./palette";
import { EXPRESSIONS, type Expression } from "./expressions";

/**
 * Local space: hood top at (0,0). Face oval from y=92 to 440, half-width 112 at the eyes.
 * Rows: brows 214, eyes 256, nose foot 330, mouth 378, chin 440, shoulders 560, hem 1900.
 */
export type GangaProps = {
  x: number;
  y: number;
  scale?: number;
  expression?: Expression;
  mouth?: number;
  blink?: number;
  turn?: number;
  headTilt?: number;
  /** radians, sways the veil and water lines */
  phase?: number;
  halo?: boolean;
  bust?: boolean;
};

const L = LINE_W;

const Eye: React.FC<{ side: 1 | -1; e: Expression; blink: number }> = ({ side, e, blink }) => {
  const open = Math.max(0, e.eyeOpen * (1 - blink) - (side === 1 ? e.asym * 0.3 : 0));
  const cx = 58 * side;
  const cy = 258;
  const hw = 38;
  const hh = Math.max(0.8, 20 * Math.min(open, 1.5));
  const gaze = e.gaze * 10;
  const irisR = 18;
  const closed = open < 0.12;
  const clipId = React.useId();
  const upper = `M${cx - hw},${cy + 3} Q${cx},${cy - hh * 1.5} ${cx + hw},${cy + 3}`;
  const lower = `Q${cx},${cy + hh * 0.9} ${cx - hw},${cy + 3}`;
  return (
    <g>
      {!closed && (
        <>
          <clipPath id={clipId}>
            <path d={`${upper} ${lower} Z`} />
          </clipPath>
          <path d={`${upper} ${lower} Z`} fill="#fbf8fc" />
          <g clipPath={`url(#${clipId})`}>
            <circle cx={cx + gaze} cy={cy + 2} r={irisR} fill={GANGA.iris} />
            <circle cx={cx + gaze} cy={cy + 2} r={irisR * 0.52} fill={GANGA.pupil} />
            <circle cx={cx + gaze - 5} cy={cy - 4} r={3.8} fill="#fff" />
          </g>
        </>
      )}
      <path d={upper} fill="none" stroke={GANGA.contour} strokeWidth={L * 1.25} strokeLinecap="round" />
      {!closed && (
        <path d={`M${cx + hw},${cy + 3} ${lower}`} fill="none" stroke={GANGA.contour} strokeWidth={L * 0.6} opacity={0.55} />
      )}
      {closed && <path d={`M${cx - hw},${cy + 3} Q${cx},${cy + 14} ${cx + hw},${cy + 3}`} fill="none" stroke={GANGA.contour} strokeWidth={L * 1.1} strokeLinecap="round" />}
    </g>
  );
};

const Brow: React.FC<{ side: 1 | -1; e: Expression }> = ({ side, e }) => {
  const asym = side === 1 ? e.asym : 0;
  const raise = e.browRaise * 16 + asym * 14;
  const angle = e.browAngle * 18 - asym * 10;
  const ox = 96 * side;
  const oy = 220 - raise;
  const ix = 26 * side;
  const iy = 214 - raise + angle;
  const mx = 66 * side;
  const my = 204 - raise - 1;
  return <path d={`M${ox},${oy} Q${mx},${my} ${ix},${iy}`} fill="none" stroke={GANGA.contour} strokeWidth={L * 0.9} strokeLinecap="round" />;
};

const Face: React.FC<{ e: Expression; blink: number; turn: number; tilt: number; mouthOpen: number }> = ({
  e,
  blink,
  turn,
  tilt,
  mouthOpen,
}) => {
  const fx = turn * 30;
  const sx = 1 - Math.abs(turn) * 0.14;
  const mc = e.mouthCurve * 6;
  const mo = 6 + mouthOpen * 24;
  const mw = 14 + mouthOpen * 4;
  return (
    <g transform={`rotate(${tilt} 0 540)`}>
      {/* hood: dark hair mass framing the face in two long tapers */}
      <path
        d="M0,0 C112,0 170,80 174,220 C178,340 176,480 172,660 L140,680 C134,540 128,420 126,300 C118,440 112,560 108,680 L-108,680 C-112,560 -118,440 -126,300 C-128,420 -134,540 -140,680 L-172,660 C-176,480 -178,340 -174,220 C-170,80 -112,0 0,0 Z"
        fill={GANGA.hair}
      />
      <g fill="none" stroke={GANGA.strand} strokeWidth={L} strokeLinecap="round" opacity={0.65}>
        <path d="M-136,140 C-150,280 -154,440 -156,640" />
        <path d="M136,140 C150,280 154,440 156,640" />
        <path d="M-60,40 C-104,70 -126,110 -134,170" opacity={0.6} />
        <path d="M60,40 C104,70 126,110 134,170" opacity={0.6} />
      </g>
      <g transform={`translate(${fx},0) scale(${sx},1)`}>
        {/* face: long oval, high forehead, narrow chin */}
        <path
          d="M0,88 C70,88 102,170 102,262 C102,350 62,456 0,460 C-62,456 -102,350 -102,262 C-102,170 -70,88 0,88 Z"
          fill={GANGA.face}
          stroke={GANGA.contour}
          strokeWidth={L * 0.8}
        />
        {/* hood edge over the brow of the oval */}
        <path d="M-104,250 C-102,150 -66,82 0,82 C66,82 102,150 104,250 L110,250 C112,120 66,56 0,56 C-66,56 -112,120 -110,250 Z" fill={GANGA.hair} />
        {/* blush: wide soft wash under each eye */}
        <ellipse cx={-62} cy={306} rx={44} ry={22} fill={GANGA.blush} opacity={0.6} />
        <ellipse cx={62} cy={306} rx={44} ry={22} fill={GANGA.blush} opacity={0.6} />
        <ellipse cx={0} cy={312} rx={90} ry={14} fill={GANGA.blush} opacity={0.3} />
        <Brow side={-1} e={e} />
        <Brow side={1} e={e} />
        <Eye side={-1} e={e} blink={blink} />
        <Eye side={1} e={e} blink={blink} />
        {/* nose: one long line with a short foot */}
        <path d="M8,250 C9,280 10,305 9,328 L-9,332" fill="none" stroke={GANGA.contour} strokeWidth={L * 0.9} strokeLinecap="round" strokeLinejoin="round" />
        {/* mouth: small lozenge, opens downward */}
        <path
          d={`M${-mw},${378 - mc} Q0,${372 - mc * 1.4} ${mw},${378 - mc} Q0,${378 + mo} ${-mw},${378 - mc} Z`}
          fill={mouthOpen > 0.15 ? GANGA.lipDark : GANGA.lip}
          stroke={GANGA.contour}
          strokeWidth={L * 0.6}
          strokeLinejoin="round"
        />
        <path d={`M${-mw},${378 - mc} Q0,${382 - mc} ${mw},${378 - mc}`} fill="none" stroke={GANGA.contour} strokeWidth={L * 0.7} strokeLinecap="round" opacity={0.9} />
      </g>
    </g>
  );
};

const Halo: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <defs>
      <radialGradient id={id} cx={0} cy={270} r={360} gradientUnits="userSpaceOnUse">
        <stop offset="0.5" stopColor={GANGA.halo} stopOpacity={0.22} />
        <stop offset="0.86" stopColor={GANGA.halo} stopOpacity={0.1} />
        <stop offset="1" stopColor={GANGA.halo} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={0} cy={270} r={360} fill={`url(#${id})`} />
    <circle cx={0} cy={270} r={312} fill="none" stroke={GANGA.halo} strokeWidth={L} opacity={0.45} />
    <circle cx={0} cy={270} r={326} fill="none" stroke={GANGA.halo} strokeWidth={L * 0.7} opacity={0.25} />
  </g>
);

const Body: React.FC<{ phase: number; bust: boolean }> = ({ phase, bust }) => {
  const hem = bust ? 1300 : 1900;
  const sway = Math.sin(phase) * 14;
  return (
    <g>
      {/* neck + robe */}
      <path d="M-46,420 L-50,570 L50,570 L46,420 Z" fill={GANGA.face} />
      <path
        d={`M-116,620 C-220,630 -320,670 -360,740 C-400,820 -400,1000 -380,1200 C-360,1450 -340,1700 -320,${hem} L320,${hem} C340,1700 360,1450 380,1200 C400,1000 400,820 360,740 C320,670 220,630 116,620 L62,570 L-62,570 Z`}
        fill={GANGA.robe}
      />
      <path d="M-62,570 C-40,612 40,612 62,570 L116,620 C60,664 -60,664 -116,620 Z" fill={GANGA.robeDeep} />
      {/* veil: translucent falls from the hood, outward */}
      <path
        d={`M-172,300 C-330,500 ${-400 + sway},760 -390,1100 C-380,1300 -360,1500 -340,${hem} L-230,${hem} C-250,1400 -270,900 -174,640 Z`}
        fill={GANGA.veil}
        opacity={0.12}
      />
      <path
        d={`M172,300 C330,500 ${400 - sway},760 390,1100 C380,1300 360,1500 340,${hem} L230,${hem} C250,1400 270,900 174,640 Z`}
        fill={GANGA.veil}
        opacity={0.12}
      />
      <g fill="none" stroke={GANGA.robeLine} strokeWidth={L} strokeLinecap="round" strokeLinejoin="round" opacity={0.85}>
        <path d="M-116,624 C-60,680 60,680 116,624" />
        <path d="M-156,652 C-80,734 80,734 156,652" opacity={0.55} />
        {/* water-fold lines */}
        <path d={`M-40,720 C${-60 + sway},920 -20,1120 -60,1320 C-90,1520 -70,1720 -80,${hem}`} opacity={0.7} />
        <path d={`M40,720 C${60 - sway},920 20,1120 60,1320 C90,1520 70,1720 80,${hem}`} opacity={0.7} />
        <path d={`M-210,780 C${-250 + sway},970 -230,1220 -270,1520 C-290,1720 -280,1820 -285,${hem}`} opacity={0.5} />
        <path d={`M210,780 C${250 - sway},970 230,1220 270,1520 C290,1720 280,1820 285,${hem}`} opacity={0.5} />
        {/* lotus medallion */}
        <path d="M0,780 C-18,810 -18,840 0,860 C18,840 18,810 0,780 Z" />
        <path d="M-30,810 C-40,835 -26,858 0,860 M30,810 C40,835 26,858 0,860" opacity={0.8} />
        <path d="M-50,832 C-40,856 -20,866 0,866 M50,832 C40,856 20,866 0,866" opacity={0.6} />
        {/* veil edges */}
        <path d={`M-172,300 C-330,500 ${-400 + sway},760 -390,1100 C-380,1300 -360,1500 -340,${hem}`} opacity={0.35} />
        <path d={`M172,300 C330,500 ${400 - sway},760 390,1100 C380,1300 360,1500 340,${hem}`} opacity={0.35} />
        {!bust && <path d="M-320,1870 Q0,1840 320,1870" opacity={0.6} />}
      </g>
    </g>
  );
};

export const Ganga: React.FC<GangaProps> = ({
  x,
  y,
  scale = 1,
  expression = EXPRESSIONS.neutral,
  mouth,
  blink = 0,
  turn = 0,
  headTilt = 0,
  phase = 0,
  halo = true,
  bust = false,
}) => {
  const mouthOpen = mouth ?? expression.mouthOpen;
  const haloId = React.useId();
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {halo && <Halo id={haloId} />}
      <Body phase={phase} bust={bust} />
      <Face e={expression} blink={blink} turn={turn} tilt={headTilt} mouthOpen={mouthOpen} />
    </g>
  );
};

export const GangaHead: React.FC<{ x: number; y: number; scale?: number; expression: Expression; blink?: number }> = ({
  x,
  y,
  scale = 1,
  expression,
  blink = 0,
}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <Face e={expression} blink={blink} turn={0} tilt={0} mouthOpen={expression.mouthOpen} />
  </g>
);
