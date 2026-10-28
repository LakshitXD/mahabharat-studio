import React from "react";
import { Frame } from "./Frame";
import { H, W } from "../Sky";
import { EXPRESSIONS, EXPRESSION_NAMES } from "../expressions";
import { ShantanuHead } from "../Shantanu";
import { GangaHead } from "../Ganga";
import { KING, SKY } from "../palette";

export const ExpressionSheet: React.FC = () => {
  const colW = W / 6;
  return (
    <Frame grain={0.2} mottle={0.3}>
      <defs>
        <linearGradient id="xs-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY.warm.groundDark} />
          <stop offset="0.6" stopColor={SKY.warm.glowMid} />
          <stop offset="1" stopColor={SKY.warm.glowCore} />
        </linearGradient>
        <linearGradient id="xs-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY.night.glowCore} />
          <stop offset="1" stopColor={SKY.night.groundDark} />
        </linearGradient>
      </defs>
      <rect width={W} height={H / 2} fill="url(#xs-warm)" />
      <rect y={H / 2} width={W} height={H / 2} fill="url(#xs-night)" />
      {EXPRESSION_NAMES.map((name, i) => {
        const cx = colW * (i + 0.5);
        return (
          <g key={name}>
            <ShantanuHead x={cx} y={46} scale={0.62} expression={EXPRESSIONS[name]} />
            <GangaHead x={cx} y={H / 2 + 50} scale={0.62} expression={EXPRESSIONS[name]} />
            <text x={cx} y={H / 2 - 14} textAnchor="middle" fill={KING.ink} fontFamily="Georgia, serif" fontSize={26} opacity={0.85}>
              {name}
            </text>
            <text x={cx} y={H - 16} textAnchor="middle" fill="#d9d2f0" fontFamily="Georgia, serif" fontSize={26} opacity={0.9}>
              {name}
            </text>
          </g>
        );
      })}
    </Frame>
  );
};
