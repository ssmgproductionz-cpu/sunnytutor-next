// src/app/parent/page.tsx
import Link from 'next/link';
import StatusPill from '@/components/StatusPill';
import ParentStats from '@/components/ParentStats';
import ParentEmailForm from '@/components/ParentEmailForm';
// If you haven’t wired this yet, you can remove the import & component safely.
// import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'Parent dashboard — Sunny Tutor',
  description: 'Overview and controls for parents',
};

export default function ParentDashboard() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Parent dashboard</h1>
          <p className="text-sm text-neutral-500">
            Overview &amp; controls for your student
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Uncomment if you’ve added a theme switcher */}
          {/* <ThemeToggle /> */}
          <StatusPill />
        </div>
      </div>

      <div className="grid gap-6">
        {/* Overview / Stats */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <ParentStats />
          <p className="text-xs text-neutral-500 mt-3">
            Live from this browser’s history. (Clears if storage is reset.)
          </p>
        </section>

        {/* Quick actions */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Student home
            </Link>
            <Link
              href="/parent/login?next=/parent"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Re-login
            </Link>
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Use “Re-login” if the parent PIN expires.
          </p>
        </section>

        {/* AI Coach info */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">AI Coach</h2>
          <p className="text-sm text-neutral-700">
            The coach uses your server key. If the status pill shows{' '}
            <span className="font-medium">Live</span>, you’re good. If it shows{' '}
            <span className="font-medium">Dev</span> or{' '}
            <span className="font-medium">Error</span>, check{' '}
            <Link href="/api/status" className="underline">
              /api/status
            </Link>{' '}
            and your <code>OPENAI_API_KEY</code> on Vercel.
          </p>
          <p className="text-xs text-neutral-500 mt-3">
            Tech helpers:{' '}
            <Link href="/api/healthz" className="underline">
              health
            </Link>{' '}
            ·{' '}
            <Link href="/api/status" className="underline">
              status
            </Link>
          </p>
        </section>

        {/* Parent email capture */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">Stay in the loop</h2>
          <p className="text-sm text-neutral-700 mb-4">
            Get updates about new practice sets and parent tools.
          </p>
          <ParentEmailForm />
        </section>
      </div>
    </main>
  );
}
