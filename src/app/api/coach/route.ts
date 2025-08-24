// src/app/api/coach/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // ensure Node runtime so env vars are available

// ---- Types ----
type Level = 'k2' | '3-5' | '6-8';
type CoachRequest = { message: string; level?: Level };
type CoachOk = { reply: string; _model?: 'offline' | 'gpt-4o-mini' };
type CoachErr = { reply: string; _status?: number; _code?: string; _body?: string };

// ---- Helpers ----
function parseFraction(msg: string): { n: number; d: number } | null {
  const m = msg.trim().match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  const d = Number(m[2]);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  return { n, d };
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

function systemPrompt(level: Level): string {
  const common =
    "You are a gentle math coach for young learners. Keep answers short, step-by-step, kid-safe, and encouraging. Prefer concrete examples (pizza slices).";
  switch (level) {
    case 'k2':
      return `${common} Use very simple words (K–2).`;
    case '3-5':
      return `${common} Use simple words (grades 3–5).`;
    case '6-8':
      return `${common} Use concise middle-school language.`;
    default:
      return common;
  }
}

// ---- Route ----
export async function POST(req: Request) {
  let body: CoachRequest | null = null;

  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return NextResponse.json<CoachErr>(
      { reply: 'Invalid JSON.', _status: 400, _code: 'bad_json' },
      { status: 400 },
    );
  }

  const message = (body?.message ?? '').toString().slice(0, 500);
  const level: Level = (body?.level as Level) || 'k2';

  // Log request (shows up in Vercel runtime logs)
  console.log('[coach] request', { level, msg: message.slice(0, 80) });

  // 1) OFFLINE: simple fraction simplifier if the message is just "a/b"
  const frac = parseFraction(message);
  if (frac) {
    const g = gcd(frac.n, frac.d);
    if (g > 1) {
      const reply = `Divide top and bottom by ${g}: ${frac.n}/${frac.d} → ${frac.n / g}/${frac.d / g}.`;
      console.log('[coach] reply', { model: 'offline', n: frac.n, d: frac.d, gcd: g });
      return NextResponse.json<CoachOk>({ reply, _model: 'offline' });
    }
    // Already simplest form
    const reply = `${frac.n}/${frac.d} is already in simplest form.`;
    console.log('[coach] reply', { model: 'offline', n: frac.n, d: frac.d, gcd: 1 });
    return NextResponse.json<CoachOk>({ reply, _model: 'offline' });
  }

  // 2) ONLINE: call OpenAI for general coaching
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('[coach] error', { message: 'Missing or invalid OPENAI_API_KEY' });
    return NextResponse.json<CoachErr>(
      {
        reply: 'The coach is not configured yet. Add OPENAI_API_KEY in Vercel env and redeploy.',
        _status: 500,
        _code: 'missing_api_key',
      },
      { status: 500 },
    );
  }

  const sys = systemPrompt(level);

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('[coach] error', { status: r.status, body: text.slice(0, 300) });
      return NextResponse.json<CoachErr>(
        {
          reply: r.status === 429
            ? 'The coach is a bit busy. Try again in a moment.'
            : 'The coach had trouble thinking. Try again.',
          _status: r.status,
          _code: r.status === 429 ? 'rate_limited' : 'upstream_error',
          _body: text.slice(0, 300),
        },
        { status: 200 }, // keep UI simple: we still return 200 with a friendly message
      );
    }

    type Choice = { message?: { content?: string } };
    type ChatResp = { choices?: Choice[] };

    const data = (await r.json()) as ChatResp;
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error('[coach] error', { message: 'No content in OpenAI response' });
      return NextResponse.json<CoachErr>(
        { reply: 'The coach had trouble thinking. Try again.' },
        { status: 200 },
      );
    }

    console.log('[coach] reply', { model: 'gpt-4o-mini' });
    return NextResponse.json<CoachOk>({ reply, _model: 'gpt-4o-mini' });
  } catch (e) {
    const msg = (e as unknown as { message?: string })?.message ?? 'unknown';
    console.error('[coach] error', { message: msg });
    return NextResponse.json<CoachErr>(
      { reply: 'The coach had trouble thinking. Try again.' },
      { status: 200 },
    );
  }
}