import React from "react";
import { KING, LINE_W } from "./palette";
import { spiralPath } from "./geom";
import { EXPRESSIONS, type Expression } from "./expressions";

/**
 * Local space: crown peak at (0,0), figure centred on x=0, measured off dragonbee-f1 at 4x.
 * At scale 1 the figure is framed for the 1920x1080 close-up with translate(960,200).
 * Rows: brim 112, brows 168, eyes 190, nose foot 266, mustache curls 322, beard tip 400,
 * neck/shoulder junction 380, shoulder tips 490 at x=+-490, torso +-560 at 1000, hem 1950.
 */
export type ArmPose = "spear" | "offer" | "rest";

export type ShantanuProps = {
  x: number;
  y: number;
  scale?: number;
  expression?: Expression;
  /** 0..1 overrides expression.mouthOpen when set (speech) */
  mouth?: number;
  /** 0 = open, 1 = eyes shut */
  blink?: number;
  /** -1..1 face turn, + toward the right */
  turn?: number;
  headTilt?: number;
  arm?: ArmPose;
  /** show the accent weapon with the spear pose */
  accent?: boolean;
  /** render head and shoulders only */
  bust?: boolean;
};

const L = LINE_W;

const Brow: React.FC<{ side: 1 | -1; e: Expression }> = ({ side, e }) => {
  const asym = side === 1 ? e.asym : 0;
  const raise = e.browRaise * 16 + asym * 12;
  const angle = e.browAngle * 16 - asym * 12;
  const ix = 16 * side;
  const iy = 178 - raise + angle;
  const mx = 50 * side;
  const my = 166 - raise + angle * 0.3;
  const ox = 94 * side;
  const oy = 164 - raise - Math.max(0, e.browAngle) * 4;
  const tIn = 5 + Math.max(0, e.browAngle) * 3;
  const tOut = 2.4;
  return (
    <path
      d={`M${ix},${iy} Q${mx},${my} ${ox},${oy} L${ox},${oy + tOut} Q${mx},${my + tOut + 1.5} ${ix},${iy + tIn} Z`}
      fill={KING.line}
      stroke="none"
    />
  );
};

const Eye: React.FC<{ side: 1 | -1; e: Expression; blink: number }> = ({ side, e, blink }) => {
  const open = Math.max(0, e.eyeOpen * (1 - blink) - (side === 1 ? e.asym * 0.4 : 0));
  const ix = 24 * side;
  const ox = 84 * side;
  const iy = 198;
  const oy = 189 - Math.max(0, e.browRaise) * 2;
  const h = Math.max(0.5, 4.6 * open);
  const mx = (ix + ox) / 2;
  const my = (iy + oy) / 2;
  const gaze = e.gaze * 10;
  const slit = `M${ix},${iy} Q${mx + 2 * side},${my - h * 1.6} ${ox},${oy} Q${mx},${my + h * 0.9} ${ix},${iy} Z`;
  return (
    <g>
      <path d={slit} fill={KING.lineBright} />
      {open > 1.15 || Math.abs(e.gaze) > 0.2 ? (
        <circle cx={mx + gaze} cy={my - 0.5} r={Math.min(3.2, h * 0.7)} fill={KING.pupil} />
      ) : null}
      {/* upper lid groove */}
      <path
        d={`M${ix - 2 * side},${iy - 2} Q${mx + 2 * side},${my - h * 1.6 - 5} ${ox + 4 * side},${oy - 3}`}
        fill="none"
        stroke={KING.line}
        strokeWidth={L * 0.75}
        strokeLinecap="round"
        opacity={0.8}
      />
    </g>
  );
};

const Mustache: React.FC<{ side: 1 | -1; e: Expression }> = ({ side, e }) => {
  const lift = e.mouthCurve * 10;
  const a0 = -2.1;
  const r = 15;
  const endX = 80;
  const endY = 324 - lift;
  const cx = endX - Math.cos(a0) * r;
  const cy = endY - Math.sin(a0) * r;
  return (
    <g transform={side === -1 ? "scale(-1,1)" : undefined}>
      <path d={`M8,284 C34,286 62,${300 - lift * 0.4} ${endX},${endY}`} />
      <path d={spiralPath(cx, cy, r, 1.3, a0, -1)} />
    </g>
  );
};

const Head: React.FC<{ e: Expression; blink: number; turn: number; tilt: number; mouthOpen: number }> = ({
  e,
  blink,
  turn,
  tilt,
  mouthOpen,
}) => {
  const fx = turn * 30;
  const sx = 1 - Math.abs(turn) * 0.14;
  const mouthY = 310;
  const mc = e.mouthCurve * 8;
  const mo = mouthOpen * 16;
  return (
    <g transform={`rotate(${tilt} 0 380)`}>
      {/* ink: crown, head column, hair falls and beard in one shape */}
      <path
        d={`M-100,112 C-104,200 -104,280 -134,330 C-146,350 -152,364 -156,384 L156,384 C152,364 146,350 134,330 C104,280 104,200 100,112 L104,112 L132,46 C96,48 62,40 44,12 Q14,-28 0,-38 Q-14,-28 -44,12 C-62,40 -96,48 -132,46 L-104,112 Z`}
        fill={KING.ink}
      />
      <g fill="none" stroke={KING.line} strokeWidth={L} strokeLinecap="round" strokeLinejoin="round" opacity={0.92}>
        {/* crown edge, inset, plus the inner arch that echoes it */}
        <path d="M-100,106 L-125,50 C-93,52 -60,44 -42,16 Q-12,-22 0,-30 Q12,-22 42,16 C60,44 93,52 125,50 L100,106" />
        <path d="M-88,100 C-80,76 -52,62 -34,36 Q-8,4 0,-2 Q8,4 34,36 C52,62 80,76 88,100" opacity={0.7} />
        <path d="M0,74 L9,90 L0,106 L-9,90 Z" />
        {/* brim, past the face, with a centre dip */}
        <path d="M-124,114 Q-60,110 0,118 Q60,110 124,114" />
        {/* ear pendants */}
        <path d="M-118,118 L-118,150 M118,118 L118,150" opacity={0.7} />
        <path d="M-118,150 l-5,10 l5,10 l5,-10 z M118,150 l-5,10 l5,10 l5,-10 z" opacity={0.7} />
        {/* hair column edges and the fall toward the shoulders */}
        <path d="M-96,118 C-100,200 -100,280 -130,330 C-142,350 -148,364 -152,380" />
        <path d="M96,118 C100,200 100,280 130,330 C142,350 148,364 152,380" />
        <path d="M-108,250 C-114,300 -126,340 -134,378 M108,250 C114,300 126,340 134,378" opacity={0.5} />
        {/* beard: outline from the mustache curls to the tip, centre line */}
        <path d="M-92,300 C-88,340 -50,380 0,404 C50,380 88,340 92,300" />
        <path d="M0,330 L0,404" />
        <path d="M-44,336 C-36,360 -16,380 -6,396 M44,336 C36,360 16,380 6,396" opacity={0.5} />
        {/* features, turnable */}
        <g transform={`translate(${fx},0) scale(${sx},1)`}>
          {/* face planes: temple to cheek */}
          <path d="M-84,124 C-90,170 -92,220 -86,260 C-82,280 -76,292 -70,300" opacity={0.75} />
          <path d="M84,124 C90,170 92,220 86,260 C82,280 76,292 70,300" opacity={0.75} />
          {/* nose: bridge and nostril wings */}
          <path d="M0,176 L0,260" />
          <path d="M-18,258 Q-8,274 0,268 Q8,274 18,258" />
          {e.browAngle > 0.6 ? <path d="M-5,172 L-3,190 M5,172 L3,190" opacity={0.7} /> : null}
          <Mustache side={-1} e={e} />
          <Mustache side={1} e={e} />
          {/* mouth, mostly behind the mustache */}
          {mouthOpen > 0.05 ? (
            <path
              d={`M-24,${mouthY - mc} Q0,${mouthY - mc - 3} 24,${mouthY - mc} Q0,${mouthY + mo + 2} -24,${mouthY - mc} Z`}
              fill={KING.line}
              opacity={0.3}
              stroke="none"
            />
          ) : null}
          <path d={`M-24,${mouthY} Q0,${mouthY - mc} 24,${mouthY}`} opacity={0.8} />
          {mouthOpen > 0.05 ? <path d={`M-20,${mouthY + mo} Q0,${mouthY + mo + 4} 20,${mouthY + mo}`} opacity={0.8} /> : null}
          <Brow side={-1} e={e} />
          <Brow side={1} e={e} />
          <Eye side={-1} e={e} blink={blink} />
          <Eye side={1} e={e} blink={blink} />
        </g>
      </g>
    </g>
  );
};

const Body: React.FC<{ arm: ArmPose; accent: boolean; bust: boolean }> = ({ arm, accent, bust }) => {
  const hem = bust ? 1200 : 1950;
  const torso = bust
    ? `C-508,820 -530,900 -560,1000 C-575,1300 -585,1600 -590,${hem} L590,${hem} C585,1600 575,1300 560,1000 C530,900 508,820 510,700`
    : `C-504,800 -470,900 -440,1000 C-410,1300 -392,1600 -386,${hem} L386,${hem} C392,1600 410,1300 440,1000 C470,900 504,800 510,700`;
  return (
    <g>
      <path
        d={`M-152,376 C-290,386 -430,420 -480,480 C-506,512 -512,600 -510,700 ${torso} C512,600 506,512 480,480 C430,420 290,386 152,376 Z`}
        fill={KING.ink}
      />
      {arm === "offer" && (
        <g fill={KING.ink}>
          {/* sleeve: upper arm out to the elbow, forearm to the wrist, drape hanging from the elbow */}
          <path d="M470,520 C600,556 700,586 790,606 L950,586 L956,640 L800,666 C770,720 750,800 744,900 C700,890 670,870 650,840 C690,770 700,700 696,660 C620,640 540,640 470,660 Z" />
          {/* open hand, palm up: a soft wedge with the thumb on top */}
          <path d="M944,582 C980,566 1030,560 1080,568 C1096,572 1096,586 1084,590 C1104,596 1110,612 1096,618 C1080,626 1040,632 1000,636 C976,640 956,636 950,632 Z" />
        </g>
      )}
      <g fill="none" stroke={KING.line} strokeWidth={L} strokeLinecap="round" strokeLinejoin="round" opacity={0.92}>
        {/* shoulder contour, inset */}
        <path d="M-150,390 C-290,400 -424,432 -470,490" opacity={0.8} />
        <path d="M150,390 C290,400 424,432 470,490" opacity={0.8} />
        {/* V collar from the neck column, continuing past the chest point as an X */}
        <path d="M-150,392 C-110,500 -50,590 0,640 C50,590 110,500 150,392" />
        <path d="M-150,392 C-110,500 -50,590 0,640 C60,700 150,760 230,840" opacity={0.9} />
        <path d="M150,392 C110,500 50,590 0,640 C-60,700 -150,760 -230,840" opacity={0.9} />
        {/* vest edges from the shoulder tips */}
        <path d="M-430,476 C-380,600 -350,720 -330,840" opacity={0.8} />
        <path d="M430,476 C380,600 350,720 330,840" opacity={0.8} />
        {/* centre seam */}
        <path d={`M0,404 L0,${hem}`} />
        {/* belt, two curves */}
        <path d="M-330,840 Q0,800 330,840" opacity={0.8} />
        <path d="M-320,866 Q0,826 320,866" opacity={0.6} />
        {/* arm folds */}
        {bust ? (
          <>
            <path d="M-470,520 C-470,660 -490,800 -520,960" opacity={0.55} />
            <path d="M470,520 C470,660 490,800 520,960" opacity={0.55} />
          </>
        ) : (
          <>
            <path d="M-470,520 C-470,660 -450,800 -420,960" opacity={0.55} />
            <path d="M470,520 C470,660 450,800 420,960" opacity={0.55} />
            <path d="M-360,1920 Q0,1896 360,1920" opacity={0.7} />
            <path d="M-200,1000 C-194,1300 -188,1600 -184,1930 M200,1000 C194,1300 188,1600 184,1930" opacity={0.45} />
          </>
        )}
        {arm === "spear" && (
          <>
            {/* sleeve coming across, cuff, fist */}
            <path d="M-500,640 C-440,700 -400,724 -372,728" opacity={0.8} />
            <path d="M-500,780 C-440,790 -400,792 -376,784" opacity={0.8} />
            <path d="M-384,722 C-350,702 -300,710 -288,744 C-280,784 -300,814 -346,814 C-386,812 -398,756 -384,722 Z" />
            <path d="M-376,748 C-350,742 -320,744 -300,752 M-372,770 C-346,764 -318,766 -298,774 M-364,792 C-344,786 -322,788 -306,796" opacity={0.75} />
            <path d="M-384,736 C-396,730 -404,744 -394,756" opacity={0.75} />
          </>
        )}
        {arm === "offer" && (
          <>
            {/* sleeve upper edge, cuff, drape folds */}
            <path d="M476,534 C600,570 700,600 790,620" opacity={0.85} />
            <path d="M940,590 C944,610 946,626 948,636" opacity={0.9} />
            <path d="M926,592 C930,612 932,628 934,640" opacity={0.6} />
            <path d="M790,620 C776,700 760,790 752,880" opacity={0.6} />
            <path d="M700,676 C696,740 688,800 672,850" opacity={0.5} />
            {/* palm and finger lines */}
            <path d="M960,600 C1000,592 1040,590 1076,594" opacity={0.85} />
            <path d="M968,616 C1010,610 1050,608 1082,612" opacity={0.7} />
            <path d="M1000,628 C1030,624 1060,622 1086,620" opacity={0.6} />
          </>
        )}
      </g>
      {arm === "spear" && accent && (
        <g fill={KING.accent} stroke="none">
          <path d="M-890,145 L-221,880" stroke={KING.accent} strokeWidth={9} strokeLinecap="butt" />
          {/* leaf head: tip at (-890,145), 170 long along the shaft, 60 wide, then a collar */}
          <g transform="translate(-890,145) rotate(47.7)">
            <path d="M0,0 C44,32 100,36 170,0 C100,-36 44,-32 0,0 Z" />
            <path d="M166,-11 L188,-11 L188,11 L166,11 Z" />
          </g>
          {/* pennant tassel hanging from the shaft below the fist */}
          <path d="M-330,800 C-320,830 -322,870 -342,900 C-348,880 -356,872 -366,866 C-360,884 -362,900 -374,912 C-376,886 -384,862 -400,842 C-380,836 -356,820 -330,800 Z" />
        </g>
      )}
    </g>
  );
};

export const Shantanu: React.FC<ShantanuProps> = ({
  x,
  y,
  scale = 1,
  expression = EXPRESSIONS.neutral,
  mouth,
  blink = 0,
  turn = 0,
  headTilt = 0,
  arm = "rest",
  accent = false,
  bust = false,
}) => {
  const mouthOpen = mouth ?? expression.mouthOpen;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <Body arm={arm} accent={accent} bust={bust} />
      <Head e={expression} blink={blink} turn={turn} tilt={headTilt} mouthOpen={mouthOpen} />
    </g>
  );
};

/** Head on a shoulder stub, pivoted at the crown peak, for expression sheets. */
export const ShantanuHead: React.FC<{ x: number; y: number; scale?: number; expression: Expression; blink?: number }> = ({
  x,
  y,
  scale = 1,
  expression,
  blink = 0,
}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-152,376 C-290,386 -400,410 -440,470 L-440,560 L440,560 L440,470 C400,410 290,386 152,376 Z" fill={KING.ink} />
    <path d="M-150,390 C-290,400 -400,424 -436,470 M150,390 C290,400 400,424 436,470" fill="none" stroke={KING.line} strokeWidth={L} strokeLinecap="round" opacity={0.8} />
    <Head e={expression} blink={blink} turn={0} tilt={0} mouthOpen={expression.mouthOpen} />
  </g>
);
