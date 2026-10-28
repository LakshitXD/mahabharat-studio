import React from "react";
import { Composition } from "remotion";
import { Wide } from "./scenes/Wide";
import { ShantanuClose } from "./scenes/ShantanuClose";
import { GangaClose } from "./scenes/GangaClose";
import { ExpressionSheet } from "./scenes/ExpressionSheet";
import { Motion } from "./scenes/Motion";

const base = { width: 1920, height: 1080, fps: 30 } as const;

export const Root: React.FC = () => (
  <>
    <Composition id="wide" component={Wide} durationInFrames={1} {...base} />
    <Composition id="shantanu-close" component={ShantanuClose} durationInFrames={1} {...base} />
    <Composition id="ganga-close" component={GangaClose} durationInFrames={1} {...base} />
    <Composition id="expressions" component={ExpressionSheet} durationInFrames={1} {...base} />
    <Composition id="motion" component={Motion} durationInFrames={90} {...base} />
  </>
);
