// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs'; // Resend SDK needs Node runtime

type Body = { email?: string };

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const { email }: Body = await req.json();

    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_email' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.SUBSCRIBE_TO;

    // DRY-RUN: no credentials configured → don't crash, just report
    if (!apiKey || !to) {
      console.log('[subscribe] DRY_RUN', { email, apiKeySet: !!apiKey, toSet: !!to });
      return NextResponse.json({ ok: true, delivered: false, dryRun: true });
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: 'SunnyTutor <onboarding@resend.dev>', // switch to a verified domain when you have one
      to,                                         // e.g. "you@example.com"
      subject: 'New SunnyTutor subscriber',
      text: `New subscriber: ${email}`,
    });

    const id = result.data?.id ?? null;
    const delivered = !!result.data && !result.error;
    const errorMsg = result.error?.message ?? null;

    console.log('[subscribe] sent', { email, to, id, delivered, error: errorMsg });

    return NextResponse.json(
      { ok: true, delivered, id, error: errorMsg, dryRun: false },
      { status: delivered ? 200 : 502 }
    );
  } catch (err) {
    console.error('[subscribe] error', err);
    return NextResponse.json(
      { ok: false, error: 'bad_request' },
      { status: 400 }
    );
  }
}
