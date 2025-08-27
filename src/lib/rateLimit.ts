// src/lib/rateLimit.ts
type Key = string;

const buckets = new Map<Key, { count: number; resetAt: number }>();

export interface RateLimitOpts {
  windowMs: number; // e.g. 60_000
  max: number;      // e.g. 20
  key?: string;     // override key if desired
}

export function getClientIp(req: Request): string {
  // Vercel/Node: prefer forwarded-for, then remote addr, then fallback
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const xr = req.headers.get('x-real-ip');
  if (xr) return xr;
  return 'unknown';
}

export async function enforceRateLimit(req: Request, opts: RateLimitOpts) {
  const now = Date.now();
  const key = opts.key ?? `${getClientIp(req)}:${new URL(req.url).pathname}`;
  const hit = buckets.get(key);

  if (!hit || now > hit.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.max - 1 };
  }

  if (hit.count >= opts.max) {
    const retryAfterSec = Math.max(1, Math.ceil((hit.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  hit.count += 1;
  return { ok: true, remaining: Math.max(0, opts.max - hit.count) };
}
