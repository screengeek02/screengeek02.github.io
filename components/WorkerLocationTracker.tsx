'use client';

import { useEffect, useRef } from 'react';

const SEND_INTERVAL_MS = 12_000;

export default function WorkerLocationTracker() {
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const latestPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported on this device.');
      return;
    }

    const postLocation = async () => {
      if (!latestPositionRef.current) return;

      try {
        await fetch('/api/worker/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(latestPositionRef.current),
        });
      } catch (error) {
        console.error('Failed to send worker location:', error);
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        latestPositionRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          console.error('Location permission denied');
          return;
        }

        console.error('Failed to read location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 10_000,
      },
    );

    timerRef.current = window.setInterval(() => {
      void postLocation();
    }, SEND_INTERVAL_MS);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return null;
}
