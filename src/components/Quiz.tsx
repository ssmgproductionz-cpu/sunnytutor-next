'use client';

import { useState } from 'react';
import { recordQuiz } from '@/lib/progress';

type Q = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

const QUESTIONS: Q[] = [
  {
    id: 'q1',
    prompt: 'If a pizza is cut into 4 pieces and you eat 1, what fraction did you eat?',
    choices: ['4/3', '1/4', '3/4', '1/3'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    prompt: 'Which is the same as 2/8?',
    choices: ['1/4', '1/8', '2/4', '4/8'],
    correctIndex: 0,
  },
  {
    id: 'q3',
    prompt: 'What is 1/2 + 1/4?',
    choices: ['1/4', '2/4', '3/4', '4/4'],
    correctIndex: 2,
  },
];

export default function Quiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState<{correct: number; total: number} | null>(null);

  const onChoose = (qid: string, idx: number) => {
    setAnswers(a => ({ ...a, [qid]: idx }));
  };

  const onSubmit = () => {
    let correct = 0;
    for (const q of QUESTIONS) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    setGraded({ correct, total: QUESTIONS.length });
    recordQuiz(correct, QUESTIONS.length);
  };

  const reset = () => {
    setAnswers({});
    setGraded(null);
  };

  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">📝 Quick Quiz</h2>
        {graded ? (
          <span className="text-sm text-neutral-600">
            Score: <strong>{graded.correct}/{graded.total}</strong>
          </span>
        ) : (
          <span className="text-sm text-neutral-600">Question 1 / {QUESTIONS.length}</span>
        )}
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q, i) => (
          <div key={q.id} className="p-3 rounded-xl border border-neutral-200/60">
            <div className="mb-2 font-medium">{q.prompt}</div>
            <div className="grid grid-cols-2 gap-2">
              {q.choices.map((c, idx) => {
                const chosen = answers[q.id] === idx;
                const isCorrect = graded && idx === q.correctIndex;
                const isWrongChosen = graded && chosen && !isCorrect;
                return (
                  <button
                    key={idx}
                    onClick={() => onChoose(q.id, idx)}
                    disabled={!!graded}
                    className={[
                      'rounded-lg border px-3 py-2 text-left text-sm',
                      chosen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-neutral-200',
                      graded && isCorrect ? 'bg-green-50 border-green-400' : '',
                      graded && isWrongChosen ? 'bg-red-50 border-red-400' : '',
                    ].join(' ')}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {!graded ? (
          <button
            onClick={onSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Check
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-green-700">
              ✅ Saved to progress
            </div>
            <button
              onClick={reset}
              className="rounded-lg border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
