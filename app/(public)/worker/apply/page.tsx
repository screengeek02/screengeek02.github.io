'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { FormEvent, useState } from 'react';

export default function WorkerApplyPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/worker/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
        city: form.get('city'),
        experience: form.get('experience'),
      }),
    });

    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(json.error ?? 'Unable to submit application.');
      return;
    }

    setSuccess('Account created successfully. Please log in to continue.');
    event.currentTarget.reset();
    router.push('/login');
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-100 shadow-lg">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <h1 className="text-2xl font-semibold">Worker Application</h1>
      <p className="mt-2 text-sm text-slate-400">Apply to join Helio as a professional cleaner.</p>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" name="name" placeholder="Full Name" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" type="email" name="email" placeholder="Email" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" name="phone" placeholder="Phone" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" type="password" name="password" placeholder="Password" required />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" name="city" placeholder="City" required />
        <textarea className="min-h-[110px] w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2" name="experience" placeholder="Experience" required />
        <input className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-slate-100" type="file" name="idUpload" />

        {error && <p className="text-sm text-rose-300">{error}</p>}
        {success && <p className="text-sm text-emerald-300">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-500 py-2 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-70"
        >
          {loading ? 'Submitting...' : 'Apply as Worker'}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-sky-300 hover:text-sky-200">
          Login
        </Link>
      </div>
    </section>
  );
}
