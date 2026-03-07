'use client';

import { useEffect, useMemo, useRef } from 'react';

type WorkerState = 'AVAILABLE' | 'ASSIGNED' | 'WORKING';
type JobState = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS';

export type DispatchMapWorker = {
  id: string;
  name: string;
  status: WorkerState;
  assignedJobsCount: number;
  latitude: number;
  longitude: number;
};

export type DispatchMapJob = {
  id: string;
  customerName: string;
  address: string;
  serviceType: string;
  scheduledDate: string;
  status: JobState;
  assignedWorkerId: string | null;
  latitude: number;
  longitude: number;
};

type Props = {
  workers: DispatchMapWorker[];
  jobs: DispatchMapJob[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
};

type MapboxModule = typeof import('mapbox-gl');
type MapInstance = import('mapbox-gl').Map;
type MarkerInstance = import('mapbox-gl').Marker;

const CENTER: [number, number] = [-68.3725, 18.5601];

function workerColor(status: WorkerState) {
  if (status === 'AVAILABLE') return '#22c55e';
  if (status === 'ASSIGNED') return '#3b82f6';
  return '#a855f7';
}

function jobColor(status: JobState) {
  if (status === 'PENDING') return '#eab308';
  if (status === 'ASSIGNED') return '#3b82f6';
  return '#a855f7';
}

function markerElement(color: string, glow = false) {
  const el = document.createElement('div');
  el.style.width = '16px';
  el.style.height = '16px';
  el.style.borderRadius = '9999px';
  el.style.background = color;
  el.style.border = '2px solid rgba(15,23,42,0.9)';
  el.style.boxShadow = glow
    ? `0 0 0 4px ${color}33, 0 0 18px ${color}99`
    : `0 0 0 3px ${color}33, 0 0 10px ${color}80`;
  return el;
}

export function DispatchMap({ workers, jobs, selectedJobId, onSelectJob }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const workerMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const jobMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());

  const token = useMemo(() => process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '', []);

  useEffect(() => {
    let active = true;

    async function initMap() {
      if (!containerRef.current || mapRef.current || !token) return;

      const mapbox = await import('mapbox-gl');
      if (!active || !containerRef.current) return;

      mapboxRef.current = mapbox;
      mapbox.default.accessToken = token;

      const map = new mapbox.default.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: CENTER,
        zoom: 11.2,
        attributionControl: false,
      });

      map.addControl(new mapbox.default.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;
    }

    void initMap();

    return () => {
      active = false;
      workerMarkersRef.current.forEach((marker) => marker.remove());
      jobMarkersRef.current.forEach((marker) => marker.remove());
      workerMarkersRef.current.clear();
      jobMarkersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxRef.current;
    if (!map || !mapbox) return;

    const workerIds = new Set(workers.map((worker) => worker.id));
    const jobIds = new Set(jobs.map((job) => job.id));

    workers.forEach((worker) => {
      const existing = workerMarkersRef.current.get(worker.id);
      const lngLat: [number, number] = [worker.longitude, worker.latitude];

      if (existing) {
        existing.setLngLat(lngLat);
        return;
      }

      const marker = new mapbox.Marker({ element: markerElement(workerColor(worker.status), worker.status === 'AVAILABLE') })
        .setLngLat(lngLat)
        .setPopup(new mapbox.Popup({ offset: 16 }).setText(`${worker.name} • ${worker.status}`))
        .addTo(map);

      workerMarkersRef.current.set(worker.id, marker);
    });

    jobs.forEach((job) => {
      const existing = jobMarkersRef.current.get(job.id);
      const lngLat: [number, number] = [job.longitude, job.latitude];

      if (existing) {
        existing.setLngLat(lngLat);
        const el = existing.getElement();
        el.style.outline = selectedJobId === job.id ? '2px solid #7dd3fc' : 'none';
        return;
      }

      const marker = new mapbox.Marker({ element: markerElement(jobColor(job.status)) })
        .setLngLat(lngLat)
        .setPopup(new mapbox.Popup({ offset: 16 }).setText(`${job.customerName} • ${job.serviceType}`))
        .addTo(map);

      marker.getElement().addEventListener('click', () => onSelectJob(job.id));
      jobMarkersRef.current.set(job.id, marker);
    });

    workerMarkersRef.current.forEach((marker, id) => {
      if (workerIds.has(id)) return;
      marker.remove();
      workerMarkersRef.current.delete(id);
    });

    jobMarkersRef.current.forEach((marker, id) => {
      if (jobIds.has(id)) return;
      marker.remove();
      jobMarkersRef.current.delete(id);
    });
  }, [jobs, onSelectJob, selectedJobId, workers]);

  if (!token) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-rose-300">
        Map token missing. Set <code className="text-sky-300">NEXT_PUBLIC_MAPBOX_TOKEN</code>.
      </div>
    );
  }

  return <div ref={containerRef} className="h-[620px] w-full rounded-xl border border-slate-800" />;
}
