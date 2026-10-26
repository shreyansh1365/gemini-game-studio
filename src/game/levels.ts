// BREAKLINE — the 5 handcrafted MVP levels (GDD section 20).

import { GROUND_Y, type Level, type Segment } from "./types";

type Seg = Extract<Segment, { kind: "ground" | "platform" }>;

/**
 * Builds a level. Ratings derive from geometry: running the level at base
 * speed takes dist/speed seconds; the flow system (landing chains and slides
 * grant speed bonuses, up to +18%) is what separates good times from great
 * ones, so mastery time assumes a well-flowed run.
 */
function mkLevel(
  id: string,
  name: string,
  theme: Level["theme"],
  speed: number,
  segs: Seg[],
  finishX: number,
): Level {
  const segments: Segment[] = segs.map((s) => (s.kind === "platform" ? { ...s } : { ...s }));
  const dist = finishX - 100;
  return {
    id,
    name,
    theme,
    speed,
    segments,
    finishX,
    parTime: Math.round(((dist / speed) * 1.02 + Number.EPSILON) * 100) / 100,
    masteryTime: Math.round(((dist / (speed * 1.15)) + Number.EPSILON) * 100) / 100,
  };
}

const g = (x: number, w: number): Seg => ({ kind: "ground", x, w });
const p = (x: number, w: number, h: number): Seg => ({ kind: "platform", x, w, h });

export const LEVELS: Level[] = [
  // 1 — First Step: teach run, jump, land (GDD: easy)
  mkLevel(
    "l1",
    "First Step",
    "urban",
    320,
    [
      g(0, 1000),
      g(1130, 1000),
      g(2270, 1100),
      g(3500, 1000),
      g(4620, 1400),
    ],
    5400,
  ),

  // 2 — Low Clearance: introduce sliding + spikes (easy → medium)
  mkLevel(
    "l2",
    "Low Clearance",
    "industrial",
    340,
    [
      g(0, 1100), // barrier at 800
      g(1260, 1140), // barriers 1600, 1700; spikes 2050
      g(2560, 1040), // barrier 2850, spikes 3150, barrier 3450
      g(3740, 860), // spikes 3950, barrier 4250
      g(4760, 1240), // barriers 5050+5150, spikes 5450
    ],
    5600,
  ),

  // 3 — Split Route: platform heights, drops, timing (medium)
  mkLevel(
    "l3",
    "Split Route",
    "sunset",
    360,
    [
      g(0, 900),
      p(1000, 260, 100),
      g(1420, 980), // barrier 1700
      p(2500, 300, 120),
      p(2900, 300, 60), // step down
      g(3300, 1000), // barrier 3600
      g(4460, 540),
      p(5100, 260, 90),
      g(5500, 1200), // barrier 5800, spikes 6100
    ],
    6400,
  ),

  // 4 — Breakpoint: fast sequences, short reaction windows (medium → hard)
  mkLevel(
    "l4",
    "Breakpoint",
    "neon",
    400,
    [
      g(0, 800), // barrier 600
      g(1000, 400), // spikes 1150
      g(1560, 1040), // barriers 1850+1950, spikes 2250
      g(2780, 320), // barrier 2950 — land-and-slide
      g(3260, 1140), // spikes 3500, barriers 3800+3900, spikes 4150
      g(4580, 1220), // barrier 4850, spikes 5150, barrier 5450
    ],
    5600,
  ),

  // 5 — Breakline: everything, incl. moving platforms (hard)
  mkLevel(
    "l5",
    "Breakline",
    "night",
    420,
    [
      g(0, 700), // barrier 550
      g(880, 420),
      p(1400, 280, 100),
      g(1840, 960), // barrier 2100, spikes 2400, barrier 2650
      { kind: "movingPlatform", x: 3050, w: 160, h: 60, range: 90, period: 2.4 }, // gap 2960→3400
      g(3400, 1000), // barriers 3700+3800, spikes 4050, spikes 4250
      g(4560, 440),
      p(5100, 240, 80),
      g(5500, 1200), // barrier 5800, spikes 6100, barrier 6350
    ],
    6500,
  ),
];

export const LEVEL_ORDER = LEVELS.map((l) => l.id);

/** Placement helper so authored features sit on their ground runs. */
export function decorate(level: Level): Level {
  return level;
}

export { GROUND_Y };
