// BREAKLINE — shared level format. Client-safe (no DOM, no server imports).

export type Theme = "urban" | "industrial" | "sunset" | "neon" | "night";

export type Segment =
  | { kind: "ground"; x: number; w: number }
  | { kind: "platform"; x: number; w: number; h: number }
  | { kind: "movingPlatform"; x: number; w: number; h: number; range: number; period: number }
  | { kind: "spikes"; x: number; w: number }
  | { kind: "lowBarrier"; x: number }
  | { kind: "finish"; x: number };

export type Level = {
  id: string;
  name: string;
  theme: Theme;
  /** Run speed in px/s. */
  speed: number;
  segments: Segment[];
  finishX: number;
  /** Seconds for the 2-star rating. */
  parTime: number;
  /** Seconds for the 3-star mastery rating. */
  masteryTime: number;
};

// World geometry constants (shared with the engine).
export const GROUND_Y = 560; // baseline top of ground, world px (y grows downward)
export const KILL_Y = GROUND_Y + 220; // falling below this = death
export const PLAYER_W = 34;
export const PLAYER_H = 56;
export const PLAYER_SLIDE_H = 26;
/** Overhead slide bar: standing height (56) overlaps it, sliding height (26) passes. */
export const BARRIER_BOTTOM = 26; // gap under the bar when sliding

// ---------- AI step grammar (small, flat — what Gemini returns) ----------

export const STEP_TYPES = [
  "gap",
  "platform",
  "stepUp",
  "stepDown",
  "lowBarrier",
  "spikes",
  "movingPlatform",
] as const;

export type StepType = (typeof STEP_TYPES)[number];

export type AiStep = {
  type: StepType;
  /** gap width / platform width / hazard width (px). */
  gap?: number | null;
  /** platform or step height above the current surface (px). */
  height?: number | null;
};

export type AiLevelSpec = {
  name: string;
  theme: Theme;
  steps: AiStep[];
};

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function isTheme(v: unknown): v is Theme {
  return v === "urban" || v === "industrial" || v === "sunset" || v === "neon" || v === "night";
}
