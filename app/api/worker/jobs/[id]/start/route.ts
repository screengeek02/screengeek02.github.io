import { JobStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import { canTransitionStatus } from '@/lib/permissions';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.WORKER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await db.job.findUnique({ where: { id: params.id } });
  if (!job || job.assignedWorkerId !== session.userId) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });

  if (!canTransitionStatus(job.status, JobStatus.IN_PROGRESS, session.role)) {
    return NextResponse.json({ error: 'You can only start ASSIGNED jobs.' }, { status: 400 });
  }

  const updated = await db.job.update({ where: { id: params.id }, data: { status: JobStatus.IN_PROGRESS } });
  return NextResponse.json(updated);
}
