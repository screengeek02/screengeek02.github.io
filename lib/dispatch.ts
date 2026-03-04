export type DispatchWorkerStatus = 'AVAILABLE' | 'BUSY';

export type DispatchWorker = {
  id: string;
  name: string;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastUpdated: string | null;
  status: DispatchWorkerStatus;
  assignedJobsCount: number;
};

export type DispatchJobStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type DispatchJob = {
  id: string;
  latitude: number;
  longitude: number;
  status: DispatchJobStatus;
  serviceType: string;
  scheduledDate: string;
  address: string;
  customerName: string;
  assignedWorkerId: string | null;
};

export type DispatchSuggestion = {
  worker: DispatchWorker;
  distanceKm: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.latitude - from.latitude);
  const lngDelta = toRadians(to.longitude - from.longitude);

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const haversineA =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));
  return earthRadiusKm * c;
}

export function suggestClosestWorker(job: DispatchJob, workers: DispatchWorker[]): DispatchSuggestion | null {
  const availableWorkers = workers.filter(
    (worker) => worker.status === 'AVAILABLE' && typeof worker.lastLatitude === 'number' && typeof worker.lastLongitude === 'number',
  );
  if (availableWorkers.length === 0) return null;

  let selectedWorker: DispatchWorker | null = null;
  let smallestDistance = Number.POSITIVE_INFINITY;

  availableWorkers.forEach((worker) => {
    const distance = haversineDistanceKm(
      { latitude: worker.lastLatitude ?? 0, longitude: worker.lastLongitude ?? 0 },
      job,
    );
    if (distance < smallestDistance) {
      smallestDistance = distance;
      selectedWorker = worker;
    }
  });

  if (!selectedWorker) return null;

  return {
    worker: selectedWorker,
    distanceKm: Number(smallestDistance.toFixed(1)),
  };
}
