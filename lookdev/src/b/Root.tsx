import React from 'react';
import { Composition } from 'remotion';
import { Expressions } from './scenes/Expressions';
import { GangaClose } from './scenes/GangaClose';
import { Motion } from './scenes/Motion';
import { ShantanuClose } from './scenes/ShantanuClose';
import { Wide } from './scenes/Wide';

const frame = { width: 1920, height: 1080, fps: 30 } as const;

export const Root: React.FC = () => (
  <>
    <Composition id="wide" component={Wide} {...frame} durationInFrames={1} />
    <Composition id="shantanu-close" component={ShantanuClose} {...frame} durationInFrames={1} />
    <Composition id="ganga-close" component={GangaClose} {...frame} durationInFrames={1} />
    <Composition id="expressions" component={Expressions} {...frame} durationInFrames={1} />
    <Composition id="motion" component={Motion} {...frame} durationInFrames={90} />
  </>
);
