'use client';

import clsx from 'clsx';

type AvailabilityToggleProps = {
  online: boolean;
  onToggle: () => void;
};

export function AvailabilityToggle({ online, onToggle }: AvailabilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
        online
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100',
      )}
      aria-pressed={online}
    >
      <span className={clsx('h-2.5 w-2.5 rounded-full', online ? 'bg-emerald-500' : 'bg-slate-400')} />
      {online ? 'Online' : 'Offline'}
    </button>
  );
}
