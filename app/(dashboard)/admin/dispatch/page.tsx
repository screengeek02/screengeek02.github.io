'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CleanerFleetPanel } from '@/components/CleanerFleetPanel';
import { DispatchMap, type DispatchMapJob, type DispatchMapWorker } from '@/components/DispatchMap';
import { DispatchQueue } from '@/components/DispatchQueue';
import type { DispatchJob, DispatchJobStatus, DispatchWorker } from '@/lib/dispatch';

type LiveDispatchResponse = {
  workers: DispatchWorker[];
  jobs: DispatchJob[];
};

const BASE_LAT = 18.5601;
const BASE_LNG = -68.3725;

function hashToInt(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function fallbackCoordinate(seed: string) {
  const hash = hashToInt(seed);
  const latOffset = ((hash % 1000) / 1000 - 0.5) * 0.12;
  const lngOffset = ((((hash / 1000) | 0) % 1000) / 1000 - 0.5) * 0.12;

  return {
    latitude: Number((BASE_LAT + latOffset).toFixed(6)),
    longitude: Number((BASE_LNG + lngOffset).toFixed(6)),
  };
}


function mapStatusToJobState(status: DispatchJobStatus): DispatchMapJob['status'] {
  if (status === 'PENDING') return 'PENDING';
  if (status === 'ASSIGNED') return 'ASSIGNED';
  if (status === 'IN_PROGRESS') return 'IN_PROGRESS';
  return 'PENDING';
}

function resolveWorkerStatus(worker: DispatchWorker, jobs: DispatchJob[]): DispatchMapWorker['status'] {
  const workerJobs = jobs.filter((job) => job.assignedWorkerId === worker.id);

  if (workerJobs.some((job) => job.status === 'IN_PROGRESS')) return 'WORKING';
  if (workerJobs.some((job) => job.status === 'ASSIGNED')) return 'ASSIGNED';
  return 'AVAILABLE';
}

export default function AdminDispatchPage() {
  const [workers, setWorkers] = useState<DispatchWorker[]>([]);
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDispatch = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/live-dispatch', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load live dispatch feed.');

      const payload = (await response.json()) as LiveDispatchResponse;
      setWorkers(payload.workers);
      setJobs(payload.jobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load live dispatch feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDispatch();
    const timer = window.setInterval(() => {
      void fetchDispatch();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [fetchDispatch]);

  const mappedWorkers = useMemo<DispatchMapWorker[]>(() => {
    return workers.map((worker) => {
      const fallback = fallbackCoordinate(worker.id);
      return {
        id: worker.id,
        name: worker.name,
        assignedJobsCount: worker.assignedJobsCount,
        status: resolveWorkerStatus(worker, jobs),
        latitude: worker.lastLatitude ?? fallback.latitude,
        longitude: worker.lastLongitude ?? fallback.longitude,
      };
    });
  }, [jobs, workers]);

  const mappedJobs = useMemo<DispatchMapJob[]>(() => {
    return jobs.map((job) => ({
      id: job.id,
      customerName: job.customerName,
      address: job.address,
      serviceType: job.serviceType,
      scheduledDate: job.scheduledDate,
      assignedWorkerId: job.assignedWorkerId,
      status: mapStatusToJobState(job.status),
      latitude: job.latitude,
      longitude: job.longitude,
    }));
  }, [jobs]);

  const assignWorker = useCallback(
    async (jobId: string, workerId: string) => {
      const response = await fetch(`/api/admin/jobs/${jobId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });

      if (!response.ok) {
        throw new Error('Unable to assign worker.');
      }

      await fetchDispatch();
    },
    [fetchDispatch],
  );

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Dispatch Control Center</h2>
        <p className="mt-1 text-sm text-slate-400">Real-time Uber-style operations for cleaner assignment and live job orchestration.</p>
      </div>

      {error && <p className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_380px]">
        <CleanerFleetPanel workers={mappedWorkers} />

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="rounded-full border border-sky-500/35 bg-sky-900/25 px-3 py-1 text-sky-200">Punta Cana • Live Map</span>
            <span className="text-slate-400">Refresh every 5s</span>
          </div>
          <DispatchMap workers={mappedWorkers} jobs={mappedJobs} selectedJobId={selectedJobId} onSelectJob={setSelectedJobId} />
        </div>

        <DispatchQueue
          jobs={mappedJobs}
          workers={mappedWorkers}
          selectedJobId={selectedJobId}
          onSelectJob={setSelectedJobId}
          onAssignWorker={assignWorker}
        />
      </div>

      {loading && <p className="text-sm text-slate-400">Loading live dispatch feed...</p>}
    </section>
  );
}
