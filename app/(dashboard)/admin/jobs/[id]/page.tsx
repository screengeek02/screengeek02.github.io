'use client';

import { JobStatus } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';

type Job = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  serviceType: string;
  scheduledDate: string;
  status: JobStatus;
  assignedWorker?: { id: string; name: string; email: string } | null;
  notes: { id: string; content: string; createdAt: string }[];
};

export default function AdminJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  async function loadJob() {
    const response = await fetch(`/api/jobs/${params.id}`);
    if (!response.ok) {
      setError('Unable to load job.');
      return;
    }
    setJob(await response.json());
  }

  useEffect(() => {
    void loadJob();
  }, [params.id]);

  async function updateStatus(status: JobStatus) {
    await fetch(`/api/admin/jobs/${params.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadJob();
    router.refresh();
  }

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!job) return <p>Loading...</p>;

  return (
    <section className="space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold">Job Details</h1>
      <p><strong>Customer:</strong> {job.customerName}</p>
      <p><strong>Phone:</strong> {job.customerPhone}</p>
      <p><strong>Email:</strong> {job.customerEmail || 'N/A'}</p>
      <p><strong>Address:</strong> {job.address}</p>
      <p><strong>Service:</strong> {job.serviceType}</p>
      <p><strong>Scheduled:</strong> {new Date(job.scheduledDate).toLocaleString()}</p>
      <p><strong>Status:</strong> <StatusBadge status={job.status} /></p>
      <p><strong>Assigned worker:</strong> {job.assignedWorker?.name || 'Unassigned'}</p>

      <div>
        <p className="mb-1 font-medium">Admin Actions</p>
        <div className="flex gap-2">
          <button className="rounded bg-blue-600 px-3 py-1.5 text-white" onClick={() => updateStatus(JobStatus.ASSIGNED)}>Mark Assigned</button>
          <button className="rounded bg-rose-600 px-3 py-1.5 text-white" onClick={() => updateStatus(JobStatus.CANCELLED)}>Cancel Job</button>
        </div>
      </div>

      <div>
        <h2 className="font-medium">Notes</h2>
        <ul className="mt-2 space-y-2">
          {job.notes.length === 0 && <li className="text-sm text-slate-500">No notes yet.</li>}
          {job.notes.map((note) => (
            <li key={note.id} className="rounded bg-slate-50 p-2 text-sm">{note.content}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
