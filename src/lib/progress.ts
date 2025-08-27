// src/lib/progress.ts
// Safe, browser-friendly progress storage + helpers (no 'any').

export type Progress = {
  points: number;
  correct: number;
  total: number;
  streakDays: number;
  lastActiveAt: string | null;
  email: string | null;
  activities: number;
};

const KEY = 'sunnytutor:progress:v1';

const DEFAULT_PROGRESS: Progress = {
  points: 0,
  correct: 0,
  total: 0,
  streakDays: 0,
  lastActiveAt: null,
  email: null,
  activities: 0,
};

function inBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function mergeProgress(a: Progress, b: Partial<Progress>): Progress {
  return {
    points: b.points ?? a.points,
    correct: b.correct ?? a.correct,
    total: b.total ?? a.total,
    streakDays: b.streakDays ?? a.streakDays,
    lastActiveAt: b.lastActiveAt ?? a.lastActiveAt,
    email: b.email ?? a.email,
    activities: b.activities ?? a.activities,
  };
}

export function loadProgress(): Progress {
  if (!inBrowser()) return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return mergeProgress(DEFAULT_PROGRESS, parsed);
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(update: Partial<Progress>): Progress {
  const prev = loadProgress();
  const next = mergeProgress(prev, {
    ...update,
    lastActiveAt: new Date().toISOString(),
  });
  if (inBrowser()) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore write errors */
    }
  }
  return next;
}

export function getEmail(): string | null {
  return loadProgress().email;
}

export function setEmail(email: string | null): Progress {
  return saveProgress({ email });
}

export function bumpActivity(opts?: {
  pointsDelta?: number;
  correctDelta?: number;
  totalDelta?: number;
}): Progress {
  const { pointsDelta = 0, correctDelta = 0, totalDelta = 0 } = opts ?? {};
  const p = loadProgress();
  return saveProgress({
    activities: p.activities + 1,
    points: p.points + pointsDelta,
    correct: p.correct + correctDelta,
    total: p.total + totalDelta,
  });
}

export function getStats(): {
  points: number;
  streakDays: number;
  activities: number;
  accuracy: number; // 0–100 (rounded)
} {
  const p = loadProgress();
  const accuracy =
    p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
  return {
    points: p.points,
    streakDays: p.streakDays,
    activities: p.activities,
    accuracy,
  };
}
