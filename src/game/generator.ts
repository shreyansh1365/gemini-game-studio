// BREAKLINE — converts a small AI step list (from Gemini) into a playable,
// clamped level. Client-safe: used on the server after generation and in the
// browser for validation. All randomness-free: identical steps → same level.

import {
  GROUND_Y,
  STEP_TYPES,
  clamp,
  isTheme,
  type AiLevelSpec,
  type Level,
  type Segment,
  type StepType,
} from "./types";

export type Difficulty = 1 | 2 | 3;

const SPEED: Record<Difficulty, number> = { 1: 340, 2: 380, 3: 420 };
const INTER_RUN: Record<Difficulty, number> = { 1: 300, 2: 260, 3: 220 };

export function normalizeSpec(raw: unknown): AiLevelSpec {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const name =
    typeof obj.name === "string" && obj.name.trim().length > 0
      ? obj.name.trim().slice(0, 20)
      : "AI Gauntlet";
  const theme = isTheme(obj.theme) ? obj.theme : "night";
  const stepsRaw = Array.isArray(obj.steps) ? obj.steps : [];
  const steps: AiLevelSpec["steps"] = [];
  for (const s of stepsRaw.slice(0, 26)) {
    const t = (s as Record<string, unknown>)?.type;
    if (typeof t === "string" && (STEP_TYPES as readonly string[]).includes(t)) {
      const rec = s as Record<string, unknown>;
      steps.push({
        type: t as StepType,
        gap: typeof rec.gap === "number" ? rec.gap : null,
        height: typeof rec.height === "number" ? rec.height : null,
      });
    }
  }
  if (steps.length < 6) {
    steps.push({ type: "gap", gap: 140, height: null }, { type: "lowBarrier", gap: null, height: null });
  }
  return { name, theme, steps };
}

export function buildLevelFromSteps(spec: AiLevelSpec, difficulty: Difficulty): Level {
  const d = difficulty;
  const speed = SPEED[d];
  const inter = INTER_RUN[d];
  const segments: Segment[] = [];

  let cursor = 600; // safe starting runway 0..600
  let surface = 0; // current top height above the ground baseline
  let prevWasGap = false;

  const run = (w: number) => {
    const seg =
      surface === 0
        ? ({ kind: "ground", x: cursor, w } as Segment)
        : ({ kind: "platform", x: cursor, w, h: surface } as Segment);
    segments.push(seg);
    cursor += w;
  };

  for (const step of spec.steps) {
    switch (step.type) {
      case "gap": {
        if (prevWasGap) {
          run(inter); // never allow two gaps in a row
          prevWasGap = false;
          break;
        }
        const gw = clamp(step.gap ?? 140, 90, 120 + d * 40);
        cursor += gw;
        prevWasGap = true;
        break;
      }
      case "lowBarrier": {
        run(inter);
        const x = cursor - inter + 110;
        segments.push({ kind: "lowBarrier", x });
        segments.push(
          surface === 0
            ? { kind: "ground", x: cursor - inter, w: inter }
            : { kind: "platform", x: cursor - inter, w: inter, h: surface },
        );
        prevWasGap = false;
        break;
      }
      case "spikes": {
        run(inter);
        const w = clamp(step.gap ?? 110, 50, 100 + d * 30);
        segments.push({ kind: "spikes", x: cursor - inter + 90, w });
        prevWasGap = false;
        break;
      }
      case "platform": {
        run(inter);
        const w = clamp(step.gap ?? 260, 160, 380);
        const h = surface + clamp(step.height ?? 80, 40, Math.min(120, surface + 120));
        segments.push({ kind: "platform", x: cursor, w, h });
        cursor += w;
        surface = h;
        prevWasGap = false;
        break;
      }
      case "stepUp": {
        run(inter);
        const h = surface + clamp(step.height ?? 70, 40, Math.min(110, 130 - surface));
        surface = h;
        prevWasGap = false;
        break;
      }
      case "stepDown": {
        const h = Math.max(0, surface - clamp(step.height ?? 80, 40, 130));
        surface = h;
        run(inter);
        prevWasGap = false;
        break;
      }
      case "movingPlatform": {
        cursor += 240; // too wide to jump straight across
        segments.push({
          kind: "movingPlatform",
          x: cursor,
          w: 150,
          h: surface + 40,
          range: clamp(step.gap ?? 90, 60, 110),
          period: 2.6,
        });
        cursor += 150 + 240;
        prevWasGap = false;
        break;
      }
    }
  }

  // Bring the player back to the ground and finish.
  if (surface > 0) {
    segments.push({ kind: "platform", x: cursor, w: 140, h: surface });
    cursor += 140;
    surface = 0;
  }
  segments.push({ kind: "ground", x: cursor, w: 520 });
  const finishX = cursor + 280;
  segments.push({ kind: "finish", x: finishX });

  const dist = finishX - 100;
  return {
    id: "ai-level",
    name: spec.name,
    theme: spec.theme,
    speed,
    segments,
    finishX,
    parTime: Math.round(((dist / speed) * 1.02 + Number.EPSILON) * 100) / 100,
    masteryTime: Math.round((dist / (speed * 1.15) + Number.EPSILON) * 100) / 100,
  };
}

export { GROUND_Y };
