import { JobStatus, Role, WorkerStatus } from '@prisma/client';
import { db } from '@/lib/db';

const DEFAULT_BASE_LAT = 18.5601;
const DEFAULT_BASE_LNG = -68.3725;
const DEFAULT_DISPATCH_RADIUS_KM = 15;

type WorkerCandidate = {
  id: string;
  lastLatitude: number | null;
  lastLongitude: number | null;
};

function hashToInt(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function fallbackCoordinate(seedValue: string): { latitude: number; longitude: number } {
  const seed = hashToInt(seedValue);
  const latOffset = ((seed % 1000) / 1000 - 0.5) * 0.18;
  const lngOffset = ((((seed / 1000) | 0) % 1000) / 1000 - 0.5) * 0.24;

  return {
    latitude: Number((DEFAULT_BASE_LAT + latOffset).toFixed(6)),
    longitude: Number((DEFAULT_BASE_LNG + lngOffset).toFixed(6)),
  };
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function findNearestWorker(jobLat: number, jobLng: number, radiusKm = DEFAULT_DISPATCH_RADIUS_KM) {
  const workers = await db.user.findMany({
    where: {
      role: Role.WORKER,
      workerStatus: WorkerStatus.APPROVED,
    },
    select: {
      id: true,
      lastLatitude: true,
      lastLongitude: true,
    },
  });

  if (workers.length === 0) return null;

  const activeAssignments = await db.job.groupBy({
    by: ['assignedWorkerId'],
    where: {
      assignedWorkerId: { not: null },
      status: { in: [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS] },
    },
    _count: { _all: true },
  });

  const busyWorkerIds = new Set(
    activeAssignments
      .map((entry) => entry.assignedWorkerId)
      .filter((workerId): workerId is string => Boolean(workerId)),
  );

  let bestWorker: WorkerCandidate | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const worker of workers) {
    if (busyWorkerIds.has(worker.id)) continue;
    if (typeof worker.lastLatitude !== 'number' || typeof worker.lastLongitude !== 'number') continue;

    const dist = distanceKm(jobLat, jobLng, worker.lastLatitude, worker.lastLongitude);
    if (dist > radiusKm) continue;

    if (dist < bestDistance) {
      bestDistance = dist;
      bestWorker = worker;
    }
  }

  return bestWorker;
}

export async function autoAssignWorker(jobId: string, jobLat?: number | null, jobLng?: number | null) {
  return db.$transaction(async (tx) => {
    const job = await tx.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        address: true,
      },
    });

    if (!job || job.status !== JobStatus.PENDING) return null;

    const coordinates =
      typeof jobLat === 'number' && typeof jobLng === 'number'
        ? { latitude: jobLat, longitude: jobLng }
        : fallbackCoordinate(`${job.id}-${job.address}`);

    const worker = await findNearestWorker(coordinates.latitude, coordinates.longitude);
    if (!worker) return null;

    const updateResult = await tx.job.updateMany({
      where: {
        id: job.id,
        status: JobStatus.PENDING,
      },
      data: {
        assignedWorkerId: worker.id,
        status: JobStatus.ASSIGNED,
      },
    });

    if (updateResult.count === 0) return null;

    console.log('Auto dispatch assigned worker:', worker.id, 'for job:', job.id);
    return worker;
  });
}
