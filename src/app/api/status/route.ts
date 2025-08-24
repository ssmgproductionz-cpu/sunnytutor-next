import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // ensure env vars are available

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY ?? '';
  const openaiKeyPresent = /^sk-/.test(openaiKey);
  const parentPinPresent = Boolean(process.env.PARENT_PIN && String(process.env.PARENT_PIN).trim() !== '');

  const payload = {
    ok: true,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    openaiKeyPresent,
    parentPinPresent,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercel: {
      region: process.env.VERCEL_REGION || null,
      url: process.env.VERCEL_URL || null,
    },
    uptimeSeconds:
      typeof process !== 'undefined' && typeof process.uptime === 'function'
        ? Math.round(process.uptime())
        : null,
  };

  return NextResponse.json(payload, { status: 200 });
}
