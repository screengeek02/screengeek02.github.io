'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Feature, FeatureCollection, LineString } from 'geojson';

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

type MapboxModule = typeof import('mapbox-gl');
type MapInstance = import('mapbox-gl').Map;
type MarkerInstance = import('mapbox-gl').Marker;

const PUNTA_CANA_CENTER: [number, number] = [-68.3725, 18.5601];
const ROUTE_SOURCE_ID = 'helio-dispatch-routes-source';

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

function distance(a: [number, number], b: [number, number]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function buildRouteFeatures(workers: DispatchWorker[], jobs: ActiveJob[]): FeatureCollection<LineString> {
  const workerPool = [...workers];
  const features: Feature<LineString>[] = [];

  jobs.forEach((job) => {
    if (workerPool.length === 0) return;

    let closestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    workerPool.forEach((worker, index) => {
      const d = distance([worker.longitude, worker.latitude], [job.longitude, job.latitude]);
      if (d < bestDistance) {
        bestDistance = d;
        closestIndex = index;
      }
    });

    const [closestWorker] = workerPool.splice(closestIndex, 1);
    if (!closestWorker) return;

    features.push({
      type: 'Feature',
      properties: { jobId: job.id, workerId: closestWorker.id },
      geometry: {
        type: 'LineString',
        coordinates: [
          [closestWorker.longitude, closestWorker.latitude],
          [job.longitude, job.latitude],
        ],
      },
    });
  });

  return { type: 'FeatureCollection', features };
}

export function LiveDispatchMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const workerMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const jobMarkersRef = useRef<Map<string, MarkerInstance>>(new Map());
  const pollIntervalRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '', []);

  const syncMarkers = useCallback(
    (workers: DispatchWorker[], jobs: ActiveJob[]) => {
      const map = mapRef.current;
      const mapbox = mapboxRef.current;
      if (!map || !mapbox) return;

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

      const source = map.getSource(ROUTE_SOURCE_ID) as import('mapbox-gl').GeoJSONSource | undefined;
      if (source) {
        source.setData(buildRouteFeatures(workers, jobs));
      }
    },
    [],
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

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (!mounted || mapRef.current || !containerRef.current) return;
      if (!token) {
        setError('Map token missing. Add NEXT_PUBLIC_MAPBOX_TOKEN.');
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

        if (!map.getLayer('helio-route-layer')) {
          map.addLayer({
            id: 'helio-route-layer',
            type: 'line',
            source: ROUTE_SOURCE_ID,
            paint: {
              'line-color': '#7dd3fc',
              'line-width': 2,
              'line-opacity': 0.85,
              'line-dasharray': [2, 2],
            },
          });
        }

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

      workerMarkersRef.current.forEach((marker) => marker.remove());
      workerMarkersRef.current.clear();
      jobMarkersRef.current.forEach((marker) => marker.remove());
      jobMarkersRef.current.clear();

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
    </div>
  );
}
