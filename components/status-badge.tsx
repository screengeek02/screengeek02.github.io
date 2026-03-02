import { JobStatus } from '@prisma/client';

const colors: Record<JobStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
