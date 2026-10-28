/** Colour fields per mood, sampled from the Dragonbee refs (see STYLE.md). */
export type Mood = {
  /** radial ground, core to edge */
  ground: readonly string[];
  corner: string;
  shaft: string;
  /** cloud fill, lit side to deep side */
  cloudLit: string;
  cloudDeep: string;
  cloudShadow: string;
  /** lighter, more distant cloud layer */
  farLit: string;
  farDeep: string;
  /** swirl stroke on cloud and on open ground */
  swirlOnCloud: string;
  swirlOnGround: string;
  vignette: string;
  grainOpacity: number;
};

export const DAY: Mood = {
  ground: ['#efc298', '#eab88d', '#e2ab84', '#d89d7b', '#cc8f71', '#bf8066', '#b1725b', '#a06350'],
  corner: '#7a3c33',
  shaft: '#f0c9a0',
  cloudLit: '#7e413a',
  cloudDeep: '#2b1413',
  cloudShadow: '#2e1415',
  farLit: '#9a5446',
  farDeep: '#5c2a25',
  swirlOnCloud: '#a8524a',
  swirlOnGround: '#c98066',
  vignette: '#2a1012',
  grainOpacity: 0.26,
};

export const NIGHT: Mood = {
  ground: ['#8070c8', '#7462b8', '#6857aa', '#5d4c9e', '#534392', '#4a3b86', '#42347a', '#3a2e6e'],
  corner: '#2a2258',
  shaft: '#9c8ee0',
  cloudLit: '#3c2f78',
  cloudDeep: '#1f1848',
  cloudShadow: '#120f2c',
  farLit: '#5a4aa6',
  farDeep: '#30276a',
  swirlOnCloud: '#5f4fa6',
  swirlOnGround: '#7d6cc4',
  vignette: '#0c0a24',
  grainOpacity: 0.24,
};

export const INK = {
  silhouette: '#0b0605',
  cream: '#e5b28c',
  eyeLit: '#ecc8a0',
  red: '#d9041e',
  redDeep: '#8e0a14',
} as const;

export const SKIN = {
  face: '#fbf7f8',
  faceShade: '#e2d2dc',
  faceDeep: '#c9b5c9',
  blush: '#e8a6bc',
  iris: '#b48aa5',
  irisDeep: '#74506a',
  pupil: '#27292d',
  lips: '#71697c',
  line: '#4a3f52',
  hair: '#3a2d52',
  hairDeep: '#231a37',
  hairLine: '#6f5f96',
  veil: '#6f86e0',
  veilLine: '#b9c4f2',
  robe: '#26245f',
  robeDeep: '#1b1b4f',
  robeLine: '#9aa8ec',
  halo: '#c7d3ff',
} as const;
