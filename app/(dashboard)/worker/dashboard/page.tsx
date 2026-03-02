'use client';

import { JobStatus } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AvailabilityToggle } from '@/components/availability-toggle';
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

  async function loadJobs() {
    setLoading(true);
    const response = await fetch('/api/worker/jobs');
    setJobs(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  async function startJob(id: string) {
    await fetch(`/api/worker/jobs/${id}/start`, { method: 'POST' });
    void loadJobs();
  }

  async function completeJob(id: string) {
    await fetch(`/api/worker/jobs/${id}/complete`, { method: 'POST' });
    void loadJobs();
  }

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [jobs]);

  const currentJob = sortedJobs.find((job) => job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.ASSIGNED) ?? null;
  const upcomingJobs = sortedJobs.filter((job) => job.id !== currentJob?.id);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Worker Dispatch</h1>
          <p className="text-sm text-slate-500">Manage your current and upcoming cleaning routes.</p>
        </div>
        <AvailabilityToggle online={online} onToggle={() => setOnline((prev) => !prev)} />
      </div>

      {loading && <p className="text-slate-500">Loading jobs...</p>}

      {!loading && currentJob && (
        <article className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Job</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{currentJob.customerName}</h2>
              <p className="text-sm text-slate-600">{currentJob.serviceType}</p>
              <p className="text-sm text-slate-500">{currentJob.address}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(currentJob.scheduledDate).toLocaleString()}</p>
            </div>
            <StatusBadge status={currentJob.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={currentJob.status !== JobStatus.ASSIGNED}
              onClick={() => startJob(currentJob.id)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Start Job
            </button>
            <button
              disabled={currentJob.status !== JobStatus.IN_PROGRESS}
              onClick={() => completeJob(currentJob.id)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Complete Job
            </button>
            <Link href={`/worker/jobs/${currentJob.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Open Details
            </Link>
          </div>
        </article>
      )}

      {!loading && !currentJob && <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">No active job right now.</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Upcoming Jobs</h2>
        {upcomingJobs.length === 0 && <p className="text-sm text-slate-500">No upcoming jobs yet.</p>}

        <div className="space-y-3">
          {upcomingJobs.map((job) => (
            <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{job.customerName}</h3>
                  <p className="text-sm text-slate-600">{job.serviceType}</p>
                  <p className="text-sm text-slate-500">{job.address}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(job.scheduledDate).toLocaleString()}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={job.status !== JobStatus.ASSIGNED}
                  onClick={() => startJob(job.id)}
                  className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Start
                </button>
                <button
                  disabled={job.status !== JobStatus.IN_PROGRESS}
                  onClick={() => completeJob(job.id)}
                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Complete
                </button>
                <Link href={`/worker/jobs/${job.id}`} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
