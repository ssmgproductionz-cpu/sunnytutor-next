'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginFormClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get('next') || '/parent';

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/parent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Login failed (${res.status})`);
      }
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium">Enter PIN</label>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        className="w-full rounded-xl border px-3 py-2"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="••••"
        required
        minLength={4}
        maxLength={8}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
      >
        {submitting ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}
