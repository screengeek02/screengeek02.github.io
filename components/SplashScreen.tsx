'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { BubbleBackground } from './BubbleBackground';

type SplashScreenProps = {
  onComplete: () => void;
  durationMs?: number;
};

export function SplashScreen({ onComplete, durationMs = 1800 }: SplashScreenProps) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimeout = window.setTimeout(() => {
      setFadingOut(true);
    }, durationMs);

    const completeTimeout = window.setTimeout(() => {
      onComplete();
    }, durationMs + 450);

    return () => {
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(completeTimeout);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-sky-950 transition-opacity duration-500 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden={fadingOut}
    >
      <BubbleBackground className="opacity-80" />
      <div className="relative z-10 text-center text-white">
        <Logo />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Helio Cleaning</h1>
        <p className="mt-3 text-sm text-sky-100 md:text-base">Professional Cleaning in Punta Cana</p>
      </div>
    </div>
  );
}
