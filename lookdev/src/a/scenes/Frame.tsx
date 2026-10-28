import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain, H, W } from "../Sky";

/** One full-frame SVG with the texture pass on top. */
export const Frame: React.FC<{ children: React.ReactNode; grain?: number; mottle?: number }> = ({
  children,
  grain = 0.34,
  mottle = 0.6,
}) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {children}
      <Grain grain={grain} mottle={mottle} />
    </svg>
  </AbsoluteFill>
);
