// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

type Body = { email?: string };

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as Body;

    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_email' },
        { status: 400 }
      );
    }

    const key = process.env.RESEND_API_KEY;
    const to = process.env.SUBSCRIBE_TO;

    // Dev-friendly: if envs are missing, just log and succeed without sending.
    if (!key || !to) {
      console.log('[subscribe] (dry-run) email:', email, { hasKey: !!key, to });
      return NextResponse.json({ ok: true, delivered: false });
    }

    const resend = new Resend(key);

    const result = await resend.emails.send({
      from: 'Sunny Tutor <onboarding@resend.dev>',
      to,
      replyTo: email,
      subject: `New parent signup: ${email}`,
      text: `A parent joined the waitlist.\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`,
    });

    if (result.error) {
      console.error('[subscribe] resend error:', result.error);
      return NextResponse.json(
        { ok: false, error: 'send_failed' },
        { status: 500 }
      );
    }

    const id = result.data?.id ?? null;
    console.log('[subscribe] sent', { email, to, id });

    return NextResponse.json({ ok: true, delivered: true, id });
  } catch (err) {
    console.error('[subscribe] error', err);
    return NextResponse.json(
      { ok: false, error: 'send_failed' },
      { status: 500 }
    );
  }
}

