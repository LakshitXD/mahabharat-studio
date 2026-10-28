import React from 'react';
import { Grain, Vignette } from '../Atmosphere';
import { KING } from '../expressions';
import { DAY } from '../palette';
import { RedArrow, Shantanu } from '../Shantanu';
import { Frame } from './Frame';
import { CLOSE_SKY, Sky } from './sky';

export const ShantanuClose: React.FC = () => (
  <Frame>
    <Sky mood={DAY} layout={CLOSE_SKY} />
    <Vignette mood={DAY} c={[960, 800]} strength={0.3} />
    <Shantanu
      x={960}
      y={595}
      scale={1}
      line={5}
      face={KING.neutral}
      idPrefix="sc"
      fistAt={[-222, 380]}
      fistAngle={-30}
      holding={<RedArrow from={[30, 250]} to={[930, 1180]} width={13} part="shaft" />}
      holdingFront={<RedArrow from={[30, 250]} to={[930, 1180]} width={13} part="fletch" fletchAt={0.8} />}
    />
    <Grain seed={3} opacity={DAY.grainOpacity} />
  </Frame>
);
