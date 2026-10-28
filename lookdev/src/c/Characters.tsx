import React from 'react';
import {FaceInput} from './face';
import {GangaHead} from './GangaHead';
import {ShantanuHead} from './ShantanuHead';
import {COOL, FACE, Pivot, WARM} from './style';

export type ArmPose = {shoulder: number; elbow: number};
const HANG: ArmPose = {shoulder: 0, elbow: 0};

export type CharacterProps = FaceInput & {
  id: string;
  x: number;
  y: number;
  scale: number;
  full?: boolean;
  headTilt?: number;
  armL?: ArmPose;
  armR?: ArmPose;
  ink?: number;
  t?: number;
};

const KING_NECK = {x: 0, y: 70};
const GANGA_NECK = {x: 0, y: 150};
const KING_UPPER = 200;
const KING_FORE = 170;

const sawtooth = (y0: number, x0: number, x1: number, h: number) => {
  const pts: string[] = [];
  for (let xx = x0, up = false; xx <= x1; xx += h, up = !up) pts.push(`${xx},${up ? y0 - h : y0}`);
  return `M${pts.join(' L')}`;
};

const KingArm: React.FC<{s: -1 | 1; pose: ArmPose; sw: number; grip?: boolean}> = ({s, pose, sw, grip}) => {
  const C = WARM.cream;
  return (
    <Pivot x={0} y={0} angle={pose.shoulder}>
      <path d={`M${-s * 44},-4 C${-s * 30},-24 ${s * 30},-24 ${s * 48},-4 L${s * 48},${KING_UPPER + 10} L${-s * 40},${KING_UPPER + 10} Z`} fill={WARM.ink} />
      <path d={`M${-s * 36},20 C${-s * 38},80 ${-s * 38},140 ${-s * 36},${KING_UPPER}`} fill="none" stroke={C} strokeWidth={sw} strokeLinecap="round" />
      <g transform={`translate(0 ${KING_UPPER})`}>
        <Pivot x={0} y={0} angle={pose.elbow}>
          <circle r={46} fill={WARM.ink} />
          <path d={`M${-s * 42},-6 L${s * 48},-6 L${s * 58},${KING_FORE} C${s * 30},${KING_FORE + 12} ${-s * 30},${KING_FORE + 12} ${-s * 54},${KING_FORE} Z`} fill={WARM.ink} />
          <g fill="none" stroke={C} strokeWidth={sw} strokeLinecap="round">
            <path d={`M${-s * 40},4 C${-s * 44},60 ${-s * 50},120 ${-s * 54},${KING_FORE - 4}`} />
            <path d={`M${-s * 54},${KING_FORE} C${-s * 30},${KING_FORE + 12} ${s * 30},${KING_FORE + 12} ${s * 58},${KING_FORE}`} />
            <path d={`M${-s * 50},${KING_FORE - 20} C${-s * 26},${KING_FORE - 10} ${s * 26},${KING_FORE - 10} ${s * 56},${KING_FORE - 20}`} opacity={0.7} />
          </g>
          <g transform={`translate(0 ${KING_FORE + 10})`}>
            {grip ? (
              <g>
                <path d="M-30,-4 L30,-4 C38,10 38,40 30,52 C10,60 -12,60 -30,52 C-38,40 -38,10 -30,-4 Z" fill={WARM.ink} />
                <g fill="none" stroke={C} strokeWidth={sw * 0.9} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M-30,-4 C-38,10 -38,40 -30,52 C-12,60 10,60 30,52 C38,40 38,10 30,-4" />
                  <path d="M-30,16 C-14,22 14,22 30,16 M-30,30 C-14,36 14,36 30,30 M-28,44 C-14,48 14,48 28,44" opacity={0.85} />
                  <path d={`M${s * 30},6 C${s * 44},10 ${s * 46},26 ${s * 32},34`} />
                </g>
              </g>
            ) : (
              <g>
                <path d={`M${-s * 26},-6 C${-s * 30},20 ${-s * 26},40 ${-s * 10},50 L${s * 44},54 C${s * 54},52 ${s * 54},42 ${s * 44},40 L${s * 20},36 L${s * 26},-6 Z`} fill={WARM.ink} />
                <g fill="none" stroke={C} strokeWidth={sw * 0.85} strokeLinecap="round" strokeLinejoin="round">
                  <path d={`M${-s * 26},-6 C${-s * 30},20 ${-s * 26},40 ${-s * 10},50 L${s * 44},54 C${s * 54},52 ${s * 54},42 ${s * 44},40 L${s * 20},36`} />
                  <path d={`M${-s * 6},44 L${s * 40},47 M${-s * 12},36 L${s * 34},38`} opacity={0.75} />
                  <path d={`M${s * 20},36 C${s * 26},24 ${s * 26},8 ${s * 26},-6`} />
                </g>
              </g>
            )}
          </g>
        </Pivot>
      </g>
    </Pivot>
  );
};

export const kingHandPoint = (x: number, y: number, scale: number, side: -1 | 1, pose: ArmPose): [number, number] => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a1 = rad(pose.shoulder);
  const a2 = rad(pose.shoulder + pose.elbow);
  const sx = side * 196 - Math.sin(a1) * KING_UPPER - Math.sin(a2) * (KING_FORE + 36);
  const sy = 128 + Math.cos(a1) * KING_UPPER + Math.cos(a2) * (KING_FORE + 36);
  return [x + sx * scale, y + sy * scale];
};

export const Shantanu: React.FC<CharacterProps & {grip?: boolean}> = (props) => {
  const {id, x, y, scale, full = false, headTilt = 0, armL = HANG, armR = HANG, ink = 1, grip = false} = props;
  const C = WARM.cream;
  const sw = 1.9 * ink;
  const bottom = full ? 860 : 520;
  const hem = full ? 272 : 262;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d={`M-72,90 C-90,100 -130,104 -170,112 L-206,120 C-230,126 -244,140 -246,166 L${-hem},${bottom} L${hem},${bottom} L246,166 C244,140 230,126 206,120 L170,112 C130,104 90,100 72,90 Z`}
        fill={WARM.ink}
      />
      {full && <path d="M-130,850 C-122,884 -80,888 -50,882 L50,882 C80,888 122,884 130,850 Z" fill={WARM.ink} />}
      <g fill="none" stroke={C} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M0,96 L0,${bottom - 4}`} />
        <path d="M-50,84 C-44,130 -24,170 0,196 C40,236 120,262 238,282" />
        <path d="M50,84 C44,130 24,170 0,196 C-40,236 -120,262 -238,282" />
        <path d="M-104,98 C-88,140 -54,174 -18,190" opacity={0.85} />
        <path d="M104,98 C88,140 54,174 18,190" opacity={0.85} />
        <path d="M-238,336 C-130,350 -50,380 30,420 C90,450 160,470 236,478" />
        <path d="M-238,370 C-140,384 -60,414 20,456 C80,488 150,506 234,514" />
        <path d="M-9,196 C-17,184 -13,172 -3,172 C9,172 11,186 1,196 C-5,204 -13,208 -19,210" strokeWidth={sw * 0.8} />
      </g>
      <g fill={C}>
        {Array.from({length: 13}, (_, i) => {
          const a = -0.95 + (i / 12) * 1.9;
          return <circle key={i} cx={Math.sin(a) * 84} cy={92 + Math.cos(a) * 58} r={2.8 * ink} />;
        })}
      </g>
      {full && (
        <g fill="none" stroke={C} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M-232,560 C-120,574 120,574 232,560" />
          <path d="M-264,800 L264,800 M-268,826 L268,826" />
          <path d={sawtooth(824, -260, 260, 13)} strokeWidth={sw * 0.7} />
          <path d="M-80,580 C-90,660 -110,730 -124,796 M80,580 C90,660 110,730 124,796 M-160,576 C-174,670 -194,740 -212,796 M160,576 C174,670 194,740 212,796" opacity={0.7} />
        </g>
      )}
      <g transform="translate(-196 128)">
        <KingArm s={-1} pose={armL} sw={sw} />
      </g>
      <g transform="translate(196 128)">
        <KingArm s={1} pose={armR} sw={sw} grip={grip} />
      </g>
      <Pivot x={KING_NECK.x} y={KING_NECK.y} angle={headTilt}>
        <g transform={full ? `translate(0 ${KING_NECK.y + 20}) scale(1.3) translate(0 ${-KING_NECK.y - 20})` : undefined}>
          <ShantanuHead {...props} id={id} ink={ink} />
        </g>
      </Pivot>
    </g>
  );
};

type ArmPass = 'line' | 'fill';

const GangaArm: React.FC<{s: -1 | 1; pose: ArmPose; sw: number; pass: ArmPass; holdLotus?: boolean}> = ({s, pose, sw, pass, holdLotus}) => {
  const skin = {fill: FACE.light, stroke: pass === 'line' ? FACE.ink : 'none', strokeWidth: pass === 'line' ? sw * 1.4 : 0, strokeLinejoin: 'round' as const};
  return (
    <Pivot x={0} y={0} angle={pose.shoulder}>
      <path d={`M${-s * 15},60 C${-s * 17},110 ${-s * 15},150 ${-s * 12},172 L${s * 12},172 C${s * 15},140 ${s * 17},100 ${s * 17},60 Z`} {...skin} />
      <g transform="translate(0 165)">
        <Pivot x={0} y={0} angle={pose.elbow}>
          <circle r={12} {...skin} stroke="none" />
          <path d={`M${-s * 12},-4 C${-s * 13},50 ${-s * 11},100 ${-s * 9},122 L${s * 9},122 C${s * 11},90 ${s * 13},40 ${s * 12},-4 Z`} {...skin} />
          <path
            d={`M${-s * 9},118 C${-s * 15},136 ${-s * 13},156 ${-s * 5},168 C${-s * 3},176 ${s * 1},180 ${s * 4},172 L${s * 8},176 C${s * 12},170 ${s * 13},160 ${s * 15},150 C${s * 16},138 ${s * 12},126 ${s * 9},118 Z`}
            {...skin}
          />
          {pass === 'fill' && (
            <>
              <path d={`M${-s * 11},94 L${s * 11},94 M${-s * 11},101 L${s * 11},101`} stroke={COOL.periwinkle} strokeWidth={sw * 1.1} />
              {holdLotus && (
                <g transform="translate(0 154) rotate(180)" fill={COOL.blossom} stroke={COOL.lilac} strokeWidth={sw * 0.8}>
                  <path d="M0,0 C14,-10 12,-34 0,-46 C-12,-34 -14,-10 0,0 Z" />
                  <path d="M0,0 C20,-6 30,-24 28,-36 C14,-30 4,-16 0,0 Z M0,0 C-20,-6 -30,-24 -28,-36 C-14,-30 -4,-16 0,0 Z" />
                </g>
              )}
            </>
          )}
        </Pivot>
      </g>
      {pass === 'fill' && (
        <>
          <path d={`M${-s * 20},10 C${-s * 8},-2 ${s * 14},-4 ${s * 19},8 L${s * 19},70 L${-s * 17},70 Z`} fill={COOL.indigo} />
          <path d={`M${-s * 17},68 L${s * 19},68`} stroke={COOL.periwinkle} strokeWidth={sw} />
        </>
      )}
    </Pivot>
  );
};

export const Ganga: React.FC<CharacterProps & {holdLotus?: boolean}> = (props) => {
  const {id, x, y, scale, full = false, headTilt = 0, armL = HANG, armR = HANG, ink = 1, t = 0, holdLotus = false} = props;
  const L = COOL.periwinkle;
  const sw = 1.5 * ink;
  const bottom = full ? 840 : 760;
  const wave = Math.sin(t * 0.08) * 6;
  const arms = (pass: ArmPass) => (
    <>
      <g transform="translate(-92 214)">
        <GangaArm s={-1} pose={armL} sw={sw} pass={pass} />
      </g>
      <g transform="translate(92 214)">
        <GangaArm s={1} pose={armR} sw={sw} pass={pass} holdLotus={holdLotus} />
      </g>
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M90,200 C130,300 ${150 + wave},460 ${140 + wave * 1.5},${full ? 620 : 760} L${96 + wave},${full ? 640 : 760} C104,480 96,330 70,220 Z`} fill={COOL.indigo2} />
      <Pivot x={GANGA_NECK.x} y={GANGA_NECK.y} angle={headTilt}>
        <GangaHead {...props} id={`${id}-h`} ink={ink} veil />
      </Pivot>
      <path
        d={
          full
            ? `M-22,160 C-50,176 -84,184 -96,200 C-106,214 -104,240 -98,270 L-80,420 C-88,520 -110,700 ${-134 - wave},${bottom} L${134 + wave},${bottom} C110,700 88,520 80,420 L98,270 C104,240 106,214 96,200 C84,184 50,176 22,160 Z`
            : `M-22,160 C-50,176 -84,184 -96,200 C-106,214 -106,250 -108,${bottom} L108,${bottom} C106,250 106,214 96,200 C84,184 50,176 22,160 Z`
        }
        fill={COOL.indigo}
      />
      <path d="M-40,176 C-28,212 28,212 40,176 C28,168 -28,168 -40,176 Z" fill={FACE.light} />
      <path d={`M96,198 C70,250 0,330 ${full ? -86 : -108},${full ? 430 : 440} L${full ? -84 : -108},${full ? 480 : 492} C10,380 84,290 104,232 Z`} fill="#2f3478" />
      <g fill="none" stroke={L} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M-42,176 C-30,214 30,214 42,176" />
        <path d={`M96,198 C70,250 0,330 ${full ? -86 : -108},${full ? 430 : 440}`} />
        <path d={`M104,232 C84,290 10,380 ${full ? -84 : -108},${full ? 480 : 492}`} />
        <path d={`M100,214 C78,268 4,352 ${full ? -85 : -108},${full ? 454 : 466}`} strokeDasharray={`${3 * ink} ${7 * ink}`} opacity={0.9} />
        {full && (
          <>
            <path d="M-80,420 C-40,430 40,430 80,420" />
            {[-70, -38, -10, 16, 44].map((hx, i) => (
              <path key={hx} d={`M${-8 + i * 4},440 C${-6 + i * 4 + hx * 0.2},600 ${hx * 0.7},720 ${hx + wave * 0.3},${bottom - 4}`} opacity={0.75} />
            ))}
            <path d={`M${-130 - wave},${bottom - 34} C-60,${bottom - 44} 60,${bottom - 44} ${130 + wave},${bottom - 34}`} />
            <path d={sawtooth(bottom - 14, -122, 122, 11)} strokeWidth={sw * 0.8} opacity={0.9} />
          </>
        )}
      </g>
      <g fill={COOL.pale}>
        {Array.from({length: 11}, (_, i) => {
          const a = -0.8 + (i / 10) * 1.6;
          return <circle key={i} cx={Math.sin(a) * 48} cy={170 + Math.cos(a) * 44} r={2.4 * ink} />;
        })}
        <path d="M0,212 C8,220 8,232 0,238 C-6,230 -6,220 0,212 Z" />
      </g>
      {arms('line')}
      {arms('fill')}
      <path d="M-57,-30 C-60,60 -61,200 -57,300 L-84,322 C-86,200 -84,40 -80,-20 Z M57,-30 C60,60 61,200 57,300 L84,322 C86,200 84,40 80,-20 Z" fill={COOL.hair} />
      <path d="M-57,-30 C-60,60 -61,200 -57,300 L-66,306 C-70,200 -69,60 -66,-26 Z M57,-30 C60,60 61,200 57,300 L66,306 C70,200 69,60 66,-26 Z" fill={COOL.hairLight} />
      <g fill="none" stroke={COOL.hairLine} strokeWidth={sw * 0.8} strokeLinecap="round">
        <path d="M-72,40 C-73,140 -74,220 -72,304 M72,40 C73,140 74,220 72,304" />
      </g>
    </g>
  );
};
