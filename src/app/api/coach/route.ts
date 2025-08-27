// src/app/api/coach/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { enforceRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

type CoachReq = { message?: string; level?: string };

const OFFLINE_RESPONSES: Record<string, string> = {
  '2/8': 'Divide top and bottom by 2: 2/8 → 1/4.',
};

function offlineCoach(msg: string): string {
  if (OFFLINE_RESPONSES[msg?.trim()]) return OFFLINE_RESPONSES[msg.trim()];
  // Simple fraction add hint:
  if (/1\/2\s*\+\s*1\/4/i.test(msg)) {
    return `Great question! First, you need a common bottom number (denominator).

The bottom numbers are 2 and 4. The common bottom number is 4.

Now, change 1/2 to 2/4.

So, now you have 2/4 + 1/4. What do you think you can do next?`;
  }
  return 'I can help! Tell me what you’re stuck on.';
}

export async function POST(req: Request) {
  try {
    // --- rate limit (optional, safe defaults) ---
    const limit = await enforceRateLimit(req, { windowMs: 60_000, max: 30 });
    if (!limit.ok) {
      return NextResponse.json(
        { reply: 'Too many requests. Try again shortly.', _code: 'rate_limited' },
        { status: 429 },
      );
    }

    const { message, level }: CoachReq = await req.json();
    const msg = (message ?? '').toString().slice(0, 500);

    // offline fallback first
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ reply: offlineCoach(msg), _model: 'offline' });
    }

    // online path
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system = `You are a friendly K-8 math tutor. Keep responses short and step-by-step. Level: ${level ?? 'k2'}.`;
    const user = msg || 'Help me with a simple fraction problem.';

    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 180,
    });

    const reply = r.choices?.[0]?.message?.content?.trim() || offlineCoach(msg);
    return NextResponse.json({ reply, _model: 'gpt-4o-mini' });
  } catch (err: unknown) {
    // keep same shape for callers
    return NextResponse.json(
      { reply: 'The coach had trouble thinking. Try again.', _status: 500, _code: 'server_error' },
      { status: 200 }, // legacy: we’ve been returning 200 with error payload
    );
  }
}
