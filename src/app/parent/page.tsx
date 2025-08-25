// src/app/parent/page.tsx

import Link from 'next/link';
import StatusPill from '@/components/StatusPill';
import ParentStats from '@/components/ParentStats';

export default function ParentDashboard() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Parent dashboard</h1>
        <StatusPill />
      </div>

      {/* 3-up grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* LIVE Overview from localStorage */}
        <ParentStats />

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-medium mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Student home
            </Link>
            <Link
              href="/parent/login?next=/parent"
              className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-900"
            >
              Re-login
            </Link>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Use “Re-login” if the parent PIN expires.
          </p>
        </div>

        {/* AI Coach info */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-medium mb-2">AI Coach</h2>
          <p className="text-sm text-gray-700">
            The coach uses your server key. If the status pill shows <b>Live</b>, you’re good.
            If it shows <b>Dev</b> or <b>Error</b>, check{' '}
            <code className="px-1 py-0.5 rounded bg-gray-100">/api/status</code>
            {' '}and your{' '}
            <code className="px-1 py-0.5 rounded bg-gray-100">OPENAI_API_KEY</code> on Vercel.
          </p>
          <div className="mt-3 text-xs">
            <Link href="/api/status" target="_blank" className="underline text-blue-600">
              Open /api/status
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
