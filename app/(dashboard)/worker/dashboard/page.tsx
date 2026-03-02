'use client';

import { JobStatus } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">My Assigned Jobs</h1>
      {loading && <p>Loading...</p>}
      {!loading && jobs.length === 0 && <p>No assigned jobs yet.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.id} className="rounded bg-white p-4 shadow">
            <p className="text-sm text-slate-500">{new Date(job.scheduledDate).toLocaleString()}</p>
            <h2 className="font-semibold">{job.customerName}</h2>
            <p className="text-sm">{job.address}</p>
            <p className="text-sm">{job.serviceType}</p>
            <div className="mt-2"><StatusBadge status={job.status} /></div>
            <div className="mt-3 flex gap-2">
              <button disabled={job.status !== JobStatus.ASSIGNED} onClick={() => startJob(job.id)} className="rounded bg-blue-600 px-3 py-1 text-white disabled:bg-slate-300">Start Job</button>
              <button disabled={job.status !== JobStatus.IN_PROGRESS} onClick={() => completeJob(job.id)} className="rounded bg-green-600 px-3 py-1 text-white disabled:bg-slate-300">Complete Job</button>
              <Link href={`/worker/jobs/${job.id}`} className="rounded border px-3 py-1">Details</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
