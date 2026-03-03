'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';

const stats = [
  { label: 'Jobs Completed Today', value: '24' },
  { label: 'Active Cleaners', value: '6' },
  { label: 'Avg Arrival Time', value: '38 min' },
];

const steps = [
  {
    title: 'Request Service',
    text: 'Choose your time, location, and cleaning type in under 60 seconds.',
    icon: '01',
  },
  {
    title: 'We Dispatch',
    text: 'Helio routes the best available cleaner across Punta Cana in real-time.',
    icon: '02',
  },
  {
    title: 'Job Completed',
    text: 'Track job status live and receive confirmation once your service is done.',
    icon: '03',
  },
];

const features = [
  {
    title: 'Real-Time Dispatch',
    text: 'Hybrid assignment model for faster cleaner coverage and better SLA performance.',
  },
  {
    title: 'Role-Based Dashboard',
    text: 'Dedicated command center for admins and a field-ready app experience for workers.',
  },
  {
    title: 'Secure Payments Ready',
    text: 'Architecture prepared for future card capture, payouts, and payment reconciliation.',
  },
  {
    title: 'Eco Cleaning Standards',
    text: 'Consistent, professional cleaning protocols with eco-conscious product choices.',
  },
];

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <main className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_40%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-sky-200">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              Live in Punta Cana
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              On-Demand Cleaning. Powered by Helio.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-200 md:text-lg">
              Book, dispatch, and manage professional cleaners across Punta Cana in minutes.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Book a Cleaning
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-600 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-3 px-4 py-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">How Helio Works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold tracking-wider text-sky-200">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Platform Features</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to Experience Helio?</h2>
            <p className="mt-4 text-sm text-slate-300 md:text-base">
              Join homeowners, Airbnb hosts, and expats using Helio to run cleaner, faster operations.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Book Your Cleaning Now
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
