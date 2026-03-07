'use client';

import { useEffect, useMemo, useState } from 'react';

type Booking = {
  id: string;
  customerName: string;
  address: string;
  serviceType: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  assignedWorker: { name: string } | null;
};

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch('/api/customer/bookings', { cache: 'no-store' });
      const json = await response.json();
      if (!mounted) return;

      if (!response.ok) {
        setError(json.error ?? 'Unable to load bookings.');
      } else {
        setBookings(json);
      }
      setLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const now = Date.now();
  const upcoming = useMemo(
    () => bookings.filter((booking) => new Date(booking.scheduledDate).getTime() >= now),
    [bookings, now],
  );
  const past = useMemo(
    () => bookings.filter((booking) => new Date(booking.scheduledDate).getTime() < now),
    [bookings, now],
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <h1 className="text-3xl font-semibold">Customer Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Track your upcoming and past cleanings in one place.</p>
        </header>

        {loading && <p className="text-slate-400">Loading your bookings...</p>}
        {error && <p className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">{error}</p>}

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-xl font-semibold text-sky-300">Upcoming Jobs</h2>
          <div className="mt-3 space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-slate-500">No upcoming bookings.</p>}
            {upcoming.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm">
                <p className="font-semibold text-white">{booking.serviceType}</p>
                <p className="text-slate-300">{booking.address}</p>
                <p className="text-slate-400">{new Date(booking.scheduledDate).toLocaleString()}</p>
                <p className="text-slate-500">Status: {booking.status}</p>
                <p className="text-slate-500">Cleaner: {booking.assignedWorker?.name ?? 'Unassigned'}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-xl font-semibold text-slate-100">Past Jobs</h2>
          <div className="mt-3 space-y-2">
            {past.length === 0 && <p className="text-sm text-slate-500">No past bookings.</p>}
            {past.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm">
                <p className="font-semibold text-white">{booking.serviceType}</p>
                <p className="text-slate-300">{booking.address}</p>
                <p className="text-slate-400">{new Date(booking.scheduledDate).toLocaleString()}</p>
                <p className="text-slate-500">Status: {booking.status}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
