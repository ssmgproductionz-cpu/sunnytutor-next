'use client';

import { useState } from 'react';

type Level = 'k2' | 'g3_5' | 'g6_8';

export default function ChatCoach() {
  const [level, setLevel] = useState<Level>('k2');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function ask() {
    setLoading(true);
    setError('');
    setReply('');
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), level }),
      });
      const data = await res.json();
      const text =
        typeof data.reply === 'string' ? data.reply : 'Sorry, I had trouble thinking.';
      setReply(text);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4 space-y-3">
      <div className="flex gap-3 items-center">
        <label className="text-sm text-gray-600">Reading level:</label>
        <select
          className="rounded-xl border px-3 py-1.5 text-sm bg-white"
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
        >
          <option value="k2">K–2</option>
          <option value="g3_5">3–5</option>
          <option value="g6_8">6–8</option>
        </select>
      </div>

      <textarea
        className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
        rows={3}
        placeholder='Ask for a gentle hint (e.g., "How do I simplify 2/8?")'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
          onClick={ask}
          disabled={!input.trim() || loading}
        >
          {loading ? 'Thinking…' : 'Get hint'}
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {reply && (
        <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
          {reply}
        </div>
      )}
    </div>
  );
}