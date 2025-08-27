// src/components/ParentEmailForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { getEmail, setEmail } from '@/lib/progress';

type ApiResponse = { ok: boolean; error?: string };

export default function ParentEmailForm() {
  const [email, setEmailState] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>(
    'idle'
  );
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const existing = getEmail();
    if (existing) setEmailState(existing);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setMsg(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as ApiResponse;

      if (res.ok && data.ok) {
        setEmail(email);
        setStatus('ok');
        setMsg('Thanks! Check your inbox for a confirmation.');
      } else {
        setStatus('error');
        setMsg(
          data.error === 'invalid_email'
            ? 'Please enter a valid email.'
            : 'Could not subscribe. Try again.'
        );
      }
    } catch {
      setStatus('error');
      setMsg('Could not subscribe. Try again.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-neutral-700">
        Get weekly parent tips
      </label>
      <div className="flex items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmailState(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none ring-0 focus:border-neutral-400"
        />
        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Subscribe'}
        </button>
      </div>
      {msg && (
        <p
          className={`text-sm ${
            status === 'error' ? 'text-red-600' : 'text-green-700'
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
