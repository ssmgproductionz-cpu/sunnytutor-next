// scripts/smoke.mjs
// Tiny end-to-end smoke test for Sunny Tutor APIs.
// Usage:
//   BASE=http://localhost:3000 node scripts/smoke.mjs
//   BASE=https://sunnytutor-next1.vercel.app node scripts/smoke.mjs

const BASE = process.env.BASE?.replace(/\/$/, '') || 'http://localhost:3000';

function log(section, msg, extra) {
  const p = `[${section}] ${msg}`;
  if (extra) console.log(p, extra);
  else console.log(p);
}

async function j(res) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${txt.slice(0, 200)}`);
  }
}

async function fetchJson(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Accept': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const body = await j(res);
  return { res, body };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function testStatus() {
  const { res, body } = await fetchJson('/api/status');
  assert(res.ok, `/api/status HTTP ${res.status}`);
  assert(body?.ok === true, '/api/status ok != true');
  log('status', 'ok', body);
}

async function testCoachOffline() {
  const { res, body } = await fetchJson('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '2/8', level: 'k2' }),
  });
  assert(res.ok, `/api/coach (offline) HTTP ${res.status}`);
  assert(typeof body?.reply === 'string' && body.reply.length > 0, 'coach offline missing reply');
  // heuristic: result should mention 1/4
  assert(/1\/4/.test(body.reply), 'coach offline did not simplify to 1/4');
  log('coach-offline', 'ok', { model: body._model });
}

async function testCoachOnline() {
  const { res, body } = await fetchJson('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: "I’m stuck on 1/2 + 1/4. What do I do first?",
      level: 'k2',
    }),
  });
  assert(res.ok, `/api/coach (online) HTTP ${res.status}`);
  // Don’t fail the build if the upstream model is unavailable; just warn.
  if (body?._status) {
    log('coach-online', `warning (${body._code || body._status})`, body);
    return { warn: true };
  }
  assert(typeof body?.reply === 'string' && body.reply.length > 0, 'coach online missing reply');
  log('coach-online', 'ok', { model: body._model });
  return {};
}

async function testSubscribe() {
  // First, see how it’s configured
  const { res: resCfg, body: cfg } = await fetchJson('/api/subscribe');
  assert(resCfg.ok, `/api/subscribe (GET) HTTP ${resCfg.status}`);
  assert(cfg?.ok === true, '/api/subscribe GET ok != true');
  log('subscribe', 'config', cfg.configured);

  // Now try to send one
  const email = `smoke+${Date.now()}@ex.com`;
  const { res, body } = await fetchJson('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  assert(res.ok, `/api/subscribe (POST) HTTP ${res.status}`);

  // Accept either a real send or a dry-run depending on env config.
  if (body?.ok === true && body?.delivered === true) {
    log('subscribe', 'delivered', { id: body.id });
    return;
  }
  if (body?.ok === true && body?.dryRun === true) {
    log('subscribe', 'dry-run (no key in this env)');
    return;
  }
  throw new Error(`/api/subscribe unexpected response: ${JSON.stringify(body)}`);
}

async function main() {
  console.log(`\n=== Sunny Tutor smoke test ===\nBASE → ${BASE}\n`);
  let fails = 0;
  let warns = 0;

  const steps = [
    ['status', testStatus],
    ['coach-offline', testCoachOffline],
    ['coach-online', testCoachOnline],
    ['subscribe', testSubscribe],
  ];

  for (const [name, fn] of steps) {
    try {
      const r = await fn();
      if (r?.warn) warns += 1;
    } catch (e) {
      fails += 1;
      console.error(`[${name}] FAIL →`, e?.message || e);
    }
  }

  if (warns) console.warn(`\nWarnings: ${warns} (non-fatal)`);
  if (fails) {
    console.error(`\nSmoke test: ${fails} failing check(s) ❌`);
    process.exit(1);
  }
  console.log('\nSmoke test: all good ✅');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
