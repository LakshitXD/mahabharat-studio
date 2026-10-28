import { Easing, interpolate, random } from "remotion";
import type { ActorProps, Viseme } from "../shared/contract";
import type { ActorCue, Beat, Camera, Story } from "./story";

const clamp01 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = Easing.inOut(Easing.cubic);

export const CROSSFADE_FRAMES = 8;
/** Share of the beat a walk takes; the rest is the actor settled at its destination. */
const WALK_SHARE = 0.7;
/** One full gait cycle (two steps) as a share of the figure's drawn height. */
const GAIT_CYCLE_OF_HEIGHT = 0.8;

export type BeatAt = { beat: Beat; index: number; local: number };

/** A frame shows one beat, or two while crossfading out of the previous one. */
export type Shot = { current: BeatAt; previous: (BeatAt & { coverOpacity: number }) | null };

export function beatAt(story: Story, frame: number): BeatAt {
  let index = story.beats.length - 1;
  while (index > 0 && story.beats[index].from > frame) index--;
  const beat = story.beats[index];
  return { beat, index, local: frame - beat.from };
}

function needsCrossfade(a: Beat, b: Beat): boolean {
  return a.set !== b.set || a.mood !== b.mood;
}

export function shotAt(story: Story, frame: number): Shot {
  const current = beatAt(story, frame);
  const prevBeat = story.beats[current.index - 1];
  if (!prevBeat || current.local >= CROSSFADE_FRAMES || !needsCrossfade(prevBeat, current.beat)) {
    return { current, previous: null };
  }
  return {
    current,
    previous: {
      beat: prevBeat,
      index: current.index - 1,
      local: prevBeat.frames + current.local,
      coverOpacity: interpolate(current.local, [0, CROSSFADE_FRAMES], [0, 1], { ...clamp01, easing: easeInOut }),
    },
  };
}

export type ActorState = {
  /** Feet position in stage px. */
  x: number;
  y: number;
  scale: number;
  props: ActorProps;
};

export type Placement = { groundY: number; actorScale: number; figureHeight: number };

export function actorAt(cue: ActorCue, beat: Beat, local: number, frame: number, fps: number, place: Placement): ActorState {
  const walkFrames = Math.max(1, Math.round(beat.frames * WALK_SHARE));
  const walks = cue.toX !== undefined && cue.toX !== cue.x;
  const progress = walks ? interpolate(local, [0, walkFrames], [0, 1], { ...clamp01, easing: easeInOut }) : 0;
  const xFrac = walks ? cue.x + (cue.toX! - cue.x) * progress : cue.x;
  const moving = walks && local < walkFrames;
  const settledPose = cue.then ?? (cue.pose === "walk" ? "stand" : cue.pose);

  const cyclePx = GAIT_CYCLE_OF_HEIGHT * place.figureHeight * place.actorScale;
  const travelledPx = Math.abs(xFrac - cue.x) * 1920;

  return {
    x: xFrac * 1920,
    y: (cue.y ?? place.groundY) * 1080,
    scale: place.actorScale,
    props: {
      pose: moving ? "walk" : walks ? settledPose : cue.pose,
      expression: cue.expr,
      mouth: cue.speaks ? mouthAt(beat, local) : 0,
      viseme: cue.speaks ? visemeAt(beat.envelope, local) : "rest",
      blink: blinkAt(cue.key, frame, fps),
      facing: cue.facing,
      walkPhase: moving ? (travelledPx / cyclePx) % 1 : 0,
      frame: local,
      variant: cue.variant,
    },
  };
}

function mouthAt(beat: Beat, local: number): number {
  return beat.envelope[local] ?? 0;
}

/**
 * Picks a mouth shape from the envelope's level and direction. Closures between syllables read as MBP,
 * wide peaks as AI, a falling mid level as O (vowel tail), a rising one as E.
 */
export function visemeAt(envelope: number[], i: number): Viseme {
  const m = envelope[i] ?? 0;
  if (m < 0.06) return "rest";
  const prev = envelope[i - 1] ?? 0;
  const next = envelope[i + 1] ?? 0;
  if (m < 0.22 && m <= prev && m <= next) return "MBP";
  if (m > 0.7) return "AI";
  if (m > 0.3) return m < prev ? "O" : "E";
  return "E";
}

const BLINK_FRAMES = 6;

/**
 * 0 open .. 1 closed. Each actor blinks every 3-5 s on its own deterministic schedule, keyed by
 * the actor's story key and the absolute frame so blinks run continuously across cuts.
 */
export function blinkAt(key: string, frame: number, fps: number): number {
  let start = Math.round(random(`blink-${key}-offset`) * 2 * fps);
  for (let n = 0; start <= frame; n++) {
    const t = frame - start;
    if (t < BLINK_FRAMES) return interpolate(t, [0, 2, 3, BLINK_FRAMES], [0, 1, 1, 0], clamp01);
    start += Math.round((3 + 2 * random(`blink-${key}-${n}`)) * fps);
  }
  return 0;
}

/** The stage point (fractions) shown at the frame centre, at a zoom. */
export type View = { zoom: number; cx: number; cy: number };

const PUSH_IN_WIDE = 1.12;
const PUSH_IN_CLOSE = 1.08;
const PAN_ZOOM = 1.1;
/** Pan drift in frame widths over a full beat. */
const PAN_DRIFT = 0.06;

/** story.json zooms at or above this are close-ups; this look frames them on the face, not the whole figure. */
const CLOSE_ZOOM = 1.5;
/** A close-up shows this share of the figure's height (head and chest), centred this far up the figure. */
const CLOSE_SHOWS = 0.5;
const CLOSE_CENTRE = 0.78;

/** Re-aims a close-up at the head and chest of the actor nearest the story's camera x. */
export function framedCamera(camera: Camera, beat: Beat, figurePx: (cue: ActorCue) => number, groundY: number): Camera {
  if ((camera.zoom ?? 1) < CLOSE_ZOOM || beat.actors.length === 0) return camera;
  const cx = camera.x ?? 0.5;
  const at = (c: ActorCue) => c.toX ?? c.x;
  const subject = beat.actors.reduce((a, b) => (Math.abs(at(b) - cx) < Math.abs(at(a) - cx) ? b : a));
  const px = figurePx(subject);
  const feet = (subject.y ?? groundY) * 1080;
  return { ...camera, zoom: 1080 / (px * CLOSE_SHOWS), x: at(subject), y: (feet - px * CLOSE_CENTRE) / 1080 };
}

export function cameraAt(camera: Camera, local: number, frames: number): View {
  const base = camera.zoom ?? 1;
  const t = interpolate(local, [0, frames], [0, 1], clamp01);
  let zoom = base;
  let cx = camera.x ?? 0.5;
  const cy = camera.y ?? 0.5;
  if (camera.move === "push-in") {
    const end = camera.zoom === undefined ? PUSH_IN_WIDE : base * PUSH_IN_CLOSE;
    zoom = interpolate(easeInOut(t), [0, 1], [base, end]);
  } else if (camera.move === "pan-right") {
    zoom = Math.max(base, PAN_ZOOM);
    cx += interpolate(t, [0, 1], [-PAN_DRIFT, PAN_DRIFT]);
  }
  return { zoom, cx: keepInFrame(cx, zoom), cy: keepInFrame(cy, zoom) };
}

/** Stops the view from showing past the stage edge. */
function keepInFrame(c: number, zoom: number): number {
  const half = 0.5 / zoom;
  return Math.min(1 - half, Math.max(half, c));
}

const CAPTION_FADE = 5;

export function captionAt(beat: Beat, local: number): { text: string; opacity: number } | null {
  const c = beat.captions.find((c) => local >= c.from && local < c.to);
  if (!c) return null;
  const fade = Math.min(CAPTION_FADE, (c.to - c.from) / 3);
  const opacity = interpolate(local, [c.from, c.from + fade, c.to - fade, c.to], [0, 1, 1, 0], clamp01);
  return { text: c.text, opacity };
}

export function titleOpacity(frame: number, fps: number): number {
  return interpolate(frame, [1.5 * fps, 2.5 * fps], [1, 0], clamp01);
}

export const MUSIC_VOLUME = 0.12;

export function musicVolume(frame: number, total: number, fps: number): number {
  return MUSIC_VOLUME * interpolate(frame, [0, 1.5 * fps, total - 2.5 * fps, total], [0, 1, 1, 0], clamp01);
}
