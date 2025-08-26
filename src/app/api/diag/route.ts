// src/app/api/diag/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function maskEmail(e: string) {
  const [name, domain] = e.split('@');
  if (!domain) return 'invalid';
  const first = name?.[0] ?? '*';
  return `${first}***@${domain}`;
}

export async function GET() {
  const openai = process.env.OPENAI_API_KEY ?? '';
  const openaiProject = process.env.OPENAI_PROJECT ?? '';
  const resend = process.env.RESEND_API_KEY ?? '';
  const to = process.env.SUBSCRIBE_TO ?? '';

  return NextResponse.json(
    {
      env: process.env.VERCEL_ENV ?? 'development',
      openai: {
        present: !!openai,
        prefix: openai.slice(0, 5),      // e.g. "sk-pr" or "sk-or"
        len: openai.length,
        projectPresent: !!openaiProject,
      },
      resend: {
        present: !!resend,
        prefix: resend.slice(0, 3),      // should be "re_"
        len: resend.length,
        looksLikeResend: resend.startsWith('re_'),
        hasTrailingSpace: /\s$/.test(resend),
      },
      subscribeTo: {
        present: !!to,
        masked: to ? maskEmail(to) : null,
      },
    },
    { headers: { 'cache-control': 'no-store' } }
  );
}
