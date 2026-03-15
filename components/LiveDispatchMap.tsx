'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DispatchPanel } from '@/components/DispatchPanel';
import {
  DispatchJob,
  DispatchSuggestion,
  DispatchWorker,
  suggestClosestWorker,
} from '@/lib/dispatch';

type LiveDispatchResponse = {
  workers: DispatchWorker[];
  jobs: DispatchJob[];
};

type DirectionsResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
};

type RouteState = {
  jobId: string;
  worker: DispatchWorker;
  distanceKm: number;
  etaMinutes: number;
};

type MapboxModule = typeof import('mapbox-gl');
type MapInstance = import('mapbox-gl').Map;
type MarkerInstance = import('mapbox-gl').Marker;
type PopupInstance = import('mapbox-gl').Popup;

const PUNTA_CANA_CENTER: [number, number] = [-68.3725, 18.5601];
const ROUTE_SOURCE_ID = 'dispatch-route-source';
const ROUTE_LAYER_ID = 'dispatch-route';

function workerStatusClass(status: DispatchWorker['status']) {
  if (status === 'AVAILABLE') return 'is-available';
  if (status === 'ASSIGNED') return 'is-assigned';
  if (status === 'TRAVELING') return 'is-traveling';
  return 'is-offline';
}

function createWorkerMarkerElement(worker: DispatchWorker) {
  const el = document.createElement('div');
  el.className = `helio-map-marker helio-map-marker-worker ${workerStatusClass(worker.status)}`;
  el.setAttribute('title', `${worker.name} (${worker.status})`);

  const core = document.createElement('span');
  core.className = 'helio-map-marker-core';
  el.appendChild(core);

  return el;
}

function createJobMarkerElement(job: DispatchJob) {
  const el = document.createElement('div');
  el.className = 'helio-map-marker helio-map-marker-job';
  el.setAttribute('title', `${job.serviceType} • ${job.status}`);

  const core = document.createElement('span');
  core.className = 'helio-map-marker-core';
  el.appendChild(core);

  return el;
}

function statusBadgeClass(status: DispatchJob['status']) {
  if (status === 'PENDING') return 'bg-amber-500/20 text-amber-300';
  if (status === 'ASSIGNED') return 'bg-sky-500/20 text-sky-300';
  if (status === 'IN_PROGRESS') return 'bg-violet-500/20 text-violet-300';
  if (status === 'COMPLETED') return 'bg-emerald-500/20 text-emerald-300';
  return 'bg-rose-500/20 text-rose-300';
}

export function LiveDispatchMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const workerMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const jobMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const popupRef = useRef<PopupInstance | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const dashAnimationRef = useRef<number | null>(null);

  const [workers, setWorkers] = useState<DispatchWorker[]>([]);
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [routeState, setRouteState] = useState<RouteState | null>(null);

  const token = useMemo(() => process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '', []);

  const suggestedAssignments = useMemo<Record<string, DispatchSuggestion | null>>(() => {
    const suggestions: Record<string, DispatchSuggestion | null> = {};
    jobs.forEach((job) => {
      suggestions[job.id] = suggestClosestWorker(job, workers);
    });
    return suggestions;
  }, [jobs, workers]);

  const clearRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(ROUTE_SOURCE_ID) as import('mapbox-gl').GeoJSONSource | undefined;
    if (source) {
      source.setData({ type: 'FeatureCollection', features: [] });
    }

    popupRef.current?.remove();
    popupRef.current = null;
    setRouteState(null);
  }, []);

  const drawRoute = useCallback((coordinates: [number, number][]) => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(ROUTE_SOURCE_ID) as import('mapbox-gl').GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      ],
    });
  }, []);

  const fetchDirections = useCallback(
    async (worker: DispatchWorker, job: DispatchJob) => {
      if (typeof worker.lastLatitude !== 'number' || typeof worker.lastLongitude !== 'number') {
        throw new Error('Selected worker has no live GPS location yet.');
      }

      const url = new URL(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${worker.lastLongitude},${worker.lastLatitude};${job.longitude},${job.latitude}`,
      );
      url.searchParams.set('geometries', 'geojson');
      url.searchParams.set('overview', 'full');
      url.searchParams.set('access_token', token);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Could not calculate dispatch route.');
      }

      const json = (await response.json()) as DirectionsResponse;
      const route = json.routes?.[0];
      if (!route) {
        throw new Error('No route returned for this dispatch pair.');
      }

      return route;
    },
    [token],
  );

  const showRouteForJob = useCallback(
    async (job: DispatchJob) => {
      const suggestion = suggestClosestWorker(job, workers);
      if (!suggestion) {
        setError('No AVAILABLE workers with live GPS coordinates for this job.');
        clearRoute();
        return;
      }

      try {
        const route = await fetchDirections(suggestion.worker, job);
        drawRoute(route.geometry.coordinates);

        const etaMinutes = Math.max(1, Math.round(route.duration / 60));
        const distanceKm = Number((route.distance / 1000).toFixed(1));

        setRouteState({
          jobId: job.id,
          worker: suggestion.worker,
          etaMinutes,
          distanceKm,
        });

        const mapbox = mapboxRef.current;
        const map = mapRef.current;
        if (mapbox && map) {
          popupRef.current?.remove();
          popupRef.current = new mapbox.Popup({ closeButton: false, offset: 18 })
            .setLngLat([job.longitude, job.latitude])
            .setHTML(
              `<div style="font-family:ui-sans-serif,system-ui;color:#e2e8f0;background:#0f172a;padding:8px;border-radius:10px;border:1px solid rgba(56,189,248,.35)">
                <div style="font-weight:700;color:#7dd3fc;margin-bottom:4px;">Cleaner: ${suggestion.worker.name}</div>
                <div style="font-size:12px;">Distance: ${distanceKm} km</div>
                <div style="font-size:12px;">ETA: ${etaMinutes} minutes</div>
              </div>`,
            )
            .addTo(map);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to generate route.');
      }
    },
    [clearRoute, drawRoute, fetchDirections, workers],
  );

  const syncMarkers = useCallback(
    (nextWorkers: DispatchWorker[], nextJobs: DispatchJob[]) => {
      const map = mapRef.current;
      const mapbox = mapboxRef.current;
      if (!map || !mapbox) return;

      const renderableWorkers = nextWorkers.filter(
        (worker) => typeof worker.lastLatitude === 'number' && typeof worker.lastLongitude === 'number',
      );

      const workerIds = new Set(renderableWorkers.map((worker) => worker.id));
      const jobIds = new Set(nextJobs.map((job) => job.id));

      renderableWorkers.forEach((worker) => {
        const lngLat: [number, number] = [worker.lastLongitude as number, worker.lastLatitude as number];
        const existing = workerMarkersRef.current.get(worker.id);

        if (existing) {
          existing.setLngLat(lngLat);
          existing.getElement().className = `helio-map-marker helio-map-marker-worker ${workerStatusClass(worker.status)}`;
          existing.getElement().setAttribute('title', `${worker.name} (${worker.status})`);
          return;
        }

        const marker = new mapbox.Marker({ element: createWorkerMarkerElement(worker) }).setLngLat(lngLat).addTo(map);
        workerMarkersRef.current.set(worker.id, marker);
      });

      nextJobs.forEach((job) => {
        const existing = jobMarkersRef.current.get(job.id);
        if (existing) {
          existing.setLngLat([job.longitude, job.latitude]);
          return;
        }

        const marker = new mapbox.Marker({ element: createJobMarkerElement(job) })
          .setLngLat([job.longitude, job.latitude])
          .setPopup(
            new mapbox.Popup({ offset: 16 }).setHTML(`
              <div style="color:#cbd5e1;font-size:12px;line-height:1.4;">
                <div style="font-weight:700;color:#f8fafc;margin-bottom:4px;">${job.customerName}</div>
                <div>${job.address}</div>
                <div style="margin-top:4px;color:#7dd3fc;">Worker: ${job.assignedWorkerName ?? 'Unassigned'}</div>
              </div>
            `),
          )
          .addTo(map);

        marker.getElement().addEventListener('click', () => {
          void showRouteForJob(job);
        });

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
    },
    [showRouteForJob],
  );

  const fetchDispatchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/live-dispatch', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load live dispatch data.');
      }

      const payload = (await response.json()) as Partial<LiveDispatchResponse>;
      if (!Array.isArray(payload.workers) || !Array.isArray(payload.jobs)) {
        throw new Error('Invalid live dispatch payload.');
      }

      setWorkers(payload.workers);
      setJobs(payload.jobs);
      syncMarkers(payload.workers, payload.jobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dispatch map data.');
    }
  }, [syncMarkers]);

  const assignWorker = useCallback(
    async (jobId: string, workerId: string) => {
      setAssigningJobId(jobId);
      try {
        const response = await fetch(`/api/admin/jobs/${jobId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workerId }),
        });

        if (!response.ok) {
          throw new Error('Unable to assign worker.');
        }

        await fetchDispatchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to assign worker.');
      } finally {
        setAssigningJobId(null);
      }
    },
    [fetchDispatchData],
  );

  useEffect(() => {
    let mounted = true;
    const workerMarkers = workerMarkersRef.current;
    const jobMarkers = jobMarkersRef.current;

    async function initialize() {
      if (!mounted || mapRef.current || !containerRef.current) return;
      if (!token) {
        setError('Map token missing. Set NEXT_PUBLIC_MAPBOX_TOKEN from MAPBOX_TOKEN.');
        return;
      }

      const mapbox = await import('mapbox-gl');
      if (!mounted || !containerRef.current) return;

      mapboxRef.current = mapbox;
      mapbox.default.accessToken = token;

      const map = new mapbox.default.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: PUNTA_CANA_CENTER,
        zoom: 11.3,
        attributionControl: false,
      });

      mapRef.current = map;
      map.addControl(new mapbox.default.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        if (!map.getSource(ROUTE_SOURCE_ID)) {
          map.addSource(ROUTE_SOURCE_ID, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });
        }

        if (!map.getLayer(ROUTE_LAYER_ID)) {
          map.addLayer({
            id: ROUTE_LAYER_ID,
            type: 'line',
            source: ROUTE_SOURCE_ID,
            paint: {
              'line-color': '#38bdf8',
              'line-width': 4,
              'line-opacity': 0.9,
              'line-dasharray': [2, 2],
              'line-blur': 0.5,
            },
          });
        }

        let dash = 0;
        dashAnimationRef.current = window.setInterval(() => {
          dash = (dash + 1) % 6;
          if (map.getLayer(ROUTE_LAYER_ID)) {
            map.setPaintProperty(ROUTE_LAYER_ID, 'line-dasharray', [2, 2 + dash / 4]);
          }
        }, 450);

        void fetchDispatchData();
      });
    }

    void initialize();

    pollIntervalRef.current = window.setInterval(() => {
      void fetchDispatchData();
    }, 5000);

    return () => {
      mounted = false;

      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      if (dashAnimationRef.current) {
        window.clearInterval(dashAnimationRef.current);
        dashAnimationRef.current = null;
      }

      popupRef.current?.remove();
      popupRef.current = null;

      workerMarkers.forEach((marker) => marker.remove());
      workerMarkers.clear();
      jobMarkers.forEach((marker) => marker.remove());
      jobMarkers.clear();

      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [fetchDispatchData, token]);

  const jobStatusCounts = useMemo(() => {
    const pending = jobs.filter((job) => job.status === 'PENDING').length;
    const assigned = jobs.filter((job) => job.status === 'ASSIGNED').length;
    const inProgress = jobs.filter((job) => job.status === 'IN_PROGRESS').length;
    return { pending, assigned, inProgress };
  }, [jobs]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/75 p-3 shadow-[0_0_24px_rgba(56,189,248,0.16)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-slate-500/70 bg-slate-800/85 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-100">
            Punta Cana • Bavaro
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="rounded-md bg-slate-800 px-2 py-1">Pending: {jobStatusCounts.pending}</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">Assigned: {jobStatusCounts.assigned}</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">In Progress: {jobStatusCounts.inProgress}</span>
          </div>
          {error && <span className="text-xs text-rose-300">{error}</span>}
        </div>

        <div ref={containerRef} className="h-[320px] w-full overflow-hidden rounded-xl md:h-[420px]" />

        {routeState && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <span className="rounded-md bg-slate-800 px-2 py-1">Cleaner: {routeState.worker.name}</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">Distance: {routeState.distanceKm} km</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">ETA: {routeState.etaMinutes} min</span>
            <span
              className={`rounded-md px-2 py-1 ${statusBadgeClass(
                jobs.find((job) => job.id === routeState.jobId)?.status ?? 'PENDING',
              )}`}
            >
              {jobs.find((job) => job.id === routeState.jobId)?.status.replace('_', ' ')}
            </span>
            <button
              type="button"
              onClick={clearRoute}
              className="rounded-md border border-slate-600 px-2 py-1 text-slate-300 transition hover:border-sky-400/60 hover:text-sky-200"
            >
              Clear Route
            </button>
          </div>
        )}
      </div>

      <DispatchPanel jobs={jobs} suggestions={suggestedAssignments} assigningJobId={assigningJobId} onAssign={assignWorker} />
    </div>
  );
}
