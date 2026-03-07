'use client';

import { useEffect, useRef, useState } from 'react';

const SEND_INTERVAL_MS = 10_000;

export function WorkerLocationTracker() {
  const [status, setStatus] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const latestPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Geolocation is not supported on this device.');
      return;
    }

    const sendLocation = async () => {
      if (!latestPositionRef.current) return;

      try {
        await fetch('/api/worker/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(latestPositionRef.current),
        });
      } catch {
        setStatus('error');
        setMessage('Unable to send location update.');
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        latestPositionRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setStatus('tracking');
        setMessage('Location sharing active.');
      },
      (error) => {
        setStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setMessage('Location permission denied. Enable GPS access to share live tracking.');
        } else {
          setMessage('Unable to read GPS location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );

    timerRef.current = window.setInterval(() => {
      void sendLocation();
    }, SEND_INTERVAL_MS);

    void sendLocation();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
      <span className="font-semibold text-sky-300">GPS Tracker:</span>{' '}
      <span className={status === 'error' ? 'text-rose-300' : 'text-slate-200'}>
        {message || 'Waiting for location...'}
      </span>
    </div>
  );
}
