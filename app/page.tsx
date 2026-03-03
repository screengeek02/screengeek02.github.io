'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <main
        className={`min-h-screen bg-slate-50 transition-opacity duration-700 ${
          showSplash ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-sky-700">Punta Cana • Bavaro</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Premium Cleaning Services in Punta Cana
            </h1>
            <p className="mt-5 text-base text-slate-600 md:text-lg">
              Book trusted cleaners for your villa, Airbnb, or apartment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/book"
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Book Now
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Worker Login
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Reliable Staff',
                text: 'Background-checked cleaners with consistent quality and punctual arrivals.',
              },
              {
                title: 'Flexible Scheduling',
                text: 'Morning, afternoon, and same-day scheduling options for busy hosts and homeowners.',
              },
              {
                title: 'Eco-Friendly Products',
                text: 'Safe, high-performance cleaning supplies that are family and pet friendly.',
              },
            ].map((feature, index) => (
              <article
                key={feature.title}
                className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 ${
                  showSplash ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <h2 className="text-lg font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
