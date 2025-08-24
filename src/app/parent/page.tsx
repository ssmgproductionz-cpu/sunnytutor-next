'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Trophy, Clock, Flame, BookOpen } from 'lucide-react';
import TTSButton from '@/components/TTSButton';
import DragFractions from '@/components/DragFractions';
import Quiz, { QuizQuestion } from '@/components/Quiz';
import ChatCoach from '@/components/ChatCoach';

/* ================= Progress (localStorage) ================= */

type ProgressEntry = {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  date: string;        // ISO
  score?: number;      // expected 0..1 (normalized defensively)
  minutes?: number;
};

const STORAGE_KEY = 'sunnyTutor.progress.v1';

function loadProgress(): ProgressEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveProgress(entry: ProgressEntry) {
  if (typeof window === 'undefined') return;
  const all = loadProgress();
  all.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// Normalize any stored score to 0..1
function normalizeScore(s: unknown): number | null {
  if (typeof s !== 'number' || !isFinite(s)) return null;
  if (s < 0) return 0;
  if (s <= 1) return s;         // already a fraction
  if (s <= 100) return s / 100; // looks like a percent
  return 1;                     // clamp absurd values
}

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(entries: ProgressEntry[]) {
  if (!entries.length) return 0;
  const days = new Set(entries.map(e => ymd(new Date(e.date))));
  let streak = 0;
  const base = new Date();
  for (let i = 0; ; i++) {
    const t = new Date(base);
    t.setDate(base.getDate() - i);
    if (days.has(ymd(t))) streak++;
    else break;
  }
  return streak;
}

/* ================= Page ================= */

export default function HomePage() {
  const [items, setItems] = useState<ProgressEntry[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState(0); // live timer

  // load existing progress on mount
  useEffect(() => {
    setItems(loadProgress());
  }, []);

  // live minutes on page (updates ~every 10s)
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const mins = Math.floor((Date.now() - start) / 60000);
      setSessionMinutes(mins);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const totalMinutes = items.reduce((a, b) => a + (b.minutes ?? 0), 0);
    const quizzes = items.filter(i => i.type === 'quiz');
    const lessons = items.filter(i => i.type === 'lesson');

    const normScores = quizzes
      .map(q => normalizeScore(q.score))
      .filter((x): x is number => x !== null);

    const avgQuizPct = normScores.length
      ? Math.round(
          (normScores.reduce((a, b) => a + b, 0) / normScores.length) * 100
        )
      : 0;

    // Simple points: lesson=50, quiz = normalized score * 100
    const points =
      lessons.length * 50 +
      normScores.reduce((a, b) => a + Math.round(b * 100), 0);

    const activities = items.length;

    return {
      points,
      streak: computeStreak(items),
      totalMinutes,
      activities,
      avgQuizPct,
    };
  }, [items]);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      prompt:
        'If a pizza is cut into 4 pieces and you eat 1, what fraction did you eat?',
      options: ['1/2', '1/4', '3/4', '4/4'],
      answer: '1/4',
      hint: 'You ate one out of four total pieces.',
    },
    {
      id: 'q2',
      prompt: 'Which is larger: 1/4 or 1/3?',
      options: ['1/4', '1/3'],
      answer: '1/3',
      hint: 'Thirds are bigger than fourths.',
    },
    {
      id: 'q3',
      prompt: 'If you eat 3 out of 4 pieces, what fraction did you eat?',
      options: ['4/3', '1/4', '3/4', '1/3'],
      answer: '3/4',
      hint: 'Three out of four is 3/4.',
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header row with Parent Dashboard link */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Sunny Tutor ☀️ — Fractions
        </h1>
        <Link
          href="/parent"
          className="inline-flex items-center rounded-2xl border px-3 py-2 text-sm bg-white hover:bg-gray-50 shadow-sm"
        >
          Parent dashboard
        </Link>
      </div>

      <div className="mb-4">
        <TTSButton
          text="Welcome to Sunny Tutor fractions! Let’s learn and have fun."
          className=""
        />
      </div>

      {/* Drag & Drop – with completion hook */}
      <section className="rounded-2xl border bg-white shadow-sm p-4 mb-6">
        <DragFractions
          onComplete={() => {
            saveProgress({
              id: `lesson-${Date.now()}`,
              type: 'lesson',
              title: 'Fractions — Build 3/4',
              date: new Date().toISOString(),
              minutes: sessionMinutes,
            });
            setItems(loadProgress()); // refresh stats
          }}
        />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border bg-white shadow-sm p-4 flex items-center gap-3">
          <Trophy className="w-5 h-5" />
          <div>
            <div className="text-xs text-gray-500">Points</div>
            <div className="text-lg font-semibold">{stats.points}</div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-4 flex items-center gap-3">
          <Flame className="w-5 h-5" />
          <div>
            <div className="text-xs text-gray-500">Streak</div>
            <div className="text-lg font-semibold">
              {stats.streak} day{stats.streak === 1 ? '' : 's'}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-4 flex items-center gap-3">
          <Clock className="w-5 h-5" />
          <div>
            <div className="text-xs text-gray-500">Time</div>
            <div className="text-lg font-semibold">
              {stats.totalMinutes + sessionMinutes} min
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-4 flex items-center gap-3">
          <BookOpen className="w-5 h-5" />
          <div>
            <div className="text-xs text-gray-500">Activities</div>
            <div className="text-lg font-semibold">{stats.activities}</div>
          </div>
        </div>
      </section>

      {/* Quick Quiz */}
      <section className="rounded-2xl border bg-white shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold">📝 Quick Quiz</h2>
        <p className="text-sm text-gray-600">Answer a few fraction questions.</p>
        <div className="mt-3">
          <Quiz
            questions={quizQuestions}
            onFinish={(scorePct) => {
              saveProgress({
                id: `quiz-${Date.now()}`,
                type: 'quiz',
                title: 'Fractions — Quick Quiz',
                date: new Date().toISOString(),
                score: scorePct,          // 0..1 or 0..100; normalized in stats
                minutes: sessionMinutes,  // real time spent this session
              });
              setItems(loadProgress());
            }}
          />
          <p className="mt-2 text-sm text-gray-600">
            Avg quiz score so far:{' '}
            <span className="font-medium">{stats.avgQuizPct}%</span>
          </p>
        </div>
      </section>

      {/* AI Coach */}
      <section className="rounded-2xl border bg-white shadow-sm p-4">
        <h2 className="text-lg font-semibold">🤖 AI Chat Coach</h2>
        <p className="text-sm text-gray-600">
          Ask for a gentle hint. The coach keeps things kid-safe and brief.
        </p>
        <div className="mt-3">
          <ChatCoach />
        </div>
      </section>
    </main>
  );
}
