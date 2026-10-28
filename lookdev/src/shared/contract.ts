import type React from "react";

// The seam between the look (src/m/: characters and sets) and the story player (src/player/).
// Positions are stage fractions: x 0..1 across the frame, y 0..1 down it, as in story.json.

export type Expression = "neutral" | "smile" | "grin" | "sad" | "surprised" | "angry" | "thinking" | "fear" | "determined";
export type Pose = "stand" | "walk" | "talk" | "point" | "offer" | "bow" | "think";
export type Mood = "day" | "evening" | "night";
export type Viseme = "rest" | "MBP" | "AI" | "E" | "O" | "FV";

export type ActorProps = {
  pose: Pose;
  expression: Expression;
  /** Mouth openness 0..1 from the narration envelope while this actor speaks, else 0. */
  mouth: number;
  /** Optional mouth shape; the look picks one from `mouth` when absent. */
  viseme?: Viseme;
  /** 0 open .. 1 closed. */
  blink: number;
  facing: "left" | "right";
  /** Walk cycle phase 0..1, advancing only while the actor moves. */
  walkPhase: number;
  /** Frame within the beat, for idle motion. */
  frame: number;
  variant?: string;
};

export type CharacterDef = {
  id: string;
  Component: React.FC<ActorProps>;
  /** Figure height in px when drawn at scale 1 in a 1920x1080 frame (soles to crown). */
  height: number;
  /** The component draws with its feet at (0, 0) and facing right; the player translates, scales and mirrors. */
};

export type SetProps = { mood: Mood; frame: number };

export type SetDef = {
  id: string;
  /** Drawn behind the actors, filling 1920x1080. */
  Back: React.FC<SetProps>;
  /** Drawn over the actors (foreground reeds, front clouds); optional. */
  Front?: React.FC<SetProps>;
  /** Ground line as a stage fraction (feet sit here unless the actor sets y). */
  groundY: number;
  /** Actor scale on this set. */
  actorScale: number;
};

export type Registry = {
  characters: Record<string, CharacterDef>;
  sets: Record<string, SetDef>;
};
