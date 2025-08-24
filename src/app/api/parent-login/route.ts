// src/app/api/parent-login/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let pin = '';
  try {
    const body = (await req.json()) as { pin?: string };
    pin = (body.pin ?? '').toString();
  } catch {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 });
  }

  const expected = process.env.PARENT_PIN || '1234';
  if (pin !== expected) {
    return NextResponse.json({ message: 'Incorrect PIN' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // IMPORTANT: only secure in production so it works on localhost (http).
  res.cookies.set('parent_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
