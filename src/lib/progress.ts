'use client';

export type ProgressData = {
  points: number;
  streakDays: number;
  activities: number;
  quizzesTaken: number;
  correctAnswers: number;
  lastQuizAt?: string; // ISO date
  email?: string;
};

const KEY = 'sunny.progress.v1';

// A tiny event bus so UI can update when progress changes
export const progressEvents = new EventTarget();

export function loadProgress(): ProgressData {
  if (typeof window === 'undefined') {
    // SSR safety: return a neutral snapshot
    return {
      points: 0,
      streakDays: 0,
      activities: 0,
      quizzesTaken: 0,
      correctAnswers: 0,
      lastQuizAt: undefined,
      email: undefined,
    };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error('no progress');
    const parsed = JSON.parse(raw) as ProgressData;
    return {
      points: parsed.points ?? 0,
      streakDays: parsed.streakDays ?? 0,
      activities: parsed.activities ?? 0,
      quizzesTaken: parsed.quizzesTaken ?? 0,
      correctAnswers: parsed.correctAnswers ?? 0,
      lastQuizAt: parsed.lastQuizAt,
      email: parsed.email,
    };
  } catch {
    return {
      points: 0,
      streakDays: 0,
      activities: 0,
      quizzesTaken: 0,
      correctAnswers: 0,
      lastQuizAt: undefined,
      email: undefined,
    };
  }
}

export function saveProgress(p: ProgressData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
  progressEvents.dispatchEvent(new Event('update'));
}

// Simple helper to apply quiz results
export function recordQuiz(correct: number, total: number) {
  const now = new Date().toISOString();
  const current = loadProgress();

  const POINTS_PER_CORRECT = 10;
  const gained = correct * POINTS_PER_CORRECT;

  const updated: ProgressData = {
    ...current,
    points: Math.max(0, current.points + gained),
    activities: current.activities + 1,
    quizzesTaken: current.quizzesTaken + 1,
    correctAnswers: current.correctAnswers + correct,
    lastQuizAt: now,
    // very simple streak bump: if you want real day boundaries later, replace this
    streakDays: Math.max(1, current.streakDays || 0),
  };

  saveProgress(updated);
  return updated;
}

export function setEmail(email: string) {
  const p = loadProgress();
  p.email = email.trim();
  saveProgress(p);
}
