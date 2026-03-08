'use client';

import { useEffect, useState } from 'react';

type DayAvailability = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

type AvailabilityResponse = {
  workerId: string;
  enabled: boolean;
  days: DayAvailability[];
};

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkerAvailabilityPage() {
  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/availability', { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to load availability.');
        const json = (await response.json()) as AvailabilityResponse;
        setEnabled(json.enabled);
        setDays(json.days.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
      } catch {
        setError('Could not load availability settings.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  function updateDay(dayOfWeek: number, patch: Partial<DayAvailability>) {
    setDays((prev) => prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)));
    setSuccess('');
  }

  async function save() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, days }),
      });

      if (!response.ok) throw new Error('Unable to save availability.');
      setSuccess('Availability updated successfully.');
    } catch {
      setError('Could not save availability settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-8 text-slate-300">Loading availability...</section>;
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-700/70 bg-slate-900/70 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Availability</h1>
        <p className="mt-2 text-slate-400">Set your availability status, work days, and time ranges.</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-100">Availability Status</p>
          <p className="text-xs text-slate-400">Toggle whether you are currently available for dispatch.</p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((prev) => !prev)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-300'}`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <div key={day.dayOfWeek} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-[160px_120px_1fr_1fr] md:items-center">
            <p className="text-sm font-medium text-slate-100">{DAY_LABELS[day.dayOfWeek]}</p>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={day.isAvailable}
                onChange={(event) => updateDay(day.dayOfWeek, { isAvailable: event.target.checked })}
              />
              Available
            </label>
            <input
              type="time"
              value={day.startTime}
              disabled={!day.isAvailable}
              onChange={(event) => updateDay(day.dayOfWeek, { startTime: event.target.value })}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 disabled:opacity-50"
            />
            <input
              type="time"
              value={day.endTime}
              disabled={!day.isAvailable}
              onChange={(event) => updateDay(day.dayOfWeek, { endTime: event.target.value })}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {success && <p className="text-sm text-emerald-300">{success}</p>}

      <button
        type="button"
        onClick={() => {
          void save();
        }}
        disabled={saving}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </section>
  );
}
