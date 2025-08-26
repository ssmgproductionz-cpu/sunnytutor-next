// src/app/parent/page.tsx
import Link from 'next/link';
import StatusPill from '@/components/StatusPill';
import ParentStats from '@/components/ParentStats';
import EmailCapture from '@/components/EmailCapture';

export const metadata = {
  title: 'Parent dashboard — Sunny Tutor',
  description: 'Overview and controls for parents',
};

export default function ParentDashboard() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Parent dashboard</h1>
        <StatusPill />
      </div>

      {/* Grid sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overview */}
        <section className="rounded-lg border border-neutral-200/60 bg-white shadow-sm p-4">
          <h2 className="text-lg font-medium mb-3">Overview</h2>
          <ParentStats />
          <p className="mt-2 text-xs text-neutral-500">
            Live from this browser’s history. (Clears if storage is reset.)
          </p>
        </section>

        {/* Quick actions */}
        <section className="rounded-lg border border-neutral-200/60 bg-white shadow-sm p-4">
          <h2 className="text-lg font-medium mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Student home
            </Link>
            <Link
              href="/parent/login?next=/parent"
              className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Re-login
            </Link>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Use “Re-login” if the parent PIN expires.
          </p>
        </section>

        {/* AI Coach info */}
        <section className="rounded-lg border border-neutral-200/60 bg-white shadow-sm p-4">
          <h2 className="text-lg font-medium mb-3">AI Coach</h2>
          <p className="text-sm text-neutral-700">
            The coach uses your server key. If the status pill shows{' '}
            <span className="font-medium">Live</span>, you’re good. If it shows{' '}
            <span className="font-medium">Dev</span> or{' '}
            <span className="font-medium">Error</span>, check{' '}
            <a
              href="/api/status"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              /api/status
            </a>{' '}
            and your <code>OPENAI_API_KEY</code> on Vercel.
          </p>
        </section>

        {/* Email capture */}
        <section className="rounded-lg border border-neutral-200/60 bg-white shadow-sm p-4">
          <h2 className="text-lg font-medium mb-3">Parent updates</h2>
          <EmailCapture />
        </section>
      </div>
    </main>
  );
}
