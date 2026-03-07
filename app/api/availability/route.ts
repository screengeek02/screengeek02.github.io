import { JobStatus, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

function formatSlot(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ slots: [] }, { status: 400 });
  }

  const dayStart = new Date(`${dateParam}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [workers, jobs] = await Promise.all([
    db.user.count({ where: { role: Role.WORKER } }),
    db.job.findMany({
      where: {
        scheduledDate: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: {
          not: JobStatus.CANCELLED,
        },
      },
      select: {
        scheduledDate: true,
      },
    }),
  ]);

  if (workers <= 0) {
    return NextResponse.json({ slots: [] });
  }

  const slotCounts = new Map<string, number>();
  jobs.forEach((job) => {
    const slot = formatSlot(job.scheduledDate);
    slotCounts.set(slot, (slotCounts.get(slot) ?? 0) + 1);
  });

  const slots = TIME_SLOTS.filter((slot) => (slotCounts.get(slot) ?? 0) < workers);

  return NextResponse.json({ slots });
}
