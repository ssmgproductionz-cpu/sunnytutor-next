// src/app/parent/page.tsx
import Link from 'next/link';
import StatusPill from '@/components/StatusPill';

export const metadata = {
  title: 'Parent dashboard — Sunny Tutor',
  description: 'Overview and controls for parents',
};

export default function ParentPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Parent dashboard</h1>
        <StatusPill />
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Overview card */}
        <section className="rounded-2xl border p-4 bg-white">
          <h2 className="font-medium mb-2">Overview</h2>
          <ul className="text-sm space-y-1">
            <li>
              <span className="text-gray-500">Points:</span> 0
            </li>
            <li>
              <span className="text-gray-500">Streak:</span> 0 days
            </li>
            <li>
              <span className="text-gray-500">Activities:</span> 0
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            (Hook this up to your real progress later.)
          </p>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border p-4 bg-white">
          <h2 className="font-medium mb-2">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
            >
              Student home
            </Link>
            <Link
              href="/parent/login?next=/parent"
              className="rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
            >
              Re-login
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Use “Re-login” if the parent PIN expires.
          </p>
        </section>

        {/* AI Coach note */}
        <section className="rounded-2xl border p-4 bg-white">
          <h2 className="font-medium mb-2">AI Coach</h2>
          <p className="text-sm text-gray-700">
            The coach uses your server key. If the status pill shows <b>Live</b>,
            you’re good. If it shows <b>Dev</b> or <b>Error</b>, check{' '}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/api/status</code>{' '}
            and your <b>OPENAI_API_KEY</b> on Vercel.
          </p>
        </section>
      </div>
    </main>
  );
}
