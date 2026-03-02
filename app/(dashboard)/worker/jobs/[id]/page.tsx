'use client';

import { JobStatus } from '@prisma/client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';

type Job = {
  id: string;
  scheduledDate: string;
  customerName: string;
  customerPhone: string;
  address: string;
  serviceType: string;
  status: JobStatus;
  notes: { id: string; content: string }[];
};

export default function WorkerJobDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);

  async function load() {
    const response = await fetch(`/api/jobs/${id}`);
    if (response.ok) setJob(await response.json());
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function start() {
    await fetch(`/api/worker/jobs/${id}/start`, { method: 'POST' });
    void load();
  }

  async function complete() {
    await fetch(`/api/worker/jobs/${id}/complete`, { method: 'POST' });
    void load();
  }

  if (!job) return <p>Loading...</p>;

  return (
    <section className="space-y-3 rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold">Worker Job Detail</h1>
      <p><strong>Customer:</strong> {job.customerName}</p>
      <p><strong>Phone:</strong> {job.customerPhone}</p>
      <p><strong>Address:</strong> {job.address}</p>
      <p><strong>Service:</strong> {job.serviceType}</p>
      <p><strong>Scheduled:</strong> {new Date(job.scheduledDate).toLocaleString()}</p>
      <p><strong>Status:</strong> <StatusBadge status={job.status} /></p>
      <div className="flex gap-2">
        <button disabled={job.status !== JobStatus.ASSIGNED} onClick={start} className="rounded bg-blue-600 px-3 py-1 text-white disabled:bg-slate-300">Start Job</button>
        <button disabled={job.status !== JobStatus.IN_PROGRESS} onClick={complete} className="rounded bg-green-600 px-3 py-1 text-white disabled:bg-slate-300">Complete Job</button>
      </div>
    </section>
  );
}
