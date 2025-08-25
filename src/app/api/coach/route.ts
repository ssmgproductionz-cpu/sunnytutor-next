// src/app/api/coach/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Level = 'k2' | 'g3' | string;

interface CoachRequest {
  message: string;
  level?: Level;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
}

function isCoachRequest(x: unknown): x is CoachRequest {
  if (typeof x !== 'object' || x === null) return false;
  const rec = x as Record<string, unknown>;
  return typeof rec.message === 'string' && (typeof rec.level === 'string' || rec.level === undefined);
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return Math.abs(a);
}

/**
 * Try a quick offline simplifier for plain "a/b" inputs.
 * Returns a coach reply string, or null if not applicable.
 */
function tryOfflineFractionReply(msg: string): string | null {
  const m = msg.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  const den = parseInt(m[2], 10);
  if (den === 0) return 'You cannot divide by zero.';
  const g = gcd(num, den);
  if (g > 1) {
    const sn = num / g;
    const sd = den / g;
    return `Divide top and bottom by ${g}: ${num}/${den} → ${sn}/${sd}.`;
  }
  // Already simplest — return null so the AI can add a helpful hint instead.
  return null;
}

function systemPrompt(level: Level): string {
  const readingHint =
    level === 'k2'
      ? 'Keep answers short, friendly, and K–2 reading level.'
      : 'Keep answers clear and concise for a young learner.';
  return [
    'You are a gentle math coach for kids learning fractions.',
    readingHint,
    'Prefer one or two short steps; avoid big walls of text.',
  ].join(' ');
}

export async function POST(req: Request) {
  try {
    const bodyUnknown = await req.json();
    if (!isCoachRequest(bodyUnknown)) {
      return NextResponse.json({ reply: 'Bad request.' }, { status: 400 });
    }

    const { message, level = 'k2' } = bodyUnknown;

    // 1) Offline fast-path for plain fractions like "2/8"
    const offline = tryOfflineFractionReply(message);
    if (offline) {
      return NextResponse.json({ reply: offline, _model: 'offline' as const });
    }

    // 2) Online path via OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { reply: 'The coach is not configured yet. Add OPENAI_API_KEY on the server.' },
        { status: 200 },
      );
    }

    const payload = {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 160,
      messages: [
        { role: 'system', content: systemPrompt(level) },
        { role: 'user', content: message },
      ] as ChatMessage[],
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text();
      // mask possible secrets in logs by not echoing headers/body back
      return NextResponse.json(
        { reply: 'The coach had trouble thinking. Try again.', _status: r.status, _code: 'openai_error' },
        { status: 200 },
      );
    }

    const data = (await r.json()) as OpenAIChatResponse;
    const content =
      data.choices && data.choices[0] && typeof data.choices[0].message.content === 'string'
        ? data.choices[0].message.content
        : 'The coach had trouble thinking. Try again.';

    return NextResponse.json({ reply: content, _model: 'gpt-4o-mini' as const });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { reply: 'The coach had trouble thinking. Try again.', _error: msg },
      { status: 200 },
    );
  }
}
