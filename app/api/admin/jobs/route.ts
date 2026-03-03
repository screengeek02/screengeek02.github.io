import { JobStatus, Prisma, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get('status') as JobStatus | 'ALL' | null;
  const dateFilter = request.nextUrl.searchParams.get('date');

  const where: Prisma.JobWhereInput = {};
  if (status && status !== 'ALL') where.status = status;

  const now = new Date();
  if (dateFilter === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.scheduledDate = { gte: start, lt: end };
  } else if (dateFilter === 'upcoming') {
    where.scheduledDate = { gte: now };
  } else if (dateFilter === 'past') {
    where.scheduledDate = { lt: now };
  }

  const jobs = await db.job.findMany({
    where,
    include: { assignedWorker: { select: { id: true, name: true } } },
    orderBy: { scheduledDate: 'asc' },
  });

  return NextResponse.json(jobs);
}
