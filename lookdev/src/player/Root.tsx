import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { registry } from "./registry";
import { checkAgainstRegistry, loadStory } from "./story";
import { StoryVideo, type StoryVideoProps } from "./StoryVideo";

const loadMetadata: CalculateMetadataFunction<StoryVideoProps> = async ({ props }) => {
  const story = await loadStory(props.storyId);
  checkAgainstRegistry(story, registry);
  return { durationInFrames: story.frames, fps: story.fps, props: { ...props, story } };
};

export const Root: React.FC = () => (
  <Composition
    id="story-en"
    component={StoryVideo}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1}
    defaultProps={{ storyId: "mahabharat-ganga-shantanu-en", story: null }}
    calculateMetadata={loadMetadata}
  />
);
