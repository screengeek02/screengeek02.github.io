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

  if (session.role === Role.WORKER) {
    return NextResponse.json({
      id: job.id,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      customerEmail: job.customerEmail,
      address: job.address,
      serviceType: job.serviceType,
      scheduledDate: job.scheduledDate,
      status: job.status,
      cleanerPay: job.cleanerPay,
      assignedWorkerId: job.assignedWorkerId,
      assignedWorker: job.assignedWorker,
      notes: job.notes,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  }

  return NextResponse.json(job);
}
