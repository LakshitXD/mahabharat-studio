export const LINE_W = 3.2;

export type Mood = "warm" | "night";

export type SkyPalette = {
  glowCore: string;
  glowMid: string;
  ground: string;
  groundDark: string;
  cloud: string;
  cloudDeep: string;
  cloudEdge: string;
  curl: string;
  ray: string;
};

export const SKY: Record<Mood, SkyPalette> = {
  warm: {
    glowCore: "#eec196",
    glowMid: "#d08763",
    ground: "#a5523f",
    groundDark: "#4e1a19",
    cloud: "#561c1d",
    cloudDeep: "#240809",
    cloudEdge: "#b8604a",
    curl: "#c06a50",
    ray: "#f6d2a8",
  },
  night: {
    glowCore: "#4a3f86",
    glowMid: "#2e2664",
    ground: "#241c4e",
    groundDark: "#140f2c",
    cloud: "#1a1540",
    cloudDeep: "#0d0a22",
    cloudEdge: "#5d4a9c",
    curl: "#7a66b8",
    ray: "#8f84c9",
  },
};

export const KING = {
  ink: "#0a0000",
  line: "#e9bb8f",
  lineBright: "#f3c298",
  pupil: "#1a0a06",
  accent: "#ef000c",
  gold: "#e0a040",
};

export const GANGA = {
  face: "#eee9ed",
  blush: "#f1cfd8",
  contour: "#4a3d5a",
  hair: "#2a2238",
  strand: "#5c4c67",
  iris: "#8f86c0",
  pupil: "#241c33",
  lip: "#aaa4c4",
  lipDark: "#6f6890",
  robe: "#262457",
  robeDeep: "#17153a",
  robeLine: "#bcd4ee",
  veil: "#dfe9f8",
  halo: "#f0e8ff",
};
