'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { FormEvent, useState } from 'react';

export default function CustomerSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
      }),
    });

    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(json.error ?? 'Unable to create account.');
      return;
    }

    router.push('/login');
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-100">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <h1 className="text-2xl font-semibold">Create Customer Account</h1>
      <p className="mt-1 text-sm text-slate-400">Sign up to manage bookings and track cleanings.</p>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" name="name" placeholder="Full Name" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" type="email" name="email" placeholder="Email" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" name="phone" placeholder="Phone" />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" type="password" name="password" placeholder="Password" required />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="w-full rounded-lg bg-sky-500 py-2 font-semibold text-slate-950" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Already registered?{' '}
        <Link href="/login" className="text-sky-300 hover:text-sky-200">
          Login
        </Link>
      </p>
    </section>
  );
}
