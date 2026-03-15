import { Role, WorkerStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const workers = await db.user.findMany({
      where: {
        role: Role.WORKER,
        workerStatus: WorkerStatus.APPROVED,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(workers ?? []);
  } catch (error) {
    console.error('Admin workers fetch failed:', error);
    return NextResponse.json([]);
  }
}
