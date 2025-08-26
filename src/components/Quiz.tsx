// src/components/Quiz.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
};

type QuizProps = {
  questions?: QuizQuestion[];
};

// Fallback questions (used if no props are passed)
const defaultQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What is 1/2 + 1/4?',
    choices: ['1/4', '3/4', '1/2', '2/4'],
    answerIndex: 1,
  },
  {
    id: 'q2',
    prompt: 'Simplify 2/8',
    choices: ['1/4', '2/4', '1/2', '3/4'],
    answerIndex: 0,
  },
];

function bumpProgress(correctNow: boolean) {
  if (typeof window === 'undefined') return;
  const key = 'sunny.progress.v1';
  try {
    const prev = JSON.parse(localStorage.getItem(key) || '{}') as {
      total?: number;
      correct?: number;
      updatedAt?: string;
    };
    const total = (prev.total ?? 0) + 1;
    const correct = (prev.correct ?? 0) + (correctNow ? 1 : 0);
    localStorage.setItem(
      key,
      JSON.stringify({ total, correct, updatedAt: new Date().toISOString() })
    );
  } catch {
    localStorage.setItem(
      key,
      JSON.stringify({
        total: 1,
        correct: correctNow ? 1 : 0,
        updatedAt: new Date().toISOString(),
      })
    );
  }
}

export default function Quiz({ questions: incoming }: QuizProps) {
  const questions = useMemo(() => incoming ?? defaultQuestions, [incoming]);

  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [results, setResults] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  useEffect(() => {
    const next: Record<string, null> = {};
    for (const q of questions) next[q.id] = null;
    setResults(next);
  }, [questions]);

  const onSelect = (qid: string, idx: number) => {
    setAnswers((s) => ({ ...s, [qid]: idx }));
  };

  const onCheck = (q: QuizQuestion) => {
    const chosen = answers[q.id];
    if (chosen == null) return;
    const ok = chosen === q.answerIndex;
    setResults((s) => ({ ...s, [q.id]: ok ? 'correct' : 'incorrect' }));
    bumpProgress(ok);
  };

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const selected = answers[q.id] ?? null;
        const state = results[q.id] ?? null;

        return (
          <div key={q.id} className="rounded-xl border border-neutral-200/70 p-4">
            <p className="font-medium">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.choices.map((choice, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="h-4 w-4"
                    checked={selected === i}
                    onChange={() => onSelect(q.id, i)}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 active:bg-neutral-100"
                onClick={() => onCheck(q)}
              >
                Check
              </button>
              {state === 'correct' && (
                <span className="text-green-600 text-sm">Nice! That’s correct.</span>
              )}
              {state === 'incorrect' && (
                <span className="text-red-600 text-sm">Not quite—try another choice.</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
