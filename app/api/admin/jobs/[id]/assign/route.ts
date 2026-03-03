import { JobStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import { assignWorkerSchema } from '@/lib/validations';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = assignWorkerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid worker selection.' }, { status: 400 });

  const worker = await db.user.findFirst({ where: { id: parsed.data.workerId, role: Role.WORKER } });
  if (!worker) return NextResponse.json({ error: 'Worker not found.' }, { status: 404 });

  const job = await db.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
    return NextResponse.json({ error: 'Cannot assign completed or cancelled jobs.' }, { status: 400 });
  }

  const updated = await db.job.update({
    where: { id: params.id },
    data: { assignedWorkerId: worker.id, status: JobStatus.ASSIGNED },
  });

  return NextResponse.json(updated);
}
