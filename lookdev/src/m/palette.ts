import type { Mood as MoodName } from "../shared/contract";

/** Colour field per mood. DAY and NIGHT are variant B's sampled tables; EVENING sits between them. */
export type MoodColours = {
  ground: readonly string[];
  corner: string;
  shaft: string;
  cloudLit: string;
  cloudDeep: string;
  cloudShadow: string;
  farLit: string;
  farDeep: string;
  swirlOnCloud: string;
  swirlOnGround: string;
  vignette: string;
  grainOpacity: number;
  /** river band, far shore silhouettes, near bank */
  riverTop: string;
  riverMid: string;
  riverDeep: string;
  shore: string;
  bank: string;
  bankSwirl: string;
  reed: string;
  wave: string;
  glint: string;
};

export const DAY: MoodColours = {
  ground: ["#efc298", "#eab88d", "#e2ab84", "#d89d7b", "#cc8f71", "#bf8066", "#b1725b", "#a06350"],
  corner: "#7a3c33",
  shaft: "#f0c9a0",
  cloudLit: "#7e413a",
  cloudDeep: "#2b1413",
  cloudShadow: "#2e1415",
  farLit: "#9a5446",
  farDeep: "#5c2a25",
  swirlOnCloud: "#a8524a",
  swirlOnGround: "#c98066",
  vignette: "#2a1012",
  grainOpacity: 0.26,
  riverTop: "#9a5446",
  riverMid: "#7a3a32",
  riverDeep: "#4a201d",
  shore: "#7e3e35",
  bank: "#2b1413",
  bankSwirl: "#5e2c26",
  reed: "#24100f",
  wave: "#c47a62",
  glint: "#f0c9a0",
};

export const EVENING: MoodColours = {
  ground: ["#e8a97c", "#dd9670", "#cf8366", "#bd705c", "#a85f53", "#92504b", "#7c4344", "#67383e"],
  corner: "#3e2030",
  shaft: "#f1b98a",
  cloudLit: "#6b3340",
  cloudDeep: "#241018",
  cloudShadow: "#1e0e18",
  farLit: "#84444c",
  farDeep: "#4c242e",
  swirlOnCloud: "#9a4a52",
  swirlOnGround: "#c0725f",
  vignette: "#1a0c16",
  grainOpacity: 0.25,
  riverTop: "#8a4a4a",
  riverMid: "#633038",
  riverDeep: "#331a26",
  shore: "#5e2e3a",
  bank: "#20101a",
  bankSwirl: "#4a2630",
  reed: "#180a12",
  wave: "#b4705f",
  glint: "#f3c08f",
};

export const NIGHT: MoodColours = {
  ground: ["#8070c8", "#7462b8", "#6857aa", "#5d4c9e", "#534392", "#4a3b86", "#42347a", "#3a2e6e"],
  corner: "#2a2258",
  shaft: "#9c8ee0",
  cloudLit: "#3c2f78",
  cloudDeep: "#1f1848",
  cloudShadow: "#120f2c",
  farLit: "#5a4aa6",
  farDeep: "#30276a",
  swirlOnCloud: "#5f4fa6",
  swirlOnGround: "#7d6cc4",
  vignette: "#0c0a24",
  grainOpacity: 0.24,
  riverTop: "#3a2f74",
  riverMid: "#2a2158",
  riverDeep: "#161236",
  shore: "#2c2360",
  bank: "#120f2c",
  bankSwirl: "#2a2158",
  reed: "#0e0b22",
  wave: "#7d6cc4",
  glint: "#c9c0ff",
};

export const MOODS: Record<MoodName, MoodColours> = { day: DAY, evening: EVENING, night: NIGHT };

/** The dark figure (variant A ink and line, B eye fill and accent). */
export const INK = {
  silhouette: "#0a0000",
  cream: "#e9bb8f",
  creamBright: "#f3c298",
  eyeLit: "#ecc8a0",
  pupil: "#1a0a06",
  red: "#d9041e",
} as const;

/** Ganga: variant A face, hair and features; variant B dress, veil and halo. */
export const SKIN = {
  face: "#eee9ed",
  faceShade: "#dccfd9",
  blush: "#f1cfd8",
  contour: "#4a3d5a",
  hair: "#2a2238",
  strand: "#5c4c67",
  iris: "#8f86c0",
  irisDeep: "#5f5690",
  pupil: "#241c33",
  lip: "#aaa4c4",
  lipDark: "#6f6890",
  mouth: "#4a3046",
  robe: "#26245f",
  robeDeep: "#1b1b4f",
  robeLine: "#9aa8ec",
  veil: "#6f86e0",
  veilLine: "#b9c4f2",
  halo: "#c7d3ff",
  silver: "#e2e2f6",
  silverLine: "#7a74a8",
} as const;
