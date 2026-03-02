'use client';

import { JobStatus } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';

type Job = {
  id: string;
  scheduledDate: string;
  customerName: string;
  serviceType: string;
  address: string;
  status: JobStatus;
  assignedWorker?: { id: string; name: string } | null;
};

type Worker = { id: string; name: string };

const dispatchColumns: Array<{ title: string; status: JobStatus }> = [
  { title: 'Pending', status: JobStatus.PENDING },
  { title: 'Assigned', status: JobStatus.ASSIGNED },
  { title: 'In Progress', status: JobStatus.IN_PROGRESS },
  { title: 'Completed', status: JobStatus.COMPLETED },
];

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [status, setStatus] = useState('ALL');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [jobsRes, workerRes] = await Promise.all([
      fetch(`/api/admin/jobs?status=${status}&date=${date}`),
      fetch('/api/admin/workers'),
    ]);
    setJobs(await jobsRes.json());
    setWorkers(await workerRes.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, [status, date]);

  async function assign(jobId: string, workerId: string) {
    await fetch(`/api/admin/jobs/${jobId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId }),
    });
    void loadData();
  }

  async function changeStatus(jobId: string, nextStatus: JobStatus) {
    await fetch(`/api/admin/jobs/${jobId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    void loadData();
  }

  const groupedJobs = useMemo(() => {
    return dispatchColumns.map((column) => ({
      ...column,
      jobs: jobs.filter((job) => job.status === column.status),
    }));
  }, [jobs]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dispatch Board</h1>
        <p className="text-sm text-slate-500">Live view of cleaning jobs across Punta Cana and Bavaro.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">ALL</option>
          {Object.values(JobStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        >
          <option value="">Any Date</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading dispatch board...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {groupedJobs.map((column) => (
            <article key={column.status} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{column.title}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{column.jobs.length}</span>
              </header>

              <div className="space-y-3 p-3">
                {column.jobs.length === 0 && <p className="text-sm text-slate-400">No jobs in this lane.</p>}

                {column.jobs.map((job) => (
                  <div key={job.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm transition hover:bg-white">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800">{job.customerName}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-slate-600">{job.serviceType}</p>
                    <p className="text-sm text-slate-500">{new Date(job.scheduledDate).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">{job.assignedWorker?.name ?? 'Unassigned'}</p>

                    <div className="mt-3 space-y-2">
                      {job.status !== JobStatus.COMPLETED && (
                        <select
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500"
                          onChange={(e) => e.target.value && assign(job.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="">Assign worker</option>
                          {workers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                              {worker.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {(job.status === JobStatus.PENDING || job.status === JobStatus.ASSIGNED || job.status === JobStatus.IN_PROGRESS) && (
                        <button
                          onClick={() => changeStatus(job.id, JobStatus.CANCELLED)}
                          className="w-full rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          Cancel Job
                        </button>
                      )}

                      <Link className="inline-block text-sm font-medium text-slate-700 hover:text-slate-900" href={`/admin/jobs/${job.id}`}>
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
