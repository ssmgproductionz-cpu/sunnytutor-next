// src/components/ParentStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/progress';

type Props = {
  points: number;
  streakDays: number;
  activities: number;
  accuracy?: number; // optional to display if provided/known
};

/**
 * Accepts props if parent wants to pass them.
 * If not provided, it will read from local progress on mount.
 */
export default function ParentStats(partialProps: Partial<Props> = {}) {
  const [stats, setStats] = useState<Required<Props>>({
    points: partialProps.points ?? 0,
    streakDays: partialProps.streakDays ?? 0,
    activities: partialProps.activities ?? 0,
    accuracy: partialProps.accuracy ?? 0,
  });

  useEffect(() => {
    // Fill any missing values from local progress
    if (
      partialProps.points == null ||
      partialProps.streakDays == null ||
      partialProps.activities == null ||
      partialProps.accuracy == null
    ) {
      const s = getStats();
      setStats({
        points: partialProps.points ?? s.points,
        streakDays: partialProps.streakDays ?? s.streakDays,
        activities: partialProps.activities ?? s.activities,
        accuracy: partialProps.accuracy ?? s.accuracy,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    partialProps.points,
    partialProps.streakDays,
    partialProps.activities,
    partialProps.accuracy,
  ]);

  const Card = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-neutral-900">
        {value}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card label="Points" value={stats.points} />
      <Card label="Streak (days)" value={stats.streakDays} />
      <Card label="Activities" value={stats.activities} />
      <Card label="Accuracy" value={`${stats.accuracy}%`} />
    </div>
  );
}
