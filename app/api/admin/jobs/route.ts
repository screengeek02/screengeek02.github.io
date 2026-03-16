import { JobStatus, Prisma, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = request.nextUrl.searchParams.get('status') as JobStatus | 'ALL' | null;
    const dateFilter = request.nextUrl.searchParams.get('date');

    const where: Prisma.JobWhereInput = {};
    if (status && status !== 'ALL') where.status = status;

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const end = new Date(startOfToday);
      end.setDate(end.getDate() + 1);
      where.scheduledDate = { gte: startOfToday, lt: end };
    } else if (dateFilter === 'week') {
      const end = new Date(startOfToday);
      end.setDate(end.getDate() + 7);
      where.scheduledDate = { gte: startOfToday, lt: end };
    } else if (dateFilter === 'upcoming') {
      where.scheduledDate = { gte: startOfToday };
    } else if (dateFilter === 'past') {
      where.scheduledDate = { lt: startOfToday };
    }

    const jobs = await db.job.findMany({
      where,
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        address: true,
        serviceType: true,
        scheduledDate: true,
        status: true,
        assignedWorkerId: true,
        createdAt: true,
        updatedAt: true,
        assignedWorker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json(jobs ?? []);
  } catch (error) {
    console.error('Admin jobs fetch failed:', error);
    return NextResponse.json([]);
  }
}
