'use client';

import {useEffect, useState} from 'react';
import { loadProgress, progressEvents, type ProgressData } from '@/lib/progress';

export default function ParentStats() {
  const [p, setP] = useState<ProgressData>(() => loadProgress());

  useEffect(() => {
    const onUpdate = () => setP(loadProgress());
    progressEvents.addEventListener('update', onUpdate);
    // also load once on mount
    onUpdate();
    return () => progressEvents.removeEventListener('update', onUpdate);
  }, []);

  const accuracy =
    p.quizzesTaken > 0 ? Math.round((p.correctAnswers / (p.quizzesTaken * 1 /* per-question unknown */)) * 100) : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="Points" value={p.points} />
      <Stat label="Streak" value={`${p.streakDays} days`} />
      <Stat label="Activities" value={p.activities} />
      <Stat label="Quizzes" value={p.quizzesTaken} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number|string }) {
  return (
    <div className="rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
