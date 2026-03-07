'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type Worker = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  experience?: string;
  status: ApprovalStatus;
  createdAt: string;
};

type ApiWorker = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  experience: string | null;
  workerStatus: ApprovalStatus | null;
  createdAt: string;
};

function statusTone(status: ApprovalStatus) {
  if (status === 'APPROVED') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (status === 'REJECTED') return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
}

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/admin/workers', { cache: 'no-store' });
    const json = (await response.json()) as ApiWorker[] | { error?: string };
    if (!response.ok) {
      setError((json as { error?: string }).error ?? 'Unable to load workers.');
      setLoading(false);
      return;
    }

    const mappedWorkers: Worker[] = (json as ApiWorker[]).map((worker) => ({
      id: worker.id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone ?? undefined,
      city: worker.city ?? undefined,
      experience: worker.experience ?? undefined,
      status: worker.workerStatus ?? 'PENDING',
      createdAt: worker.createdAt,
    }));

    setWorkers(mappedWorkers);
    setError('');
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadWorkers();
  }, [loadWorkers]);

  const updateStatus = useCallback(
    async (id: string, action: 'approve' | 'reject') => {
      const response = await fetch(`/api/admin/workers/${id}/${action}`, { method: 'POST' });
      if (response.ok) {
        void loadWorkers();
      }
    },
    [loadWorkers],
  );

  const pendingWorkers = useMemo(() => workers.filter((worker) => worker.status === 'PENDING'), [workers]);
  const approvedWorkers = useMemo(() => workers.filter((worker) => worker.status === 'APPROVED'), [workers]);
  const rejectedWorkers = useMemo(() => workers.filter((worker) => worker.status === 'REJECTED'), [workers]);

  const groups = [
    { title: 'Pending Workers', items: pendingWorkers },
    { title: 'Approved Workers', items: approvedWorkers },
    { title: 'Suspended Workers', items: rejectedWorkers },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5">
        <h2 className="text-2xl font-semibold text-white">Worker Approvals</h2>
        <p className="mt-1 text-sm text-slate-400">Approve or reject worker applications before dashboard access.</p>
      </div>

      {error && <p className="rounded-lg border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">{error}</p>}
      {loading && <p className="text-sm text-slate-400">Loading workers...</p>}

      <div className="grid gap-4 xl:grid-cols-3">
        {groups.map((group) => (
          <article key={group.title} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-300">{group.title}</h3>

            <div className="mt-3 space-y-3">
              {!loading && group.items.length === 0 && <p className="text-xs text-slate-500">No workers in this state.</p>}

              {group.items.map((worker) => {
                const status = worker.status;

                return (
                  <div key={worker.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-100">{worker.name}</p>
                        <p className="text-xs text-slate-300">{worker.email}</p>
                        <p className="text-xs text-slate-400">{worker.phone ?? 'No phone provided'}</p>
                        <p className="text-xs text-slate-500">{worker.city ?? 'City not set'}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${statusTone(status)}`}>{status}</span>
                    </div>

                    {worker.experience && <p className="mt-2 text-xs text-slate-400">Experience: {worker.experience}</p>}
                    <p className="mt-1 text-xs text-slate-500">Applied: {new Date(worker.createdAt).toLocaleString()}</p>

                    {status === 'PENDING' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void updateStatus(worker.id, 'approve');
                          }}
                          className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void updateStatus(worker.id, 'reject');
                          }}
                          className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
