'use client';

import type { DispatchJob, DispatchSuggestion } from '@/lib/dispatch';

type SectionStatus = DispatchJob['status'];

const sectionConfig: Array<{ title: string; status: SectionStatus }> = [
  { title: 'Pending Jobs', status: 'PENDING' },
  { title: 'Assigned Jobs', status: 'ASSIGNED' },
  { title: 'In Progress Jobs', status: 'IN_PROGRESS' },
];

export function DispatchPanel({
  jobs,
  suggestions,
  assigningJobId,
  onAssign,
}: {
  jobs: DispatchJob[];
  suggestions: Record<string, DispatchSuggestion | null>;
  assigningJobId: string | null;
  onAssign: (jobId: string, workerId: string) => Promise<void>;
}) {
  return (
    <aside className="w-full space-y-4 rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 lg:w-[360px]">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-300">Dispatch Control Center</h3>

      {sectionConfig.map((section) => {
        const sectionJobs = jobs.filter((job) => job.status === section.status);

        return (
          <section key={section.status} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">{section.title}</h4>

            {sectionJobs.length === 0 ? (
              <p className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">No jobs in this queue.</p>
            ) : (
              <div className="space-y-2">
                {sectionJobs.map((job) => {
                  const suggestion = suggestions[job.id];
                  const timeLabel = new Date(job.scheduledDate).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <article key={job.id} className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-3 text-xs text-slate-300">
                      <p className="font-semibold text-slate-100">{job.address}</p>
                      <p className="mt-1">{job.serviceType.replace('_', ' ')} · {timeLabel}</p>
                      <p className="mt-1 text-slate-400">Customer: {job.customerName}</p>

                      {suggestion ? (
                        <>
                          <p className="mt-2 text-sky-300">Closest Worker: {suggestion.worker.name}</p>
                          <p className="text-slate-400">Distance: {suggestion.distanceKm} km</p>
                          <button
                            type="button"
                            disabled={assigningJobId === job.id}
                            onClick={() => {
                              void onAssign(job.id, suggestion.worker.id);
                            }}
                            className="mt-2 rounded-lg border border-sky-400/40 bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {assigningJobId === job.id ? 'Assigning…' : 'Assign'}
                          </button>
                        </>
                      ) : (
                        <p className="mt-2 text-amber-300">No available worker suggestion.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </aside>
  );
}
