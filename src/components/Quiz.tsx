'use client';

import { useEffect, useMemo, useState } from 'react';

/* ----------------------------- Types & Data ----------------------------- */

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  hint?: string;
};

type Props = {
  /** Optional custom question set; falls back to built-ins below. */
  questions?: QuizQuestion[];
  /** Called after the last question. */
  onComplete?: (summary: { total: number; correct: number }) => void;
};

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What is 1/2 + 1/4?',
    choices: ['1/4', '3/4', '1/2', '2/4'],
    answerIndex: 1,
    hint: 'Make the bottoms the same first.',
  },
  {
    id: 'q2',
    prompt: 'Simplify 2/8',
    choices: ['1/2', '1/4', '2/4', '3/4'],
    answerIndex: 1,
    hint: 'Divide top and bottom by 2.',
  },
  {
    id: 'q3',
    prompt: 'Which is larger?',
    choices: ['1/3', '1/4'],
    answerIndex: 0,
    hint: 'Pieces: thirds are bigger than quarters.',
  },
];

/* ------------------------------ Component ------------------------------ */

export default function Quiz({ questions, onComplete }: Props) {
  const qs = useMemo(() => questions ?? DEFAULT_QUESTIONS, [questions]);

  // Persist very light progress locally — no external deps.
  const STORAGE_KEY = 'quiz:v1';

  const [index, setIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Number.isInteger(saved.index) ? Math.min(saved.index, qs.length - 1) : 0;
    } catch {
      return 0;
    }
  });

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Number.isInteger(saved.correctCount) ? saved.correctCount : 0;
    } catch {
      return 0;
    }
  });

  const q = qs[index];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ index, correctCount })
    );
  }, [index, correctCount]);

  // Auto-advance after a correct check.
  useEffect(() => {
    if (!checked || !isCorrect) return;
    const t = setTimeout(() => next(), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, isCorrect]);

  function resetForNext() {
    setSelected(null);
    setChecked(false);
    setIsCorrect(null);
  }

  function check() {
    if (selected == null) return;
    const ok = selected === q.answerIndex;
    setChecked(true);
    setIsCorrect(ok);
    if (ok) setCorrectCount((c) => c + 1);
  }

  function next() {
    const last = index >= qs.length - 1;
    if (last) {
      onComplete?.({ total: qs.length, correct: correctCount + (isCorrect ? 1 : 0) });
      // Reset to replay
      setIndex(0);
      setCorrectCount(0);
      resetForNext();
      return;
    }
    setIndex((i) => i + 1);
    resetForNext();
  }

  const canCheck = selected !== null && !checked;

  return (
    <div className="space-y-4 border border-neutral-800 rounded-xl p-4 bg-neutral-950/40">
      <h3 className="text-lg font-semibold">Quick quiz</h3>

      {/* Question */}
      <div className="space-y-3">
        <p className="text-neutral-200">{q.prompt}</p>

        {/* Choices */}
        <ul className="grid gap-2">
          {q.choices.map((choice, i) => {
            const selectedState = selected === i;
            const correctState = checked && i === q.answerIndex;
            const wrongPicked = checked && selectedState && i !== q.answerIndex;

            return (
              <li key={i}>
                <label
                  className={[
                    'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
                    'border-neutral-700 bg-neutral-900 text-neutral-200',
                    'hover:border-neutral-500',
                    'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500',
                    selectedState ? 'border-indigo-400 bg-neutral-800' : '',
                    correctState ? 'border-emerald-500' : '',
                    wrongPicked ? 'border-rose-500' : '',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="accent-indigo-500"
                    checked={selectedState}
                    onChange={() => setSelected(i)}
                    disabled={checked}
                  />
                  <span>{choice}</span>
                </label>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={check}
            disabled={!canCheck}
            className="rounded-md px-4 py-2 text-sm font-medium bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check
          </button>

          {checked && (
            <button
              onClick={next}
              className="rounded-md px-4 py-2 text-sm font-medium border border-neutral-700 bg-neutral-900 text-neutral-100 hover:border-neutral-500"
            >
              {index >= qs.length - 1 ? 'Finish' : 'Next'}
            </button>
          )}
        </div>

        {/* Feedback */}
        <p
          className={checked ? (isCorrect ? 'text-emerald-400' : 'text-rose-400') : 'sr-only'}
          aria-live="polite"
        >
          {checked
            ? isCorrect
              ? 'Nice! That is correct.'
              : q.hint
              ? `Not quite — hint: ${q.hint}`
              : 'Not quite — try again.' // (button still shows Next so they can move on)
            : ' '}
        </p>

        {/* Progress footer */}
        <div className="text-xs text-neutral-400">
          Question {index + 1} / {qs.length} • Correct so far: {correctCount}
        </div>
      </div>
    </div>
  );
}
