import { JobStatus, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const AVAILABILITY_FILE = path.join(process.cwd(), 'data', 'worker-availability.json');

type WorkerAvailabilityRecord = {
  workerId: string;
  enabled: boolean;
  days: Array<{
    dayOfWeek: number;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  }>;
};

function formatSlot(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

async function readAvailability(): Promise<WorkerAvailabilityRecord[]> {
  try {
    const raw = await fs.readFile(AVAILABILITY_FILE, 'utf8');
    return JSON.parse(raw) as WorkerAvailabilityRecord[];
  } catch {
    return [];
  }
}

async function writeAvailability(records: WorkerAvailabilityRecord[]) {
  await fs.mkdir(path.dirname(AVAILABILITY_FILE), { recursive: true });
  await fs.writeFile(AVAILABILITY_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');

  if (dateParam) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
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

  const session = getSessionFromCookie();
  if (!session || session.role !== Role.WORKER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const records = await readAvailability();
  const existing = records.find((record) => record.workerId === session.userId);

  const fallback: WorkerAvailabilityRecord = {
    workerId: session.userId,
    enabled: true,
    days: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
      dayOfWeek,
      isAvailable: dayOfWeek >= 1 && dayOfWeek <= 5,
      startTime: '09:00',
      endTime: '17:00',
    })),
  };

  return NextResponse.json(existing ?? fallback);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.WORKER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<WorkerAvailabilityRecord>;
  const nextRecord: WorkerAvailabilityRecord = {
    workerId: session.userId,
    enabled: Boolean(payload.enabled),
    days: Array.isArray(payload.days)
      ? payload.days
          .map((day) => ({
            dayOfWeek: Number(day.dayOfWeek),
            isAvailable: Boolean(day.isAvailable),
            startTime: typeof day.startTime === 'string' ? day.startTime : '09:00',
            endTime: typeof day.endTime === 'string' ? day.endTime : '17:00',
          }))
          .filter((day) => day.dayOfWeek >= 0 && day.dayOfWeek <= 6)
      : [],
  };

  const records = await readAvailability();
  const remaining = records.filter((record) => record.workerId !== session.userId);
  remaining.push(nextRecord);
  await writeAvailability(remaining);

  return NextResponse.json({ success: true });
}
