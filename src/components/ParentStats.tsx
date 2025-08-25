'use client';

import { useEffect, useMemo, useState } from 'react';

type ProgressEntry = {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  date: string;     // ISO string
  score?: number;   // 0–100 (for quizzes)
  minutes?: number; // time spent
  points?: number;  // optional explicit points
};

const STORAGE_KEY = 'sunnyTutor.progress.v1';

function ymd(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function calcStreak(entries: ProgressEntry[]): number {
  if (!entries.length) return 0;
  const days = new Set(entries.map(e => ymd(e.date)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(ymd(d))) streak++;
    else break;
  }
  return streak;
}

function calcPoints(entries: ProgressEntry[]): number {
  return entries.reduce((sum, e) => {
    if (typeof e.points === 'number') return sum + e.points;
    if (e.type === 'quiz' && typeof e.score === 'number') return sum + Math.max(0, Math.round(e.score));
    if (typeof e.minutes === 'number') return sum + e.minutes;
    return sum + 5; // small default if no numbers provided
  }, 0);
}

export default function ParentStats() {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  // Load once and watch for cross-tab updates
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setEntries(raw ? (JSON.parse(raw) as ProgressEntry[]) : []);
      } catch {
        setEntries([]);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const { points, streak, activities } = useMemo(() => {
    const list = entries ?? [];
    return {
      points: calcPoints(list),
      streak: calcStreak(list),
      activities: list.length,
    };
  }, [entries]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="font-medium mb-2">Overview</h2>

      {entries === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <>
          <ul className="space-y-1 text-sm text-gray-700">
            <li><span className="font-semibold">Points:</span> {points}</li>
            <li><span className="font-semibold">Streak:</span> {streak} {streak === 1 ? 'day' : 'days'}</li>
            <li><span className="font-semibold">Activities:</span> {activities}</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Live from this browser’s history. (Clears if storage is reset.)
          </p>
        </>
      )}
    </div>
  );
}
