'use client';

import { JobStatus } from '@prisma/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScheduleJobCard } from '@/components/ScheduleJobCard';

type FilterValue = 'today' | 'week' | 'upcoming';

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

type GroupedJobs = {
  label: string;
  jobs: Job[];
};

export function ScheduleBoard() {
  const [filter, setFilter] = useState<FilterValue>('today');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [jobsResponse, workersResponse] = await Promise.all([fetch('/api/admin/jobs'), fetch('/api/admin/workers')]);

      if (!jobsResponse.ok || !workersResponse.ok) {
        throw new Error('Unable to load schedule data.');
      }

      const [jobsJson, workersJson] = (await Promise.all([jobsResponse.json(), workersResponse.json()])) as [Job[], Worker[]];
      setJobs(jobsJson);
      setWorkers(workersJson);
    } catch {
      setError('Could not load scheduling data. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return jobs
      .filter((job) => {
        const scheduled = new Date(job.scheduledDate);
        if (filter === 'today') return scheduled >= startOfToday && scheduled < endOfToday;
        if (filter === 'week') return scheduled >= startOfToday && scheduled < endOfWeek;
        return scheduled >= startOfToday;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [filter, jobs]);

  const groupedJobs = useMemo<GroupedJobs[]>(() => {
    const groups = new Map<string, Job[]>();

    filteredJobs.forEach((job) => {
      const date = new Date(job.scheduledDate);
      const key = date.toISOString().split('T')[0];
      const bucket = groups.get(key) ?? [];
      bucket.push(job);
      groups.set(key, bucket);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([isoDate, grouped]) => ({
        label: new Date(isoDate).toLocaleDateString([], {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        jobs: grouped,
      }));
  }, [filteredJobs]);

  const handleAssign = useCallback(
    async (jobId: string, workerId: string) => {
      const nextWorker = workers.find((worker) => worker.id === workerId);
      if (!nextWorker) return;

      setAssigningId(jobId);
      setError('');

      const previousJobs = jobs;
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: JobStatus.ASSIGNED,
                assignedWorker: nextWorker,
              }
            : job,
        ),
      );

      try {
        const response = await fetch(`/api/admin/jobs/${jobId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workerId }),
        });

        if (!response.ok) {
          throw new Error('Unable to assign worker.');
        }
      } catch {
        setJobs(previousJobs);
        setError('Assignment failed. Please try again.');
      } finally {
        setAssigningId(null);
      }
    },
    [jobs, workers],
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Scheduling</h1>
          <p className="mt-1 text-sm text-slate-300">Organize and assign scheduled jobs by day.</p>
        </div>

        <label className="text-sm text-slate-200">
          <span className="mb-1 block">View</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterValue)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/70"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="upcoming">All Upcoming</option>
          </select>
        </label>
      </div>

      {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">Loading scheduling board...</div>
      ) : groupedJobs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">No scheduled jobs for this filter.</div>
      ) : (
        <div className="space-y-4">
          {groupedJobs.map((group) => (
            <section key={group.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-300">{group.label}</h2>
              <div className="mt-3 grid gap-3">
                {group.jobs.map((job) => (
                  <ScheduleJobCard key={job.id} job={job} workers={workers} assigning={assigningId === job.id} onAssign={handleAssign} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
