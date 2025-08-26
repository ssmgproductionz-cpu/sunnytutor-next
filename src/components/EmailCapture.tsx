'use client';

import { useState } from 'react';

type Props = {
  className?: string;
};

export default function EmailCapture({ className = '' }: Props) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const trimmed = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      setErr('Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setMsg('Thanks! You’re on the list.');
        setEmail('');
      } else if (data?.error === 'invalid_email') {
        setErr('That email doesn’t look right.');
      } else {
        setErr('Whoops—please try again.');
      }
    } catch {
      setErr('Network error—try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-neutral-700">
        Get parent updates by email
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="whitespace-nowrap rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Notify me'}
        </button>
      </div>

      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      <p className="text-xs text-neutral-500">
        We’ll only send Sunny Tutor updates. You can unsubscribe anytime.
      </p>
    </form>
  );
}
