'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { BubbleBackground } from '@/components/BubbleBackground';
import { DispatchMapMock } from '@/components/DispatchMapMock';
import { SplashScreen } from '@/components/SplashScreen';

const metrics = [
  { label: 'Jobs Completed Today', value: '28', icon: '📄' },
  { label: 'Active Cleaners', value: '7', icon: '👤' },
  { label: 'Avg Arrival Time', value: '32 min', icon: '◷' },
];

const steps = [
  {
    title: 'Request Service',
    text: 'Choose service details and schedule your cleaning in under a minute.',
    icon: '◉',
  },
  {
    title: 'We Dispatch',
    text: 'Helio instantly routes the best available cleaner in Punta Cana and Bavaro.',
    icon: '⌁',
  },
  {
    title: 'Job Completed',
    text: 'Track progress in real time and confirm once your home is spotless.',
    icon: '✓',
  },
];

const features = [
  {
    title: 'Real-Time Dispatch',
    text: 'Live coordination for faster assignments and cleaner arrival visibility.',
  },
  {
    title: 'Role-Based Dashboard',
    text: 'A unified system for customers, cleaners, and dispatch admins.',
  },
  {
    title: 'Secure Payments Ready',
    text: 'Prepared for trusted digital payments and streamlined payout workflows.',
  },
  {
    title: 'Eco Cleaning Standards',
    text: 'Consistent, eco-conscious cleaning protocols for villas and apartments.',
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
        <header className="sticky top-0 z-30 border-b border-slate-700/70 bg-slate-950/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-100">
              <Image src="/public/image/logo.png" alt="Helio logo" width={220} height={80} priority unoptimized className="h-14 w-auto object-contain md:h-16" />
              <span className="text-sm font-semibold tracking-wide">Helio</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-400/50 hover:text-sky-200"
              >
                Home
              </Link>
              <Link
                href="/book"
                className="rounded-lg bg-sky-500/90 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]"
              >
                Book Now
              </Link>
            </nav>
          </div>
        </header>

        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white">
          <BubbleBackground className="opacity-20" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_52%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(to_right,rgba(148,163,184,0.3)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_70%)]" />

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center md:pb-24 md:pt-24">
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              On-Demand Cleaning. Powered by Helio.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base text-slate-200 md:text-lg">
              Book, dispatch, and manage professional cleaners across Punta Cana in minutes.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/book"
                className="inline-flex min-w-48 items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Book a Cleaning
              </Link>
              <Link
                href="/login"
                className="inline-flex min-w-48 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                Access Dashboard
              </Link>
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-200">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              Live in Punta Cana
            </div>
          </div>
        </section>

        <section className="bg-slate-950 pb-14 md:pb-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">Live Dispatch in Punta Cana</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              See how Helio assigns and routes professional cleaners in real time.
            </p>

            <div className="mt-6">
              <DispatchMapMock />
            </div>

            <div className="mt-6 grid gap-3 rounded-xl border border-slate-700/80 bg-slate-900/80 p-3 shadow-[0_0_0_1px_rgba(56,189,248,0.08)] sm:grid-cols-3 sm:gap-0 sm:p-0">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`helio-fade-up flex items-center gap-3 rounded-lg px-4 py-3 sm:rounded-none sm:px-5 sm:py-4 ${
                    index > 0 ? 'sm:border-l sm:border-slate-700' : ''
                  } ${index === 0 ? 'helio-fade-delay-1' : index === 1 ? 'helio-fade-delay-2' : 'helio-fade-delay-3'}`}
                >
                  <span className="text-lg text-slate-400">{metric.icon}</span>
                  <p className="text-sm text-slate-200">
                    {metric.label}: <span className="font-semibold text-cyan-300">{metric.value}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">How It Works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.title}
                  className="helio-fade-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-base font-semibold text-sky-200">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">Platform Features</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="helio-fade-up rounded-xl border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Ready to Experience Helio?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
              Join homeowners, Airbnb hosts, and property managers using Helio for cleaner, faster operations.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Book Your Cleaning Now
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
