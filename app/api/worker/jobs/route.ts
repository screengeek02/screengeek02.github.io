import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.WORKER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await db.job.findMany({
    where: { assignedWorkerId: session.userId },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      address: true,
      serviceType: true,
      scheduledDate: true,
      status: true,
      cleanerPay: true,
      assignedWorkerId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { scheduledDate: 'asc' },
  });

  return NextResponse.json(jobs);
}
