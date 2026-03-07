'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { DispatchMapJob, DispatchMapWorker } from '@/components/DispatchMap';

type Props = {
  jobs: DispatchMapJob[];
  workers: DispatchMapWorker[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onAssignWorker: (jobId: string, workerId: string) => Promise<void>;
};

function bucketTitle(status: DispatchMapJob['status']) {
  if (status === 'PENDING') return 'Pending Jobs';
  if (status === 'ASSIGNED') return 'Assigned';
  return 'In Progress';
}

export function DispatchQueue({ jobs, workers, selectedJobId, onSelectJob, onAssignWorker }: Props) {
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);

  const availableWorkers = useMemo(() => workers.filter((w) => w.status === 'AVAILABLE'), [workers]);

  const grouped = useMemo(
    () => ({
      PENDING: jobs.filter((job) => job.status === 'PENDING'),
      ASSIGNED: jobs.filter((job) => job.status === 'ASSIGNED'),
      IN_PROGRESS: jobs.filter((job) => job.status === 'IN_PROGRESS'),
    }),
    [jobs],
  );

  const resolveWorkerName = (workerId: string | null) => workers.find((worker) => worker.id === workerId)?.name ?? 'Unassigned';

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-semibold text-white">Dispatch Queue</h2>
      <div className="grid gap-3">
        {(['PENDING', 'ASSIGNED', 'IN_PROGRESS'] as const).map((status) => (
          <section key={status} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <h3 className="text-sm font-semibold text-sky-300">{bucketTitle(status)}</h3>
            <div className="mt-2 space-y-2">
              {grouped[status].length === 0 && <p className="text-xs text-slate-500">No jobs in this lane.</p>}
              {grouped[status].map((job) => (
                <article
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectJob(job.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') onSelectJob(job.id);
                  }}
                  className={clsx(
                    'rounded-lg border p-3 transition',
                    selectedJobId === job.id
                      ? 'border-sky-500 bg-sky-900/20'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700',
                  )}
                >
                  <p className="text-sm font-semibold text-white">{job.customerName}</p>
                  <p className="mt-1 text-xs text-slate-300">{job.address}</p>
                  <p className="mt-1 text-xs text-slate-400">{job.serviceType}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(job.scheduledDate).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-slate-400">Worker: {resolveWorkerName(job.assignedWorkerId)}</p>

                  {status === 'PENDING' && (
                    <div className="mt-2">
                      <label className="sr-only" htmlFor={`assign-${job.id}`}>
                        Assign worker
                      </label>
                      <select
                        id={`assign-${job.id}`}
                        defaultValue=""
                        disabled={assigningJobId === job.id}
                        onClick={(event) => event.stopPropagation()}
                        onChange={async (event) => {
                          const workerId = event.target.value;
                          if (!workerId) return;
                          setAssigningJobId(job.id);
                          try {
                            await onAssignWorker(job.id, workerId);
                          } finally {
                            setAssigningJobId(null);
                            event.target.value = '';
                          }
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-500"
                      >
                        <option value="">Assign worker…</option>
                        {availableWorkers.map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
