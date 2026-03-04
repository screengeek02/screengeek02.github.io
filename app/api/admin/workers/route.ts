import { Role, WorkerStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as WorkerStatus | null;

  const workers = await db.user.findMany({
    where: {
      role: Role.WORKER,
      ...(status ? { workerStatus: status } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      experience: true,
      workerStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(workers);
}
