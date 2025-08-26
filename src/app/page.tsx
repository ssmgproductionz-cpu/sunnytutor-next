// src/app/page.tsx
import Link from 'next/link';
import ChatCoach from '@/components/ChatCoach';
import DragFractions from '@/components/DragFractions';
import Quiz from '@/components/Quiz';

export const metadata = {
  title: 'Sunny Tutor — Student Home',
  description: 'Practice fractions and get help from the AI Coach.',
};

// Keep this local so we don’t depend on a named export from Quiz.tsx
const questions = [
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

export default function HomePage() {
  return (
    <main className="container-pg section-gap">
      {/* Hero */}
      <header className="py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Sunny Tutor</h1>
        <p className="mt-2 text-neutral-600">
          Practice fractions and get help from the AI Coach.
        </p>
      </header>

      {/* Warm-up */}
      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Warm-up: Drag the fractions</h2>
        <DragFractions />
      </section>

      {/* Quiz */}
      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Quick quiz</h2>
        <Quiz questions={questions} />
      </section>

      {/* AI Coach */}
      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-3">AI Coach</h2>
        <ChatCoach />
      </section>

      {/* Footer links */}
      <footer className="py-10 text-center text-sm text-neutral-500">
        <div className="space-x-3">
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link href="/parent" className="hover:underline">Parent</Link>
        </div>
      </footer>
    </main>
  );
}
