import { staticFile } from "remotion";
import type { Expression, Mood, Pose, Registry } from "../shared/contract";

export type CameraMove = "hold" | "push-in" | "pan-right";

export type Camera = { move: CameraMove; zoom?: number; x?: number; y?: number };

export type ActorCue = {
  key: string;
  char: string;
  x: number;
  y?: number;
  toX?: number;
  facing: "left" | "right";
  pose: Pose;
  /** Pose to settle into after a walk; defaults to stand. */
  then?: Pose;
  expr: Expression;
  speaks: boolean;
  variant?: string;
};

export type Caption = { text: string; from: number; to: number };

export type Beat = {
  id: string;
  /** Absolute start frame and length, from timing.json. */
  from: number;
  frames: number;
  set: string;
  mood: Mood;
  camera: Camera;
  actors: ActorCue[];
  /** Mouth openness per beat-local frame. */
  envelope: number[];
  /** Beat-local caption chunks, each ending where the next starts or where speech ends. */
  captions: Caption[];
};

export type Story = {
  id: string;
  title: string;
  fps: number;
  frames: number;
  audio: string;
  music: string | null;
  beats: Beat[];
};

const POSES: readonly Pose[] = ["stand", "walk", "talk", "point", "offer", "bow", "think"];
const EXPRESSIONS: readonly Expression[] = ["neutral", "smile", "grin", "sad", "surprised", "angry", "thinking", "fear", "determined"];
const MOODS: readonly Mood[] = ["day", "evening", "night"];
const MOVES: readonly CameraMove[] = ["hold", "push-in", "pan-right"];

type Json = any;

function oneOf<T extends string>(allowed: readonly T[], value: unknown, where: string): T {
  if (!allowed.includes(value as T)) throw new Error(`${where}: "${String(value)}" is not one of ${allowed.join(", ")}`);
  return value as T;
}

function num(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${where}: expected a number, got ${String(value)}`);
  return value;
}

function optNum(value: unknown, where: string): number | undefined {
  return value === undefined ? undefined : num(value, where);
}

/** Last frame with audible speech, plus a short tail so the final caption can be read. */
function speechEnd(envelope: number[], frames: number): number {
  let last = 0;
  envelope.forEach((v, i) => {
    if (v > 0.03) last = i;
  });
  return Math.min(frames, last + 12);
}

function parseCaptions(words: Json[], envelope: number[], frames: number): Caption[] {
  const end = speechEnd(envelope, frames);
  return words.map((w, i) => ({
    text: String(w.text),
    from: w.from,
    to: i + 1 < words.length ? words[i + 1].from : Math.max(end, w.from + 15),
  }));
}

function parseActor(a: Json, where: string): ActorCue {
  return {
    key: String(a.key ?? a.char),
    char: String(a.char),
    x: num(a.x, `${where}.x`),
    y: optNum(a.y, `${where}.y`),
    toX: optNum(a.toX, `${where}.toX`),
    facing: oneOf(["left", "right"] as const, a.facing, `${where}.facing`),
    pose: oneOf(POSES, a.pose, `${where}.pose`),
    then: a.then === undefined ? undefined : oneOf(POSES, a.then, `${where}.then`),
    expr: oneOf(EXPRESSIONS, a.expr, `${where}.expr`),
    speaks: a.speaks === true,
    variant: a.variant === undefined ? undefined : String(a.variant),
  };
}

/** Joins story.json (what each beat shows) with timing.json (when it plays). The only place raw JSON is trusted. */
export function parseStory(storyJson: Json, timingJson: Json): Story {
  const timings = new Map<string, Json>(timingJson.beats.map((t: Json) => [t.id, t]));
  const beats: Beat[] = storyJson.beats.map((b: Json): Beat => {
    const t = timings.get(b.id);
    if (!t) throw new Error(`beat ${b.id} has no entry in timing.json`);
    const shot = b.shot;
    const cam = shot.camera ?? { move: "hold" };
    return {
      id: b.id,
      from: num(t.from, `${b.id}.from`),
      frames: num(t.frames, `${b.id}.frames`),
      set: String(shot.env),
      mood: oneOf(MOODS, shot.mood ?? "day", `${b.id}.mood`),
      camera: {
        move: oneOf(MOVES, cam.move ?? "hold", `${b.id}.camera.move`),
        zoom: optNum(cam.zoom, `${b.id}.camera.zoom`),
        x: optNum(cam.x, `${b.id}.camera.x`),
        y: optNum(cam.y, `${b.id}.camera.y`),
      },
      actors: (shot.actors ?? []).map((a: Json, i: number) => parseActor(a, `${b.id}.actors[${i}]`)),
      envelope: t.envelope,
      captions: parseCaptions(t.words ?? [], t.envelope, t.frames),
    };
  });
  beats.forEach((b, i) => {
    const expected = i === 0 ? 0 : beats[i - 1].from + beats[i - 1].frames;
    if (b.from !== expected) throw new Error(`beat ${b.id} starts at ${b.from}, expected ${expected} (beats must be contiguous)`);
  });
  return {
    id: String(storyJson.id),
    title: String(storyJson.title),
    fps: num(timingJson.fps, "timing.fps"),
    frames: num(timingJson.frames, "timing.frames"),
    audio: String(timingJson.audio),
    music: timingJson.music ? String(timingJson.music) : null,
    beats,
  };
}

/** Fails the render up front if the story names a set or character the look does not provide. */
export function checkAgainstRegistry(story: Story, registry: Registry): void {
  for (const b of story.beats) {
    if (!registry.sets[b.set]) throw new Error(`beat ${b.id}: set "${b.set}" is not in the registry (have: ${Object.keys(registry.sets).join(", ")})`);
    for (const a of b.actors) {
      if (!registry.characters[a.char]) throw new Error(`beat ${b.id}: character "${a.char}" is not in the registry (have: ${Object.keys(registry.characters).join(", ")})`);
    }
  }
}

export async function loadStory(storyId: string): Promise<Story> {
  const get = async (name: string) => {
    const res = await fetch(staticFile(`stories/${storyId}/${name}`));
    if (!res.ok) throw new Error(`could not load stories/${storyId}/${name}: HTTP ${res.status}`);
    return res.json();
  };
  const [storyJson, timingJson] = await Promise.all([get("story.json"), get("timing.json")]);
  return parseStory(storyJson, timingJson);
}
