'use client';

import { FormEvent, useEffect, useState } from 'react';

type SettingsState = {
  platformName: string;
  supportEmail: string;
  timezone: string;
  standardPrice: number;
  deepPrice: number;
  moveOutPrice: number;
  platformCommission: number;
  autoApproveWorkers: boolean;
  workerJobRadiusKm: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

const STORAGE_KEY = 'helio-admin-settings';

const defaultSettings: SettingsState = {
  platformName: 'Helio Cleaning Dispatch',
  supportEmail: 'support@heliocleaning.com',
  timezone: 'America/Santo_Domingo',
  standardPrice: 5000,
  deepPrice: 7000,
  moveOutPrice: 8500,
  platformCommission: 25,
  autoApproveWorkers: false,
  workerJobRadiusKm: 15,
  emailNotifications: true,
  smsNotifications: false,
};

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SettingsState;
      setSettings({ ...defaultSettings, ...parsed });
    } catch {
      // ignore malformed local data
    }
  }, []);

  function setField<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage('');
  }

  function save(event: FormEvent) {
    event.preventDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage('Settings saved locally.');
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5">
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage platform, pricing, worker, and notification configurations.</p>
      </div>

      <SectionCard title="Platform Settings" description="General platform identity and support options.">
        <label className="block text-sm text-slate-300">
          Platform name
          <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" value={settings.platformName} onChange={(e) => setField('platformName', e.target.value)} />
        </label>
        <label className="block text-sm text-slate-300">
          Support email
          <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" type="email" value={settings.supportEmail} onChange={(e) => setField('supportEmail', e.target.value)} />
        </label>
        <label className="block text-sm text-slate-300">
          Timezone
          <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" value={settings.timezone} onChange={(e) => setField('timezone', e.target.value)} />
        </label>
      </SectionCard>

      <SectionCard title="Pricing Settings" description="Default marketplace pricing and platform commission.">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-slate-300">Standard Cleaning (RD$)
            <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" type="number" value={settings.standardPrice} onChange={(e) => setField('standardPrice', Number(e.target.value))} />
          </label>
          <label className="block text-sm text-slate-300">Deep Cleaning (RD$)
            <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" type="number" value={settings.deepPrice} onChange={(e) => setField('deepPrice', Number(e.target.value))} />
          </label>
          <label className="block text-sm text-slate-300">Move Out Cleaning (RD$)
            <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" type="number" value={settings.moveOutPrice} onChange={(e) => setField('moveOutPrice', Number(e.target.value))} />
          </label>
          <label className="block text-sm text-slate-300">Platform Commission (%)
            <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" type="number" value={settings.platformCommission} onChange={(e) => setField('platformCommission', Number(e.target.value))} />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Worker Settings" description="Configure worker onboarding and assignment bounds.">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={settings.autoApproveWorkers} onChange={(e) => setField('autoApproveWorkers', e.target.checked)} />
          Auto approve workers
        </label>
        <label className="block text-sm text-slate-300">Worker job radius (km)
          <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" type="number" value={settings.workerJobRadiusKm} onChange={(e) => setField('workerJobRadiusKm', Number(e.target.value))} />
        </label>
      </SectionCard>

      <SectionCard title="Notification Settings" description="Choose how admins receive platform alerts.">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setField('emailNotifications', e.target.checked)} />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => setField('smsNotifications', e.target.checked)} />
          SMS notifications
        </label>
      </SectionCard>

      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
        Save Settings
      </button>
    </form>
  );
}
