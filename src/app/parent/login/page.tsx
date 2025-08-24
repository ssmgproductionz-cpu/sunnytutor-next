import { Suspense } from 'react';
import LoginFormClient from './LoginFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ParentLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-4">Parent Login</h1>
        <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
          <LoginFormClient />
        </Suspense>
      </div>
    </main>
  );
}
