'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });

    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(json.error ?? 'Login failed.');
      return;
    }

    if (json.role === 'ADMIN') {
      router.replace('/admin/dashboard');
      return;
    }

    if (json.role === 'WORKER') {
      router.replace('/worker/dashboard');
      return;
    }

    router.replace('/dashboard');
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-100 shadow-xl">


      <h1 className="mb-2 text-2xl font-semibold">Login</h1>
      <p className="mb-4 text-sm text-slate-400">Access your admin, worker, or customer account.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" type="email" name="email" placeholder="Email" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" type="password" name="password" placeholder="Password" required />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 space-y-1 text-sm text-slate-400">
        <p>
          Customer?{' '}
          <Link href="/signup" className="text-sky-300 hover:text-sky-200">
            Create account
          </Link>
        </p>
        <p>
          Want to become a cleaner?{' '}
          <Link href="/worker/apply" className="text-sky-300 hover:text-sky-200">
            Apply as worker
          </Link>
        </p>
      </div>
    </section>
  );
}
