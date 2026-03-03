import { JobStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [total, pending, assigned, inProgress, completed] = await Promise.all([
    db.job.count(),
    db.job.count({ where: { status: JobStatus.PENDING } }),
    db.job.count({ where: { status: JobStatus.ASSIGNED } }),
    db.job.count({ where: { status: JobStatus.IN_PROGRESS } }),
    db.job.count({ where: { status: JobStatus.COMPLETED } }),
  ]);

  return NextResponse.json({ total, pending, assigned, inProgress, completed });
}
