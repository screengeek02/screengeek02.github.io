'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

type LiveDispatchResponse = {
  workers: DispatchWorker[];
  activeJobs: ActiveJob[];
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

type SelectedRoute = {
  jobId: string;
  worker: DispatchWorker;
  job: ActiveJob;
  distanceKm: number;
  etaMinutes: number;
};

type MapboxModule = typeof import('mapbox-gl');
type MapInstance = import('mapbox-gl').Map;
type MarkerInstance = import('mapbox-gl').Marker;

const PUNTA_CANA_CENTER: [number, number] = [-68.3725, 18.5601];
const ROUTE_SOURCE_ID = 'dispatch-route-source';
const ROUTE_LAYER_ID = 'dispatch-route';

function createWorkerMarkerElement(name: string) {
  const el = document.createElement('div');
  el.className = 'helio-map-marker helio-map-marker-worker';
  el.setAttribute('title', name);

  const core = document.createElement('span');
  core.className = 'helio-map-marker-core';
  el.appendChild(core);

  return el;
}

function createJobMarkerElement() {
  const el = document.createElement('div');
  el.className = 'helio-map-marker helio-map-marker-job';
  el.setAttribute('title', 'Active Job');

  const core = document.createElement('span');
  core.className = 'helio-map-marker-core';
  el.appendChild(core);

  return el;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(
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

export function LiveDispatchMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const workerMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const jobMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const workerDataRef = useRef<Map<string, DispatchWorker>>(new Map());
  const jobDataRef = useRef<Map<string, ActiveJob>>(new Map());
  const pollIntervalRef = useRef<number | null>(null);
  const dashAnimationRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);
  const [assigning, setAssigning] = useState(false);

  const token = useMemo(() => process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '', []);

  const clearRouteLayer = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(ROUTE_SOURCE_ID) as import('mapbox-gl').GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, []);

  const fetchDirections = useCallback(
    async (worker: DispatchWorker, job: ActiveJob) => {
      const directionsUrl = new URL(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${worker.longitude},${worker.latitude};${job.longitude},${job.latitude}`,
      );
      directionsUrl.searchParams.set('geometries', 'geojson');
      directionsUrl.searchParams.set('overview', 'full');
      directionsUrl.searchParams.set('access_token', token);

      const response = await fetch(directionsUrl.toString());
      if (!response.ok) {
        throw new Error('Unable to calculate route.');
      }

      const data = (await response.json()) as DirectionsResponse;
      const route = data.routes?.[0];
      if (!route) {
        throw new Error('No route available for this worker and job.');
      }

      return route;
    },
    [token],
  );

  const drawRoute = useCallback((coordinates: [number, number][]) => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(ROUTE_SOURCE_ID) as import('mapbox-gl').GeoJSONSource | undefined;
    if (source) {
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
    }
  }, []);

  const findClosestWorker = useCallback((job: ActiveJob) => {
    const workers = Array.from(workerDataRef.current.values());

    if (workers.length === 0) {
      return null;
    }

    let closestWorker: DispatchWorker | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    workers.forEach((worker) => {
      const dist = haversineDistanceKm(worker, job);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestWorker = worker;
      }
    });

    return closestWorker;
  }, []);

  const handleJobClick = useCallback(
    async (jobId: string) => {
      const job = jobDataRef.current.get(jobId);
      if (!job) return;

      const worker = findClosestWorker(job);
      if (!worker) {
        setError('No available workers to route.');
        return;
      }

      try {
        const route = await fetchDirections(worker, job);
        drawRoute(route.geometry.coordinates);

        setSelectedRoute({
          jobId: job.id,
          worker,
          job,
          distanceKm: Number((route.distance / 1000).toFixed(1)),
          etaMinutes: Math.max(1, Math.round(route.duration / 60)),
        });
        setError(null);
      } catch (err) {
        clearRouteLayer();
        setSelectedRoute(null);
        setError(err instanceof Error ? err.message : 'Unable to build dispatch route.');
      }
    },
    [clearRouteLayer, drawRoute, fetchDirections, findClosestWorker],
  );

  const syncMarkers = useCallback(
    (workers: DispatchWorker[], jobs: ActiveJob[]) => {
      const map = mapRef.current;
      const mapbox = mapboxRef.current;
      if (!map || !mapbox) return;

      workerDataRef.current = new Map(workers.map((worker) => [worker.id, worker]));
      jobDataRef.current = new Map(jobs.map((job) => [job.id, job]));

      const workerIds = new Set(workers.map((worker) => worker.id));
      const jobIds = new Set(jobs.map((job) => job.id));

      workers.forEach((worker) => {
        const existing = workerMarkersRef.current.get(worker.id);
        if (existing) {
          existing.setLngLat([worker.longitude, worker.latitude]);
          existing.getElement().setAttribute('title', worker.name);
          return;
        }

        const marker = new mapbox.Marker({ element: createWorkerMarkerElement(worker.name) })
          .setLngLat([worker.longitude, worker.latitude])
          .addTo(map);

        workerMarkersRef.current.set(worker.id, marker);
      });

      jobs.forEach((job) => {
        const existing = jobMarkersRef.current.get(job.id);
        if (existing) {
          existing.setLngLat([job.longitude, job.latitude]);
          return;
        }

        const marker = new mapbox.Marker({ element: createJobMarkerElement() })
          .setLngLat([job.longitude, job.latitude])
          .addTo(map);

        marker.getElement().addEventListener('click', () => {
          void handleJobClick(job.id);
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
    [handleJobClick],
  );

  const fetchDispatchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/live-dispatch', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load live dispatch data.');
      }

      const payload = (await response.json()) as LiveDispatchResponse;
      syncMarkers(payload.workers, payload.activeJobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load map data.');
    }
  }, [syncMarkers]);

  const assignCleaner = useCallback(async () => {
    if (!selectedRoute) return;

    setAssigning(true);
    try {
      const response = await fetch(`/api/admin/jobs/${selectedRoute.jobId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: selectedRoute.worker.id }),
      });

      if (!response.ok) {
        throw new Error('Unable to assign cleaner.');
      }

      setError(`Assigned ${selectedRoute.worker.name} to job ${selectedRoute.jobId}.`);
      await fetchDispatchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign cleaner.');
    } finally {
      setAssigning(false);
    }
  }, [fetchDispatchData, selectedRoute]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (!mounted || mapRef.current || !containerRef.current) return;
      if (!token) {
        setError('Map token missing. Add NEXT_PUBLIC_MAPBOX_TOKEN (from MAPBOX_TOKEN).');
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
        }, 500);

        void fetchDispatchData();
      });
    }

    void initialize();

    pollIntervalRef.current = window.setInterval(() => {
      void fetchDispatchData();
    }, 10000);

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

      workerMarkersRef.current.forEach((marker) => marker.remove());
      workerMarkersRef.current.clear();
      jobMarkersRef.current.forEach((marker) => marker.remove());
      jobMarkersRef.current.clear();
      workerDataRef.current.clear();
      jobDataRef.current.clear();

      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [fetchDispatchData, token]);

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/75 p-3 shadow-[0_0_24px_rgba(56,189,248,0.16)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full border border-slate-500/70 bg-slate-800/85 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-100">
          Punta Cana • Bavaro
        </span>
        {error && <span className="text-xs text-rose-300">{error}</span>}
      </div>

      <div ref={containerRef} className="h-[320px] w-full overflow-hidden rounded-xl md:h-[420px]" />

      {selectedRoute && (
        <div className="mt-3 rounded-xl border border-sky-400/30 bg-slate-950/90 p-3">
          <p className="text-sm font-semibold text-sky-300">Dispatch Route</p>
          <p className="mt-1 text-xs text-slate-200">Cleaner: {selectedRoute.worker.name}</p>
          <p className="text-xs text-slate-300">Distance: {selectedRoute.distanceKm} km</p>
          <p className="text-xs text-slate-300">ETA: {selectedRoute.etaMinutes} minutes</p>
          <button
            type="button"
            disabled={assigning}
            onClick={() => {
              void assignCleaner();
            }}
            className="mt-2 rounded-lg border border-sky-400/40 bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assigning ? 'Assigning...' : 'Assign Cleaner'}
          </button>
        </div>
      )}
    </div>
  );
}
