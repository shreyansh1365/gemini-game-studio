// BREAKLINE — local progression storage (best times, stars, unlocks, settings).

import type { Level } from "./types";

export type LevelRecord = { bestTime: number | null; stars: number };

const KEY = "breakline.progress.v1";
const AI_KEY = "breakline.ai-level.v1";

export type Progress = {
  records: Record<string, LevelRecord>; // keyed by level id
  aiRuns: number; // how many AI levels were played
};

function read(): Progress {
  if (typeof localStorage === "undefined") return { records: {}, aiRuns: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { records: {}, aiRuns: 0 };
    const p = JSON.parse(raw) as Progress;
    return { records: p.records ?? {}, aiRuns: p.aiRuns ?? 0 };
  } catch {
    return { records: {}, aiRuns: 0 };
  }
}

function write(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — progression stays session-only */
  }
}

export function getRecord(levelId: string): LevelRecord {
  return read().records[levelId] ?? { bestTime: null, stars: 0 };
}

export function isUnlocked(levelId: string, order: string[]): boolean {
  const idx = order.indexOf(levelId);
  if (idx <= 0) return true;
  return getRecord(order[idx - 1]).stars > 0;
}

export function submitRun(level: Level, time: number): { bestTime: number | null; stars: number; newBest: boolean } {
  const prev = getRecord(level.id);
  const stars = time <= level.masteryTime ? 3 : time <= level.parTime ? 2 : 1;
  const newBest = prev.bestTime === null || time < prev.bestTime;
  const bestTime = newBest ? time : prev.bestTime;
  const p = read();
  p.records[level.id] = { bestTime, stars: Math.max(prev.stars, stars) };
  if (level.id.startsWith("ai-")) p.aiRuns += 1;
  write(p);
  return { bestTime, stars, newBest };
}

export function getProgress(): Progress {
  return read();
}

// Cache of the most recently generated AI level so it can be replayed.
export function saveAiLevel(level: Level) {
  try {
    localStorage.setItem(AI_KEY, JSON.stringify(level));
  } catch {
    /* ignore */
  }
}

export function loadAiLevel(): Level | null {
  try {
    const raw = localStorage.getItem(AI_KEY);
    return raw ? (JSON.parse(raw) as Level) : null;
  } catch {
    return null;
  }
}
