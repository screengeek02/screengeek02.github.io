import { JobStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

type DispatchWorker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type ActiveJob = {
  id: string;
  latitude: number;
  longitude: number;
};

const BASE_LAT = 18.5601;
const BASE_LNG = -68.3725;

function hashToInt(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateCoordinate(seedValue: string): { latitude: number; longitude: number } {
  const seed = hashToInt(seedValue);
  const latOffset = ((seed % 1000) / 1000 - 0.5) * 0.18;
  const lngOffset = ((((seed / 1000) | 0) % 1000) / 1000 - 0.5) * 0.24;

  return {
    latitude: Number((BASE_LAT + latOffset).toFixed(6)),
    longitude: Number((BASE_LNG + lngOffset).toFixed(6)),
  };
}

export async function GET() {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [workers, activeJobs] = await Promise.all([
    db.user.findMany({ where: { role: Role.WORKER }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    db.job.findMany({
      where: { status: { in: [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS] } },
      select: { id: true, address: true },
      orderBy: { updatedAt: 'desc' },
      take: 12,
    }),
  ]);

  const workerPayload: DispatchWorker[] = workers.map((worker) => {
    const coord = generateCoordinate(worker.id);
    return {
      id: worker.id,
      name: worker.name,
      latitude: coord.latitude,
      longitude: coord.longitude,
    };
  });

  const jobPayload: ActiveJob[] = activeJobs.map((job) => {
    const coord = generateCoordinate(`${job.id}-${job.address}`);
    return {
      id: job.id,
      latitude: coord.latitude,
      longitude: coord.longitude,
    };
  });

  return NextResponse.json({ workers: workerPayload, activeJobs: jobPayload });
}
