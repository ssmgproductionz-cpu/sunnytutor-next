import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    // Basic email validation
    const ok = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: 'invalid_email' },
        { status: 400 }
      );
    }

    // Minimal demo: just log it. (Hook to Mailchimp/Resend/etc. later)
    console.log('[subscribe] email:', email);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'bad_request' },
      { status: 400 }
    );
  }
}
