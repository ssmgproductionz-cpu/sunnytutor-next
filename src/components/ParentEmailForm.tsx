'use client';

import { useState } from 'react';
import { setEmail, loadProgress } from '@/lib/progress';

export default function ParentEmailForm() {
  const [email, setEmailInput] = useState(loadProgress().email ?? '');
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }
    setStatus('saving');
    try {
      setEmail(trimmed); // persist locally too
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: trimmed }),
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold">Parent email (optional)</div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={status==='saving'}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status==='saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
      {status==='saved' && <div className="mt-2 text-sm text-green-700">Saved!</div>}
      {status==='error' && <div className="mt-2 text-sm text-red-700">Please enter a valid email.</div>}
    </form>
  );
}
