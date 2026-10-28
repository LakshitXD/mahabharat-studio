import React from "react";
import { Composition, registerRoot } from "remotion";
import { Expressions, GangaClose, Motion, Poses, ShantanuClose, Walk, Wide } from "./scenes";

const frame = { width: 1920, height: 1080, fps: 30 } as const;

const Root: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, { id: "wide", component: Wide, ...frame, durationInFrames: 1 }),
    React.createElement(Composition, { id: "shantanu-close", component: ShantanuClose, ...frame, durationInFrames: 1 }),
    React.createElement(Composition, { id: "ganga-close", component: GangaClose, ...frame, durationInFrames: 1 }),
    React.createElement(Composition, { id: "expressions", component: Expressions, ...frame, durationInFrames: 1 }),
    React.createElement(Composition, { id: "poses", component: Poses, ...frame, durationInFrames: 1 }),
    React.createElement(Composition, { id: "walk", component: Walk, ...frame, durationInFrames: 60 }),
    React.createElement(Composition, { id: "motion", component: Motion, ...frame, durationInFrames: 90 }),
  );

registerRoot(Root);
