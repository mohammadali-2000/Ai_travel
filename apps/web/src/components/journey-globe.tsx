'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, Ref } from 'react';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false }) as unknown as ComponentType<
  GlobeProps & { ref?: Ref<GlobeMethods | null> }
>;

type Coordinates = { lat: number; lng: number };
type JourneyPoint = Coordinates & { name: string; index: number };
type JourneyArc = { start: Coordinates; end: Coordinates; name: string };
type DestinationResolution = Coordinates & { flag: string };

// These coordinates keep common destinations instant while unknown cities are
// resolved through the local geocoding route without changing the trip contract.
const destinationCoordinates: Record<string, Coordinates> = {
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  bali: { lat: -8.4095, lng: 115.1889 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  budapest: { lat: 47.4979, lng: 19.0402 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  delhi: { lat: 28.6139, lng: 77.209 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  goa: { lat: 15.2993, lng: 74.124 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  japan: { lat: 35.6762, lng: 139.6503 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  kathmandu: { lat: 27.7172, lng: 85.324 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  kashmir: { lat: 34.0837, lng: 74.7973 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  ladakh: { lat: 34.1526, lng: 77.5771 },
  london: { lat: 51.5072, lng: -0.1276 },
  manali: { lat: 32.2432, lng: 77.1892 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  newyork: { lat: 40.7128, lng: -74.006 },
  paris: { lat: 48.8566, lng: 2.3522 },
  pune: { lat: 18.5204, lng: 73.8567 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  rome: { lat: 41.9028, lng: 12.4964 },
  seoul: { lat: 37.5665, lng: 126.978 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  vienna: { lat: 48.2082, lng: 16.3738 },
  vietnam: { lat: 16.0544, lng: 108.2022 },
  zurich: { lat: 47.3769, lng: 8.5417 },
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
}

function coordinatesFor(value: string, fallback: Coordinates) {
  const normalized = normalize(value);
  const exact = destinationCoordinates[normalized];
  if (exact) return exact;

  const matchedKey = Object.keys(destinationCoordinates).find(
    (key) => normalized.includes(key) || key.includes(normalized),
  );
  return matchedKey ? destinationCoordinates[matchedKey] : fallback;
}

function hasKnownCoordinates(value: string) {
  const normalized = normalize(value);
  return Boolean(
    destinationCoordinates[normalized] ||
      Object.keys(destinationCoordinates).some((key) => normalized.includes(key) || key.includes(normalized)),
  );
}

function makeJourneyPoints(destination: string, mapPoints: string[], fallbackCenter: Coordinates) {
  const center = coordinatesFor(destination, fallbackCenter);
  const names = mapPoints.length ? mapPoints : [destination];

  return names.slice(0, 10).map<JourneyPoint>((name, index) => {
    const known = coordinatesFor(name, center);
    const isKnown = hasKnownCoordinates(name) || normalize(name) === normalize(destination);
    const offset = isKnown ? { lat: 0, lng: 0 } : { lat: (index % 3 - 1) * 1.8, lng: (index % 4 - 1.5) * 2.4 };
    return { name, lat: known.lat + offset.lat, lng: known.lng + offset.lng, index };
  });
}

export function JourneyGlobe({
  destination,
  mapPoints,
  activePoint,
  onPointSelect,
  onDestinationResolved,
}: {
  destination: string;
  mapPoints: string[];
  activePoint?: string | null;
  onPointSelect?: (point: string) => void;
  onDestinationResolved?: (resolution: DestinationResolution) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const destinationResolvedRef = useRef(onDestinationResolved);
  const [size, setSize] = useState({ width: 460, height: 330 });
  const [geocodedCenter, setGeocodedCenter] = useState<Coordinates | null>(null);
  const staticCenter = useMemo(() => coordinatesFor(destination, { lat: 20, lng: 0 }), [destination]);
  const center = geocodedCenter ?? staticCenter;
  const points = useMemo(() => makeJourneyPoints(destination, mapPoints, center), [center, destination, mapPoints]);
  const arcs = useMemo<JourneyArc[]>(
    () => points.slice(1).map((point, index) => ({ start: points[index], end: point, name: `${points[index].name} → ${point.name}` })),
    [points],
  );
  useEffect(() => {
    destinationResolvedRef.current = onDestinationResolved;
  }, [onDestinationResolved]);

  useEffect(() => {
    setGeocodedCenter(null);
    if (hasKnownCoordinates(destination)) return;

    let cancelled = false;
    fetch(`/api/geocode?q=${encodeURIComponent(destination)}`)
      .then(async (response) => (response.ok ? (await response.json()) as DestinationResolution : null))
      .then((resolution) => {
        if (cancelled || !resolution || !Number.isFinite(resolution.lat) || !Number.isFinite(resolution.lng)) return;
        setGeocodedCenter({ lat: resolution.lat, lng: resolution.lng });
        destinationResolvedRef.current?.(resolution);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [destination]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => setSize({ width: Math.max(280, container.clientWidth), height: 330 });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const focusDestination = () => {
    globeRef.current?.pointOfView({ lat: center.lat, lng: center.lng, altitude: 1.8 }, 900);
  };

  return (
    <div ref={containerRef} className="journey-globe relative h-[330px] w-full overflow-hidden rounded-2xl bg-[#070b1c]">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor="#a99bff"
        atmosphereAltitude={0.2}
        showGraticules
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={(point: object) => (point as JourneyPoint).name === activePoint ? '#ffffff' : '#c4b5fd'}
        pointAltitude={0.06}
        pointRadius={(point: object) => ((point as JourneyPoint).name === activePoint ? 0.8 : 0.5)}
        pointLabel={(point: object) => `<b>${(point as JourneyPoint).name}</b><br/>Click to explore this stop`}
        onPointClick={(point: object) => onPointSelect?.((point as JourneyPoint).name)}
        arcsData={arcs}
        arcStartLat={(arc: object) => (arc as JourneyArc).start.lat}
        arcStartLng={(arc: object) => (arc as JourneyArc).start.lng}
        arcEndLat={(arc: object) => (arc as JourneyArc).end.lat}
        arcEndLng={(arc: object) => (arc as JourneyArc).end.lng}
        arcColor={() => ['#c4b5fd', '#67e8f9']}
        arcAltitude={0.25}
        arcStroke={0.5}
        arcDashLength={0.45}
        arcDashGap={0.18}
        arcDashAnimateTime={1800}
        arcLabel="name"
        onGlobeReady={() => {
          const controls = globeRef.current?.controls();
          if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.35;
            controls.enableZoom = true;
          }
          focusDestination();
        }}
      />
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between text-white">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">Live route globe</p>
          <p className="mt-1 text-xs text-white/60">Drag to rotate · scroll to zoom</p>
        </div>
        <button
          type="button"
          onClick={focusDestination}
          className="pointer-events-auto rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition hover:bg-white/20"
        >
          Recenter
        </button>
      </div>
    </div>
  );
}
