import { JobStatus, Role } from '@prisma/client';
import { SessionUser } from './auth';

export function canTransitionStatus(current: JobStatus, next: JobStatus, actorRole: Role) {
  if (actorRole === Role.ADMIN) {
    if (next === JobStatus.CANCELLED) {
      return [JobStatus.PENDING, JobStatus.ASSIGNED, JobStatus.IN_PROGRESS].includes(current);
    }
    if (next === JobStatus.ASSIGNED) {
      return [JobStatus.PENDING, JobStatus.ASSIGNED].includes(current);
    }
    return false;
  }

  if (actorRole === Role.WORKER) {
    if (next === JobStatus.IN_PROGRESS) return current === JobStatus.ASSIGNED;
    if (next === JobStatus.COMPLETED) return current === JobStatus.IN_PROGRESS;
  }

  return false;
}

export function requireRole(user: SessionUser | null, allowedRole: Role) {
  return Boolean(user && user.role === allowedRole);
}
