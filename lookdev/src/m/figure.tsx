import React from "react";
import type { ActorProps } from "../shared/contract";

/**
 * Line weight is constant on screen whatever the player's scale (vector-effect),
 * so the wide and the close-up keep the one hairline the refs use.
 * `variant: "close"` thickens it for chest-up framing, as B measured (4-5 px there, 2.5-3 px wide).
 */
export const lineWidth = (variant: string | undefined) => (variant === "close" ? 5 : 3.6);

const CLASS = "m-ns";

/** Root of a character: feet at (0, 0), facing +x. Scales figure units to px and pins the stroke width. */
export const Figure: React.FC<{ unitsTall: number; pxTall: number; variant: ActorProps["variant"]; children: React.ReactNode }> = ({ unitsTall, pxTall, variant, children }) => {
  const k = pxTall / unitsTall;
  return (
    <g className={CLASS} strokeWidth={lineWidth(variant)} strokeLinecap="round" strokeLinejoin="round">
      <style>{`.${CLASS} path,.${CLASS} circle,.${CLASS} ellipse,.${CLASS} rect,.${CLASS} line{vector-effect:non-scaling-stroke}`}</style>
      <g transform={`scale(${k}) translate(0 ${-unitsTall})`}>{children}</g>
    </g>
  );
};
