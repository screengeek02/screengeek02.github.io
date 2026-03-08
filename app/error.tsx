'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl shadow-slate-950/40">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">We hit an unexpected error.</h1>
        <p className="mt-3 text-sm text-slate-300">
          Please try again. If the problem keeps happening, return to the home page and continue from there.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
