import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = getSessionFromCookie();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const job = await db.job.findUnique({
    where: { id: params.id },
    include: {
      assignedWorker: { select: { id: true, name: true, email: true } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (session.role === Role.WORKER && job.assignedWorkerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(job);
}
