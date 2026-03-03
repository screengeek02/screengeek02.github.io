'use client';

import { JobStatus } from '@prisma/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardKpiCard } from '@/components/dashboard-kpi-card';
import { DispatchMapMock } from '@/components/DispatchMapMock';
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

const activityItems = [
  { text: 'Antonio Martinez booking expired', time: '22 min ago', icon: '⏱' },
  { text: 'New villa cleaning request from Emily Johnson', time: '56 min ago', icon: '✦' },
  { text: 'Marisol Herrera job completed successfully', time: '1h ago', icon: '✓' },
];

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [status, setStatus] = useState('ALL');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [jobsRes, workerRes] = await Promise.all([
      fetch(`/api/admin/jobs?status=${status}&date=${date}`),
      fetch('/api/admin/workers'),
    ]);
    setJobs(await jobsRes.json());
    setWorkers(await workerRes.json());
    setLoading(false);
  }, [status, date]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const changeStatus = useCallback(
    async (jobId: string, nextStatus: JobStatus) => {
      await fetch(`/api/admin/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      void loadData();
    },
    [loadData],
  );

  const assign = useCallback(
    async (jobId: string, workerId: string) => {
      await fetch(`/api/admin/jobs/${jobId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });
      void loadData();
    },
    [loadData],
  );

  const stats = useMemo(() => {
    const today = new Date();
    const todaysJobs = jobs.filter((job) => {
      const d = new Date(job.scheduledDate);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
    const activeCleaners = new Set(
      jobs
        .filter((j) => j.status === JobStatus.ASSIGNED || j.status === JobStatus.IN_PROGRESS)
        .map((j) => j.assignedWorker?.id)
        .filter(Boolean),
    ).size;

    return {
      jobsToday: todaysJobs,
      activeCleaners,
      avgArrival: '32 min',
    };
  }, [jobs]);

  const upcomingJobs = useMemo(
    () =>
      jobs
        .filter((job) => job.status !== JobStatus.COMPLETED && job.status !== JobStatus.CANCELLED)
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 4),
    [jobs],
  );

  const cleanerAvailability = useMemo(() => {
    return workers.slice(0, 5).map((worker) => {
      const activeJob = jobs.find((job) => job.assignedWorker?.id === worker.id && job.status === JobStatus.IN_PROGRESS);
      const assignedJob = jobs.find((job) => job.assignedWorker?.id === worker.id && job.status === JobStatus.ASSIGNED);

      if (activeJob) return { ...worker, state: 'On Job' as const };
      if (assignedJob) return { ...worker, state: 'Assign' as const };
      return { ...worker, state: 'Available' as const };
    });
  }, [workers, jobs]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/60"
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
          className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/60"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        >
          <option value="">Any Date</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardKpiCard label="Jobs Today" value={stats.jobsToday} hint="15% vs yesterday" icon="🗂" tone="sky" />
        <DashboardKpiCard label="Active Cleaners" value={stats.activeCleaners} hint="Live on routes" icon="👥" tone="emerald" />
        <DashboardKpiCard label="Avg Arrival Time" value={stats.avgArrival} hint="-7% from yesterday" icon="⏱" tone="cyan" />
      </div>

      <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Live Dispatch in Punta Cana</h2>
        <p className="mt-1 text-sm text-slate-400">See how Helio assigns and routes professional cleaners in real time.</p>
        <div className="mt-4">
          <DispatchMapMock />
        </div>
        <div className="mt-4 grid gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300 md:grid-cols-3">
          <p>
            Completions today: <span className="font-semibold text-cyan-300">36</span>
          </p>
          <p>
            Cleaners on duty: <span className="font-semibold text-cyan-300">{stats.activeCleaners}</span>
          </p>
          <p>
            Arrival time: <span className="font-semibold text-cyan-300">32 min</span>
          </p>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
          <h3 className="text-2xl font-semibold text-white">Upcoming Jobs</h3>
          <div className="mt-3 space-y-3">
            {loading && <p className="text-sm text-slate-400">Loading jobs...</p>}
            {!loading && upcomingJobs.length === 0 && <p className="text-sm text-slate-400">No upcoming jobs.</p>}

            {upcomingJobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-100">{job.customerName}</p>
                      <p className="text-sm text-slate-400">{job.serviceType}</p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <select
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
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
                  <button
                    type="button"
                    onClick={() => changeStatus(job.id, JobStatus.CANCELLED)}
                    className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-2 py-1.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Cancel Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
          <h3 className="text-2xl font-semibold text-white">Cleaner Availability</h3>
          <div className="mt-3 space-y-3">
            {cleanerAvailability.map((worker) => (
              <div key={worker.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-700" />
                  <p className="font-medium text-slate-100">{worker.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      worker.state === 'Available'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : worker.state === 'On Job'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-sky-500/15 text-sky-300'
                    }`}
                  >
                    {worker.state}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-600 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-sky-200"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">Jobs Overview</h3>
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-1 text-xs">
            <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-200">Week</span>
            <span className="px-2 py-1 text-slate-400">Month</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
          <svg viewBox="0 0 500 180" className="h-52 w-full">
            <defs>
              <linearGradient id="helioLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <path d="M20 150 C 80 90, 120 120, 170 86 S 280 120, 330 92 S 430 42, 480 30" fill="none" stroke="url(#helioLine)" strokeWidth="4" className="helio-chart-line" />
            {[20, 90, 160, 230, 300, 370, 440].map((x) => (
              <line key={x} x1={x} y1={15} x2={x} y2={160} stroke="rgba(148,163,184,0.2)" strokeDasharray="3 6" />
            ))}
          </svg>
        </div>
      </article>

      <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">Recent Activity</h3>
          <button className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200">
            View All
          </button>
        </div>
        <div className="space-y-2">
          {activityItems.map((item) => (
            <div key={item.text} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 transition hover:border-sky-400/30">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-xs text-slate-300">
                  {item.icon}
                </span>
                <p className="text-sm text-slate-200">{item.text}</p>
              </div>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
