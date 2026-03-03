'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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
        <Image
          src="/image/logo.png"
          alt="Helio logo"
          width={96}
          height={96}
          priority
          className="helio-logo-float mx-auto h-20 w-20 rounded-2xl object-contain md:h-24 md:w-24"
        />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Helio Cleaning</h1>
        <p className="mt-3 text-sm text-sky-100 md:text-base">Professional Cleaning in Punta Cana</p>
      </div>
    </div>
  );
}
