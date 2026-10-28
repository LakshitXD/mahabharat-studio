import React from 'react';
import { Ground, Grain } from '../Atmosphere';
import { EXPRESSIONS, KING, QUEEN } from '../expressions';
import { Ganga } from '../Ganga';
import { DAY, INK, NIGHT } from '../palette';
import { Shantanu } from '../Shantanu';
import { Frame } from './Frame';

const CELL = 320;

export const Expressions: React.FC = () => (
  <Frame>
    <defs>
      <clipPath id="xtop">
        <rect width={1920} height={540} />
      </clipPath>
      <clipPath id="xtopk">
        <rect width={1920} height={522} />
      </clipPath>
      <clipPath id="xbot">
        <rect y={558} width={1920} height={522} />
      </clipPath>
      {EXPRESSIONS.map((_, i) => (
        <clipPath key={i} id={`xc${i}`}>
          <rect x={i * CELL + 2} width={CELL - 4} height={1080} />
        </clipPath>
      ))}
    </defs>
    <g clipPath="url(#xtop)">
      <Ground mood={DAY} c={[960, 300]} rx={1300} ry={700} />
    </g>
    <g clipPath="url(#xbot)">
      <Ground mood={NIGHT} c={[960, 760]} rx={1300} ry={700} />
    </g>
    <rect y={522} width={1920} height={36} fill="#140a0b" />
    {EXPRESSIONS.map((e, i) => {
      const cx = i * CELL + CELL / 2;
      return (
        <g key={e} clipPath={`url(#xc${i})`}>
          <g clipPath="url(#xtopk)">
            <Shantanu x={cx} y={438} scale={0.8} line={3.6} face={KING[e]} idPrefix={`xk${i}`} />
          </g>
          <g clipPath="url(#xbot)">
            <Ganga x={cx} y={790} scale={0.62} face={QUEEN[e]} halo={0.6} />
          </g>
          <text x={cx} y={547} textAnchor="middle" fill={INK.cream} fontFamily="Georgia, serif" fontSize={22} letterSpacing={3}>
            {e.toUpperCase()}
          </text>
        </g>
      );
    })}
    <Grain seed={2} opacity={0.2} />
  </Frame>
);
