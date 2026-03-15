import { JobStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [total, pending, assigned, inProgress, completed, totals] = await Promise.all([
      db.job.count(),
      db.job.count({ where: { status: JobStatus.PENDING } }),
      db.job.count({ where: { status: JobStatus.ASSIGNED } }),
      db.job.count({ where: { status: JobStatus.IN_PROGRESS } }),
      db.job.count({ where: { status: JobStatus.COMPLETED } }),
      db.job.aggregate({
        _sum: {
          platformFee: true,
          cleanerPay: true,
          customerPrice: true,
        },
      }),
    ]);

    return NextResponse.json({
      total,
      pending,
      assigned,
      inProgress,
      completed,
      totalPlatformRevenue: totals._sum.platformFee ?? 0,
      totalCleanerPayouts: totals._sum.cleanerPay ?? 0,
      totalCustomerPayments: totals._sum.customerPrice ?? 0,
    });
  } catch (error) {
    console.error('Admin stats fetch failed:', error);
    return NextResponse.json({
      total: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      totalPlatformRevenue: 0,
      totalCleanerPayouts: 0,
      totalCustomerPayments: 0,
    });
  }
}
