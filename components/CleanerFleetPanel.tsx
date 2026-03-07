'use client';

import clsx from 'clsx';
import type { DispatchMapWorker } from '@/components/DispatchMap';

type Props = {
  workers: DispatchMapWorker[];
};

function statusStyles(status: DispatchMapWorker['status']) {
  if (status === 'AVAILABLE') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (status === 'ASSIGNED') return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
}

export function CleanerFleetPanel({ workers }: Props) {
  return (
    <aside className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-semibold text-white">Cleaner Fleet</h2>
      <p className="mt-1 text-xs text-slate-400">Live worker states across Punta Cana.</p>

      <div className="mt-3 space-y-2">
        {workers.length === 0 && <p className="text-xs text-slate-500">No cleaners available.</p>}

        {workers.map((worker) => (
          <article key={worker.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{worker.name}</p>
              <span className={clsx('rounded-full border px-2 py-1 text-[10px] font-semibold', statusStyles(worker.status))}>
                {worker.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Assigned jobs: {worker.assignedJobsCount}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
