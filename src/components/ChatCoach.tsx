// src/components/ChatCoach.tsx
'use client';

import React, { useState } from 'react';
import TTSButton from '@/components/TTSButton';

type Level = 'k2' | '3-5' | '6-8';
type CoachResponse = { reply: string; _model?: string; _status?: number; _code?: string };

const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: 'k2', label: 'K–2' },
  { value: '3-5', label: '3–5' },
  { value: '6-8', label: '6–8' },
];

export default function ChatCoach() {
  const [level, setLevel] = useState<Level>('k2');
  const [text, setText] = useState('');
  const [reply, setReply] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  async function ask() {
    setErr('');
    setReply('');
    const msg = text.trim();
    if (!msg) {
      setErr('Type a question first.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, level }),
      });
      const data = (await r.json()) as CoachResponse;
      setReply(data.reply || 'The coach had trouble thinking. Try again.');
    } catch {
      setReply('Network hiccup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Chat Coach</h3>
        <label className="text-sm text-gray-600">
          Reading level:{' '}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            className="rounded-xl border px-2 py-1 text-sm"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Ask for a gentle hint. Try: “I’m stuck on 1/2 + 1/4.”"
        className="w-full rounded-xl border p-3 text-sm outline-none focus:ring"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={ask}
          disabled={loading}
          className="rounded-2xl border bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Thinking…' : 'Get hint'}
        </button>
        {reply && (
          <TTSButton text={reply} className="border px-3 py-2 rounded-2xl text-sm" />
        )}
      </div>

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

      <div className="mt-3 min-h-[2.5rem] rounded-xl border bg-gray-50 p-3 text-sm">
        {loading ? (
          <span className="animate-pulse">…typing</span>
        ) : reply ? (
          <span>{reply}</span>
        ) : (
          <span className="text-gray-500">Your coach’s answer will appear here.</span>
        )}
      </div>
    </div>
  );
}