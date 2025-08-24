'use client';

import React, { useEffect, useState } from 'react';

type Status = {
  ok: boolean;
  env: string;
  time: string;
  openaiKeyPresent?: boolean;
  parentPinPresent?: boolean;
  vercel?: { region?: string | null; url?: string | null };
  commit?: string | null;
  uptimeSeconds?: number;
};

export default function StatusPill({ className = '' }: { className?: string }) {
  const [s, setS] = useState<Status | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/status')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((j: Status) => alive && setS(j))
      .catch(e => alive && setErr(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const color =
    !s ? 'bg-gray-100 text-gray-700 border-gray-200'
    : s.ok ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-red-100 text-red-700 border-red-200';

  const label =
    !s ? 'Checking…'
    : s.ok ? (s.env === 'production' ? 'Live' : 'Dev')
    : 'Error';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${color} ${className}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
      <span>{label}</span>
      {s?.vercel?.region && <span className="opacity-70">• {s.vercel.region}</span>}
      {s?.openaiKeyPresent === false && <span className="opacity-70">• no OpenAI key</span>}
      {s?.parentPinPresent === false && <span className="opacity-70">• no PIN</span>}
      {err && <span className="opacity-70">• {err}</span>}
    </div>
  );
}
