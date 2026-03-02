import { JobStatus } from '@prisma/client';

const styles: Record<JobStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>{status.replace('_', ' ')}</span>;
}
