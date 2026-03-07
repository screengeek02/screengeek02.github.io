import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.CUSTOMER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await db.job.findMany({
    where: { customerEmail: session.email },
    select: {
      id: true,
      customerName: true,
      address: true,
      serviceType: true,
      status: true,
      scheduledDate: true,
      assignedWorker: { select: { name: true } },
    },
    orderBy: { scheduledDate: 'desc' },
  });

  return NextResponse.json(jobs);
}
