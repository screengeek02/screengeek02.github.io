'use client';

import { JobStatus } from '@prisma/client';

type Worker = {
  id: string;
  name: string;
};

type Job = {
  id: string;
  customerName: string;
  address: string;
  serviceType: string;
  scheduledDate: string;
  status: JobStatus;
  assignedWorker?: Worker | null;
};

const statusClasses: Record<JobStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  ASSIGNED: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30',
  IN_PROGRESS: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  CANCELLED: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30',
};

export function ScheduleJobCard({
  job,
  workers,
  assigning,
  onAssign,
}: {
  job: Job;
  workers: Worker[];
  assigning: boolean;
  onAssign: (jobId: string, workerId: string) => Promise<void>;
}) {
  const timeLabel = new Date(job.scheduledDate).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-sky-300">{timeLabel}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[job.status]}`}>{job.status.replace('_', ' ')}</span>
      </div>

      <h3 className="mt-2 text-base font-semibold text-white">{job.customerName}</h3>
      <p className="mt-1 text-sm text-slate-300">{job.address}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{job.serviceType.replace('_', ' ')}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
        <p className="text-sm text-slate-300">
          Worker:{' '}
          <span className="font-medium text-slate-100">{job.assignedWorker?.name ?? 'Unassigned'}</span>
        </p>
        <select
          value={job.assignedWorker?.id ?? ''}
          disabled={assigning}
          onChange={(event) => {
            const workerId = event.target.value;
            if (!workerId) return;
            void onAssign(job.id, workerId);
          }}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 outline-none transition focus:border-sky-400/70"
          aria-label={`Assign worker for ${job.customerName}`}
        >
          <option value="">Assign worker</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
