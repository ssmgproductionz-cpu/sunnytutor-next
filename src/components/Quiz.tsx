'use client';

import { useMemo, useState } from 'react';

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  hint?: string;
};

export default function Quiz({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish?: (scoreFraction: number) => void; // 0..1
}) {
  // Shuffle options once
  const shuffled = useMemo(() => {
    const arr = questions.map(q => ({ ...q, options: [...q.options] }));
    arr.forEach(q => {
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    });
    return arr;
  }, [questions]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = shuffled[idx];

  // Styles — force visible text
  const baseBtn =
    'w-full text-left rounded-2xl border bg-white shadow-sm px-4 py-3 text-sm ' +
    'hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-300 text-black';
  const selectedBtn = 'border-blue-600 ring-1 ring-blue-300 bg-blue-50';
  const correctBtn = 'border-green-600 bg-green-50';
  const wrongBtn = 'border-red-600 bg-red-50';

  function choose(opt: string) {
    if (checked) return;
    setSelected(opt);
  }

  function check() {
    if (checked || !selected) return;
    const isCorrect = selected === q.answer;
    if (isCorrect) setCorrectCount(c => c + 1);
    setChecked(true);
  }

  function next() {
    if (idx + 1 < shuffled.length) {
      setIdx(idx + 1);
      setSelected(null);
      setChecked(false);
    } else {
      const scoreFraction = correctCount / shuffled.length;
      onFinish?.(scoreFraction);
      // reset for a new round
      setIdx(0);
      setSelected(null);
      setChecked(false);
      setCorrectCount(0);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-sm text-gray-600">
          Question {idx + 1} / {shuffled.length}
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <div className="text-base font-medium mb-3">{q.prompt}</div>

        <div className="space-y-3">
          {q.options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrectAnswer = opt === q.answer;

            let cls = baseBtn; // text forced to black
            if (checked) {
              if (isCorrectAnswer) cls += ' ' + correctBtn;
              else if (isSelected) cls += ' ' + wrongBtn;
            } else if (isSelected) {
              cls += ' ' + selectedBtn;
            }

            return (
              <button
                key={opt}
                type="button"
                className={cls}
                onClick={() => choose(opt)}
                aria-pressed={isSelected}
                style={{ color: '#111' }}   // extra insurance
                data-option={opt}
              >
                <span style={{ color: '#111', fontWeight: 500 }}>
                  {opt || '(missing option)'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {!checked ? (
            <button
              type="button"
              className="rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
              onClick={check}
              disabled={!selected}
            >
              Check answer
            </button>
          ) : (
            <>
              <span
                className={`text-sm font-medium ${
                  selected === q.answer ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {selected === q.answer ? 'Correct!' : 'Not quite.'}
              </span>
              {q.hint && selected !== q.answer && (
                <span className="text-sm text-gray-600">Hint: {q.hint}</span>
              )}
              <button
                type="button"
                className="ml-auto rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
                onClick={next}
              >
                {idx + 1 < shuffled.length ? 'Next' : 'Finish'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}