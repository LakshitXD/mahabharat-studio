import React from "react";
import { Frame } from "./Frame";
import { LooseCurls, Sky } from "../Sky";
import { Shantanu } from "../Shantanu";
import { EXPRESSIONS } from "../expressions";

export const ShantanuClose: React.FC = () => (
  <Frame>
    <Sky mood="warm" glowX={960} glowY={330} />
    <LooseCurls mood="warm" items={[[1290, 150, 40], [1700, 640, 34], [560, 560, 30]]} />
    <Shantanu x={960} y={200} expression={EXPRESSIONS.neutral} arm="spear" accent bust />
  </Frame>
);
