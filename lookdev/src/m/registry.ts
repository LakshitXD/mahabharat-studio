import type { Registry } from "../shared/contract";
import { Ganga, GANGA_PX } from "./ganga";
import { gangaTat } from "./set";
import { KING_PX, Shantanu } from "./shantanu";

export const registry: Registry = {
  characters: {
    shantanu: { id: "shantanu", Component: Shantanu, height: KING_PX },
    ganga: { id: "ganga", Component: Ganga, height: GANGA_PX },
  },
  sets: {
    "ganga-tat": gangaTat,
  },
};
