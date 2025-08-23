import { NextRequest, NextResponse } from 'next/server';

type Level = 'k2' | 'g3_5' | 'g6_8';

interface CoachRequest {
  message: string;
  level?: Level;
}

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const API_KEY = process.env.OPENAI_API_KEY;

/** Kid-safe system prompt by level */
function systemFor(level: Level): string {
  switch (level) {
    case 'g3_5':
      return 'You are a friendly math coach for grades 3–5. Give short hints (1–2 sentences), avoid full solutions unless asked. Keep it safe and positive.';
    case 'g6_8':
      return 'You are a friendly math coach for grades 6–8. Provide concise hints and small steps, not full solutions unless asked.';
    case 'k2':
    default:
      return 'You are a friendly K–2 math coach. Use simple words and one short hint. Keep it kid-safe and encouraging.';
  }
}

/** Minimal shape of OpenAI chat response */
interface ChatMessage { content?: string }
interface ChatChoice { message?: ChatMessage }
interface ChatCompletionResp { choices?: ChatChoice[] }

function extractContent(resp: unknown): string | null {
  const r = resp as ChatCompletionResp;
  if (!r || !Array.isArray(r.choices)) return null;
  const c = r.choices[0]?.message?.content;
  return typeof c === 'string' ? c : null;
}

export async function POST(req: NextRequest) {
  // Safe parse (no `any`)
  let bodyUnknown: unknown = null;
  try {
    bodyUnknown = await req.json();
  } catch {
    /* ignore malformed JSON */
  }
  const body = (bodyUnknown ?? {}) as Partial<CoachRequest>;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const level: Level = (body.level as Level) ?? 'k2';

  if (!message) {
    return NextResponse.json({ reply: 'Please type a question for the coach.' });
  }

  if (!API_KEY) {
    return NextResponse.json({
      reply: 'Your OpenAI API key is missing or invalid. Update OPENAI_API_KEY and restart.',
    });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemFor(level) },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json(
          {
            reply: 'The coach hit a rate limit. Please try again in a minute.',
            _status: 429,
            _code: 'rate_limited',
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { reply: 'The coach had trouble thinking. Try again.' },
        { status: 200 }
      );
    }

    const data: unknown = await res.json();
    const content = extractContent(data) ?? 'Hmm, I could not think of a hint right now.';
    return NextResponse.json({ reply: content, _model: MODEL });
  } catch (e: unknown) {
    console.error('OpenAI fetch failed', e);
    return NextResponse.json(
      { reply: 'Network error reaching the coach. Please try again.' },
      { status: 200 }
    );
  }
}