'use client';

import { JobStatus } from '@prisma/client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AvailabilityToggle } from '@/components/availability-toggle';
import { AvatarSpot } from '@/components/avatar-spot';
import { WorkerLocationTracker } from '@/components/WorkerLocationTracker';
import { StatusBadge } from '@/components/status-badge';

type Job = {
  id: string;
  scheduledDate: string;
  customerName: string;
  address: string;
  serviceType: string;
  status: JobStatus;
};

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/worker/jobs');
    setJobs(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const startJob = useCallback(
    async (id: string) => {
      await fetch(`/api/worker/jobs/${id}/start`, { method: 'POST' });
      void loadJobs();
    },
    [loadJobs],
  );

  const completeJob = useCallback(
    async (id: string) => {
      await fetch(`/api/worker/jobs/${id}/complete`, { method: 'POST' });
      void loadJobs();
    },
    [loadJobs],
  );

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [jobs]);

  const currentJob = sortedJobs.find((job) => job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.ASSIGNED) ?? null;
  const upcomingJobs = sortedJobs.filter((job) => job.id !== currentJob?.id);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Worker Dispatch</h2>
          <p className="text-sm text-slate-400">Driver-style job flow for your next cleaning routes.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" /> Live
          </span>
          <AvailabilityToggle online={online} onToggle={() => setOnline((prev) => !prev)} />
        </div>
      </div>

      <WorkerLocationTracker />

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Today&apos;s Jobs</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">{jobs.length}</p>
        </article>
        <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Status</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{online ? 'Online' : 'Offline'}</p>
        </article>
        <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Earnings (Preview)</p>
          <p className="mt-2 text-3xl font-semibold text-sky-300">$0.00</p>
        </article>
      </div>

      {loading && <p className="text-slate-400">Loading jobs...</p>}

      {!loading && currentJob && (
        <article className="rounded-2xl border border-sky-400/25 bg-slate-900/75 p-5 shadow-[0_0_24px_rgba(56,189,248,0.14)]">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Job</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-white">{currentJob.customerName}</h3>
              <p className="text-sm text-slate-300">{currentJob.serviceType}</p>
              <p className="text-sm text-slate-400">{currentJob.address}</p>
              <p className="mt-1 text-sm text-slate-400">{new Date(currentJob.scheduledDate).toLocaleString()}</p>
            </div>
            <StatusBadge status={currentJob.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={currentJob.status !== JobStatus.ASSIGNED}
              onClick={() => startJob(currentJob.id)}
              className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
            >
              Start Job
            </button>
            <button
              disabled={currentJob.status !== JobStatus.IN_PROGRESS}
              onClick={() => completeJob(currentJob.id)}
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
            >
              Complete Job
            </button>
            <Link
              href={`/worker/jobs/${currentJob.id}`}
              className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-sky-400/50 hover:text-sky-200"
            >
              Open Details
            </Link>
          </div>
        </article>
      )}

      {!loading && !currentJob && (
        <p className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 text-sm text-slate-400">No active job right now.</p>
      )}

      <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
        <h3 className="text-xl font-semibold text-white">Upcoming Jobs</h3>
        {upcomingJobs.length === 0 && <p className="mt-3 text-sm text-slate-400">No upcoming jobs yet.</p>}

        <div className="mt-3 space-y-3">
          {upcomingJobs.map((job) => (
            <div key={job.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <AvatarSpot name={job.customerName} />
                  <div>
                    <h4 className="font-semibold text-slate-100">{job.customerName}</h4>
                  <p className="text-sm text-slate-300">{job.serviceType}</p>
                  <p className="text-sm text-slate-400">{job.address}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(job.scheduledDate).toLocaleString()}</p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={job.status !== JobStatus.ASSIGNED}
                  onClick={() => startJob(job.id)}
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
                >
                  Start
                </button>
                <button
                  disabled={job.status !== JobStatus.IN_PROGRESS}
                  onClick={() => completeJob(job.id)}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
                >
                  Complete
                </button>
                <Link
                  href={`/worker/jobs/${job.id}`}
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400/50 hover:text-sky-200"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
