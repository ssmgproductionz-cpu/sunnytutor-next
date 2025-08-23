'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ProgressEntry = {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  date: string;      // ISO
  score?: number;    // 0..1 preferred
  minutes?: number;
};

const STORAGE_KEY = 'sunnyTutor.progress.v1';

export default function ParentPage() {
  const [items, setItems] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(arr) ? arr : []);
    } catch {
      setItems([]);
    }
  }, []);

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Parent Dashboard</h1>
        <Link
          href="/"
          className="inline-flex items-center rounded-2xl border px-3 py-2 text-sm bg-white hover:bg-gray-50 shadow-sm"
        >
          Back to learning
        </Link>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            Total entries: <span className="font-medium">{items.length}</span>
          </div>
          <button
            className="rounded-2xl px-3 py-1.5 border shadow-sm bg-white hover:bg-gray-50 text-sm"
            onClick={clear}
          >
            Clear demo data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No progress yet. Try a lesson or quiz on the home page.
                  </td>
                </tr>
              ) : (
                items
                  .slice()
                  .reverse()
                  .map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2 pr-3">
                        {new Date(e.date).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">{e.type}</td>
                      <td className="py-2 pr-3">{e.title}</td>
                      <td className="py-2 pr-3">
                        {typeof e.score === 'number'
                          ? `${Math.round(
                              (e.score <= 1 ? e.score * 100 : e.score) as number
                            )}%`
                          : '—'}
                      </td>
                      <td className="py-2 pr-3">{e.minutes ?? 0}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}