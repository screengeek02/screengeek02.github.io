import { JobStatus, Role, WorkerStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import type { DispatchJob, DispatchWorker } from '@/lib/dispatch';

const BASE_LAT = 18.5601;
const BASE_LNG = -68.3725;
const OFFLINE_THRESHOLD_MS = 60_000;

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

  try {
    const [workers, jobs] = await Promise.all([
      db.user.findMany({
        where: { role: Role.WORKER, workerStatus: WorkerStatus.APPROVED },
        select: {
          id: true,
          name: true,
          lastLatitude: true,
          lastLongitude: true,
          lastUpdated: true,
        },
        orderBy: { name: 'asc' },
      }),
      db.job.findMany({
        where: {
          status: {
            in: [JobStatus.PENDING, JobStatus.ASSIGNED, JobStatus.IN_PROGRESS],
          },
        },
        select: {
          id: true,
          address: true,
          customerName: true,
          serviceType: true,
          scheduledDate: true,
          status: true,
          assignedWorkerId: true,
          assignedWorker: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
        take: 50,
      }),
    ]);

    const assignedJobs = new Map<string, number>();
    const inProgressJobs = new Map<string, number>();

    jobs.forEach((job) => {
      if (!job.assignedWorkerId) return;

      if (job.status === JobStatus.ASSIGNED) {
        assignedJobs.set(job.assignedWorkerId, (assignedJobs.get(job.assignedWorkerId) ?? 0) + 1);
      }

      if (job.status === JobStatus.IN_PROGRESS) {
        inProgressJobs.set(job.assignedWorkerId, (inProgressJobs.get(job.assignedWorkerId) ?? 0) + 1);
      }
    });

    const now = Date.now();

    const workerPayload: DispatchWorker[] = workers.map((worker) => {
      const assignedCount = assignedJobs.get(worker.id) ?? 0;
      const inProgressCount = inProgressJobs.get(worker.id) ?? 0;
      const lastUpdatedMs = worker.lastUpdated ? new Date(worker.lastUpdated).getTime() : 0;
      const isOffline = !lastUpdatedMs || now - lastUpdatedMs > OFFLINE_THRESHOLD_MS;

      const status = isOffline ? 'OFFLINE' : assignedCount > 0 ? 'TRAVELING' : inProgressCount > 0 ? 'ASSIGNED' : 'AVAILABLE';

      return {
        id: worker.id,
        name: worker.name,
        lastLatitude: worker.lastLatitude,
        lastLongitude: worker.lastLongitude,
        lastUpdated: worker.lastUpdated ? worker.lastUpdated.toISOString() : null,
        status,
        assignedJobsCount: assignedCount + inProgressCount,
      };
    });

    const jobPayload: DispatchJob[] = jobs.map((job) => {
      const coord = generateCoordinate(`${job.id}-${job.address}`);
      return {
        id: job.id,
        latitude: coord.latitude,
        longitude: coord.longitude,
        status: job.status,
        serviceType: job.serviceType,
        scheduledDate: job.scheduledDate.toISOString(),
        address: job.address,
        customerName: job.customerName,
        assignedWorkerId: job.assignedWorkerId,
        assignedWorkerName: job.assignedWorker?.name ?? null,
      };
    });

    return NextResponse.json({ workers: workerPayload, jobs: jobPayload });
  } catch (error) {
    console.error('Live dispatch fetch failed:', error);
    return NextResponse.json({ error: 'Unable to load live dispatch data.' }, { status: 500 });
  }
}
