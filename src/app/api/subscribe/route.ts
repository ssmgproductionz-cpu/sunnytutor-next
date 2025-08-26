// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

type Body = { email?: string };

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
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

    // If keys are missing, just log and succeed (dev-friendly)
    if (!key || !to) {
      console.log('[subscribe] (dry-run) email:', email);
      return NextResponse.json({ ok: true, delivered: false });
    }

    const resend = new Resend(key);

    // Use Resend’s safe default from-domain to avoid domain setup:
    const result = await resend.emails.send({
      from: 'Sunny Tutor <onboarding@resend.dev>',
      to,
      replyTo: email, // you can reply directly to the parent
      subject: `New parent signup: ${email}`,
      text: `A parent joined the waitlist.\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`,
    });

    console.log('[subscribe] sent', { email, to, id: result.id });

    return NextResponse.json({ ok: true, delivered: true, id: result.id });
  } catch (err) {
    console.error('[subscribe] error', err);
    return NextResponse.json(
      { ok: false, error: 'send_failed' },
      { status: 500 }
    );
  }
}
