'use client';

import { JobStatus } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 });
  const [status, setStatus] = useState('ALL');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [jobsRes, workerRes, statsRes] = await Promise.all([
      fetch(`/api/admin/jobs?status=${status}&date=${date}`),
      fetch('/api/admin/workers'),
      fetch('/api/admin/stats'),
    ]);
    setJobs(await jobsRes.json());
    setWorkers(await workerRes.json());
    setStats(await statsRes.json());
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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Object.entries({
          'Total Jobs': stats.total,
          Pending: stats.pending,
          Assigned: stats.assigned,
          'In Progress': stats.inProgress,
          Completed: stats.completed,
        }).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-3 text-4xl font-semibold leading-none text-slate-800">{value}</p>
          </div>
        ))}
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
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-700">{new Date(job.scheduledDate).toLocaleString()}</td>
                  <td className="px-4 py-4 font-medium text-slate-800">{job.customerName}</td>
                  <td className="px-4 py-4 text-slate-600">{job.serviceType}</td>
                  <td className="px-4 py-4 text-slate-600">{job.address.slice(0, 30)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{job.assignedWorker?.name ?? 'Unassigned'}</td>
                  <td className="space-y-2 px-4 py-4">
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
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500"
                      onChange={(e) => e.target.value && changeStatus(job.id, e.target.value as JobStatus)}
                      defaultValue=""
                    >
                      <option value="">Update status</option>
                      <option value={JobStatus.ASSIGNED}>ASSIGNED</option>
                      <option value={JobStatus.CANCELLED}>CANCELLED</option>
                    </select>
                    <Link className="text-sm font-medium text-slate-700 hover:text-slate-900" href={`/admin/jobs/${job.id}`}>
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
