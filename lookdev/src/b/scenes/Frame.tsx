import React from 'react';
import { AbsoluteFill } from 'remotion';
import { H, W } from '../Atmosphere';

export const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </svg>
  </AbsoluteFill>
);
