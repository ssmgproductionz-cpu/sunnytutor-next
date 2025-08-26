// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

type SubscribeBody = { email: string };

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    accepts: 'POST { email }',
    configured: {
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      SUBSCRIBE_TO: Boolean(process.env.SUBSCRIBE_TO),
    },
  });
}

export async function POST(req: Request) {
  // Parse and validate input
  let email: string | undefined;
  try {
    const body = (await req.json()) as Partial<SubscribeBody> | null;
    email = (body?.email ?? '').trim();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'bad_request' },
      { status: 400 }
    );
  }

  if (!email || !isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'invalid_email' },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEnv = process.env.SUBSCRIBE_TO;

  // Dry-run if missing config (safe local behavior)
  if (!apiKey || !toEnv) {
    console.log('[subscribe] DRY-RUN (missing config)', {
      email,
      hasApiKey: Boolean(apiKey),
      hasTo: Boolean(toEnv),
    });
    return NextResponse.json({ ok: true, delivered: false, dryRun: true });
  }

  // Send via Resend
  try {
    const resend = new Resend(apiKey);
    const to = toEnv
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { data, error } = await resend.emails.send({
      from: 'Sunny Tutor <onboarding@resend.dev>',
      to,
      subject: 'New parent signup',
      text: `Email: ${email}`,
    });

    if (error) {
      const msg =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'send_failed')
          : 'send_failed';
      console.error('[subscribe] error', msg);
      return NextResponse.json(
        { ok: false, delivered: false, dryRun: false, error: msg },
        { status: 502 }
      );
    }

    console.log('[subscribe] sent', { email, to, id: data?.id });
    return NextResponse.json({ ok: true, delivered: true, id: data?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    console.error('[subscribe] exception', message);
    return NextResponse.json(
      { ok: false, delivered: false, dryRun: false, error: message },
      { status: 500 }
    );
  }
}
