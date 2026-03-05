import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

type WorkerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export async function POST(_: Request, context: { params: { id: string } }) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const approvedStatus: WorkerStatus = 'APPROVED';

  await db.user.update({
    where: { id: context.params.id },
    data: { workerStatus: approvedStatus },
  });

  return NextResponse.json({ success: true });
}
