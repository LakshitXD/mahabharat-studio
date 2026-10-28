import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import { registry } from "./registry";
import type { Story } from "./story";
import { actorAt, captionAt, cameraAt, framedCamera, musicVolume, shotAt, titleOpacity, type BeatAt } from "./timeline";

export type StoryVideoProps = { storyId: string; story: Story | null };

const CREAM = "#e5b28c";
const SERIF = "'Cormorant Garamond', 'EB Garamond', 'Noto Serif Display', 'Noto Serif', 'DejaVu Serif', serif";

const Stage: React.FC<{ at: BeatAt; frame: number; fps: number; opacity: number }> = ({ at, frame, fps, opacity }) => {
  const { beat, local } = at;
  const set = registry.sets[beat.set];
  const figurePx = (cue: { char: string }) => registry.characters[cue.char].height * set.actorScale;
  const view = cameraAt(framedCamera(beat.camera, beat, figurePx, set.groundY), local, beat.frames);
  const camera = `translate(960 540) scale(${view.zoom}) translate(${-view.cx * 1920} ${-view.cy * 1080})`;
  const setProps = { mood: beat.mood, frame };
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      <g transform={camera}>
        <set.Back {...setProps} />
        {beat.actors.map((cue) => {
          const def = registry.characters[cue.char];
          const s = actorAt(cue, beat, local, frame, fps, { groundY: set.groundY, actorScale: set.actorScale, figureHeight: def.height });
          const mirror = cue.facing === "left" ? -1 : 1;
          return (
            <g key={cue.key} transform={`translate(${s.x} ${s.y}) scale(${mirror * s.scale} ${s.scale})`}>
              <def.Component {...s.props} />
            </g>
          );
        })}
        {set.Front && <set.Front {...setProps} />}
      </g>
    </svg>
  );
};

const CaptionBand: React.FC<{ at: BeatAt }> = ({ at }) => {
  const caption = captionAt(at.beat, at.local);
  if (!caption) return null;
  return (
    <AbsoluteFill style={{ top: "auto", height: "12%", opacity: caption.opacity, alignItems: "center", justifyContent: "center", background: "linear-gradient(to bottom, rgba(14,9,6,0), rgba(14,9,6,0.62) 40%, rgba(14,9,6,0.72))" }}>
      <div style={{ fontFamily: SERIF, fontSize: 48, color: CREAM, letterSpacing: "0.02em", textShadow: "0 2px 6px rgba(0,0,0,0.6)", paddingTop: 18 }}>{caption.text}</div>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{ title: string; opacity: number }> = ({ title, opacity }) =>
  opacity <= 0 ? null : (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center, rgba(14,9,6,0.55), rgba(14,9,6,0.25) 70%)" }}>
      <div style={{ fontFamily: SERIF, color: CREAM, textAlign: "center", textShadow: "0 3px 12px rgba(0,0,0,0.55)" }}>
        <div style={{ fontSize: 30, letterSpacing: "0.5em", textTransform: "uppercase", opacity: 0.85 }}>Mahabharat</div>
        <div style={{ width: 120, height: 1, background: CREAM, margin: "22px auto 26px", opacity: 0.7 }} />
        <div style={{ fontSize: 112, fontWeight: 400, letterSpacing: "0.03em" }}>{title}</div>
      </div>
    </AbsoluteFill>
  );

export const StoryVideo: React.FC<StoryVideoProps> = ({ story }) => {
  const frame = useCurrentFrame();
  if (!story) throw new Error("story-en: story props missing; calculateMetadata should have loaded them");
  const shot = shotAt(story, frame);
  return (
    <AbsoluteFill style={{ background: "#0e0906" }}>
      {shot.previous && <Stage at={shot.previous} frame={frame} fps={story.fps} opacity={1} />}
      <Stage at={shot.current} frame={frame} fps={story.fps} opacity={shot.previous ? shot.previous.coverOpacity : 1} />
      <CaptionBand at={shot.current} />
      <TitleCard title={story.title} opacity={titleOpacity(frame, story.fps)} />
      <Html5Audio src={staticFile(story.audio)} />
      {story.music && <Html5Audio src={staticFile(story.music)} volume={(f) => musicVolume(f, story.frames, story.fps)} />}
    </AbsoluteFill>
  );
};
