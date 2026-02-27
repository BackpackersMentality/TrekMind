import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  stops: any[] | null;
  trek: any;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ─── Session cache: geocoded coords persist across page navigations ────────────
const geocodeCache = new Map<string, [number, number] | null>();

// ─── Haversine distance in km between two lat/lng points ───────────────────────
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Build a bounding box [minLng, minLat, maxLng, maxLat] around a point ──────
// 1000km radius: covers the longest continuous treks in the dataset (Camino de
// Santiago is ~800km end-to-end). Cross-continent errors like Patagonia →
// Venezuela (~6,800km) are still rejected with huge margin to spare.
function trekBbox(lat: number, lng: number, radiusKm = 1000): string {
  const latOff = radiusKm / 111.0;
  const lngOff = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));
  const minLng = Math.max(-180, lng - lngOff);
  const minLat = Math.max(-90,  lat - latOff);
  const maxLng = Math.min(180,  lng + lngOff);
  const maxLat = Math.min(90,   lat + latOff);
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

// ─── Parse a location name out of itinerary strings ────────────────────────────
// Handles formats like:
//   "Lukla to Namche Bazaar"  → "Namche Bazaar"
//   "Namche Bazaar"           → "Namche Bazaar"
//   "Rest day at Dole"        → "Dole"
//   "Camp 1 (5100m)"          → "Camp 1"
function parseLocationName(raw: string): string {
  if (!raw) return '';
  const toMatch = raw.match(/\bto\s+(.+)$/i);
  if (toMatch) return toMatch[1].trim().replace(/\s*\(.*?\)/g, '').trim();
  const atMatch = raw.match(/\bat\s+(.+)$/i);
  if (atMatch) return atMatch[1].trim().replace(/\s*\(.*?\)/g, '').trim();
  return raw.replace(/\s*\(.*?\)/g, '').trim();
}

// ─── Geocode with bbox + distance guard ────────────────────────────────────────
// Two-layer defence against wrong-continent results:
//   Layer 1 — bbox param tells Mapbox to only return results inside the box
//   Layer 2 — after response, reject any result still > 1000km from trek centre
async function geocode(
  placeName: string,
  country: string,
  trekLng: number,
  trekLat: number,
  token: string,
  maxDistKm = 1000
): Promise<[number, number] | null> {
  const key = `${placeName}|${trekLat.toFixed(2)},${trekLng.toFixed(2)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    const query     = encodeURIComponent(`${placeName} ${country}`);
    const bbox      = trekBbox(trekLat, trekLng);     // server-side geo filter
    const proximity = `${trekLng},${trekLat}`;         // bias toward trek centre
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
      `?bbox=${bbox}&proximity=${proximity}&limit=1` +
      `&types=place,locality,neighborhood,poi,region&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[RouteMap] Geocoding HTTP ${res.status} for "${placeName}"`);
      geocodeCache.set(key, null);
      return null;
    }

    const data = await res.json();
    const coords = data.features?.[0]?.geometry?.coordinates as [number, number] | undefined;

    if (!coords) {
      console.warn(`[RouteMap] No result within bbox for "${placeName}"`);
      geocodeCache.set(key, null);
      return null;
    }

    // Layer 2: distance guard — belt-and-braces rejection of outliers
    const dist = distanceKm(trekLat, trekLng, coords[1], coords[0]);
    if (dist > maxDistKm) {
      console.warn(
        `[RouteMap] Rejected "${placeName}" — result is ${Math.round(dist)}km away (max ${maxDistKm}km)`
      );
      geocodeCache.set(key, null);
      return null;
    }

    geocodeCache.set(key, coords);
    return coords;
  } catch (err) {
    console.error(`[RouteMap] Geocoding error for "${placeName}":`, err);
    geocodeCache.set(key, null);
    return null;
  }
}

// ─── Detect whether a stop name is too vague to geocode reliably ───────────────
// "Camp 1", "High Camp", "Base Camp", "Pass" etc. are mountain-specific names
// that Mapbox will either miss entirely or return wrong results for.
// For these we interpolate a position between known neighbouring stops instead.
const VAGUE_PATTERNS = [
  /^camp\s*\d+$/i,
  /^high\s+camp$/i,
  /^base\s+camp$/i,
  /^advanced\s+base\s+camp$/i,
  /^abc$/i,
  /^high\s+pass$/i,
  /^col\s+de/i,
  /^pass$/i,
  /^summit$/i,
  /^checkpoint\s*\d*$/i,
  /^rest\s+day$/i,
  /^acclimatisation\s+day$/i,
];

function isVague(name: string): boolean {
  return VAGUE_PATTERNS.some((p) => p.test(name.trim()));
}

// Linear interpolation between two [lng, lat] coords at fraction t (0–1)
function interpolateCoord(
  a: [number, number],
  b: [number, number],
  t: number
): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// For stops that couldn't be geocoded, fill their coords by interpolating
// between the nearest known neighbours (prev and next geocoded stop).
// This keeps the route line continuous without wild cross-continent jumps.
function interpolateMissingStops(
  results: (any | null)[],
  trekLng: number,
  trekLat: number
): any[] {
  // Seed with the trek centre so we always have at least one anchor
  const anchored: (any | null)[] = [...results];

  // Forward pass: fill nulls using last known + next known
  let lastKnown: [number, number] = [trekLng, trekLat];
  // Find first real coord to use as the right anchor for each null run
  const filled = anchored.map((stop, i) => {
    if (stop) { lastKnown = [stop.lng, stop.lat]; return stop; }
    // Look ahead to find next known
    const next = anchored.slice(i + 1).find(Boolean);
    const nextCoord: [number, number] = next ? [next.lng, next.lat] : lastKnown;
    const coord = interpolateCoord(lastKnown, nextCoord, 0.5);
    return { ...(results[i] ?? {}), lng: coord[0], lat: coord[1], _interpolated: true };
  });

  return filled;
}
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [geocodedStops, setGeocodedStops] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'geocoding' | 'ready' | 'error'>('idle');

  // ── 1. Enrich stops with coordinates ─────────────────────────────────────────
  useEffect(() => {
    if (!stops || stops.length === 0 || !trek) {
      setGeocodedStops([]);
      setStatus('ready');
      return;
    }

    // Check if stops already have coordinates (lat/lng or latitude/longitude)
    const alreadyHaveCoords = stops.every(
      (s) =>
        (typeof s.lat === 'number' || typeof s.latitude === 'number') &&
        (typeof s.lng === 'number' || typeof s.longitude === 'number')
    );

    if (alreadyHaveCoords) {
      setGeocodedStops(
        stops.map((s) => ({ ...s, lat: s.lat ?? s.latitude, lng: s.lng ?? s.longitude }))
      );
      setStatus('ready');
      return;
    }

    if (!MAPBOX_TOKEN) {
      setGeocodedStops([]);
      setStatus('ready');
      return;
    }

    setStatus('geocoding');

    // ── Build a guaranteed start anchor from the trek's known coordinates ───
    // This ensures the route always begins at the correct location even if
    // "Day 1: Camp 1" or similar can't be geocoded.
    const firstStop = stops[0];
    const lastStop  = stops[stops.length - 1];

    // Geocode each stop in parallel
    Promise.all(
      stops.map(async (stop, idx) => {
        // Get the raw location string - try all common field names
        const rawName = stop.location || stop.route || stop.overnightStay || stop.place || '';

        // ── If first or last stop fails to geocode, anchor to trek coords ───
        // This guarantees the route line always starts and ends in the right
        // country even when Day 1 is "Base Camp" or similar.
        const isFirst = idx === 0;
        const isLast  = idx === stops.length - 1;

        if (!rawName) {
          if (isFirst) return { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };
          if (isLast)  return { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };
          return null;
        }

        const cleanName = parseLocationName(rawName);

        // ── Detect vague/generic names that geocoding can't handle ───────────
        // For these we skip geocoding now and interpolate coords later once we
        // know where the neighbouring stops landed.
        if (isVague(cleanName)) {
          console.log(`[RouteMap] Skipping vague stop "${cleanName}" — will interpolate`);
          // Anchor first/last to trek centre so the route line stays grounded
          if (isFirst) return { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };
          if (isLast)  return { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };
          return null; // will be interpolated in post-processing
        }

        const coords = await geocode(
          cleanName,
          trek.country || '',
          trek.longitude,
          trek.latitude,
          MAPBOX_TOKEN
        );

        if (!coords) {
          console.warn(`[RouteMap] No coords for "${cleanName}" (from "${rawName}")`);
          if (isFirst) return { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };
          if (isLast)  return { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };
          return null;
        }

        return { ...stop, lng: coords[0], lat: coords[1], _geocodedName: cleanName };
      })
    ).then((results) => {
      // Fill in nulls (vague stops, failed geocodes) by interpolating between
      // their nearest geocoded neighbours so the route line stays continuous.
      const interpolated = interpolateMissingStops(results, trek.longitude, trek.latitude);
      const valid = interpolated.filter(Boolean) as any[];
      console.log(`[RouteMap] ${valid.length}/${stops.length} stops placed (including interpolated)`);
      setGeocodedStops(valid);
      setStatus(valid.length > 0 ? 'ready' : 'error');
    });
  }, [stops, trek]);

  // ── 2. Build / rebuild map once geocoding is done ────────────────────────────
  useEffect(() => {
    if (status !== 'ready') return;
    if (!mapContainer.current || !MAPBOX_TOKEN || !trek?.latitude || !trek?.longitude) return;

    // Destroy previous map instance (e.g. when trek changes)
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const hasRoute = geocodedStops.length >= 2;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [trek.longitude, trek.latitude],
        zoom: hasRoute ? 10 : 9,
        pitch: 60,
        bearing: 20,
        projection: 'globe' as any,
      });

      map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

      // ── Terrain & atmosphere ──────────────────────────────────────────────────
      map.current.on('style.load', () => {
        if (!map.current) return;
        map.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.8 });
        map.current.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15,
          },
        });
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
        });
      });

      // ── Route line + markers ──────────────────────────────────────────────────
      map.current.on('load', () => {
        if (!map.current) return;

        if (hasRoute) {
          const coordinates = geocodedStops.map((s) => [s.lng, s.lat]);
          const bounds = new mapboxgl.LngLatBounds();

          // Glow halo
          map.current.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } },
          });
          map.current.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#facc15', 'line-width': 10, 'line-opacity': 0.25 },
          });
          map.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#facc15', 'line-width': 4, 'line-dasharray': [2, 1.5] },
          });

          // Day markers
          geocodedStops.forEach((stop, i) => {
            const isFirst = i === 0;
            const isLast = i === geocodedStops.length - 1;
            const isInterpolated = stop._interpolated === true;
            const isAnchored = stop._anchored === true;
            // Interpolated/anchored stops get a smaller dashed ring to signal
            // they're approximate positions, not precise geocodes.
            const size = isFirst || isLast ? 14 : isInterpolated ? 7 : 9;

            const el = document.createElement('div');
            el.style.cssText = `
              width:${size}px; height:${size}px; border-radius:50%;
              background:${isFirst || isAnchored ? '#10b981' : isLast ? '#ef4444' : isInterpolated ? '#94a3b8' : '#3b82f6'};
              border:${isInterpolated ? '1.5px dashed rgba(255,255,255,0.6)' : '2px solid white'};
              box-shadow:0 2px 6px rgba(0,0,0,0.5);
              opacity:${isInterpolated ? '0.7' : '1'};
              cursor:pointer; transition:transform 0.15s;
            `;
            el.onmouseenter = () => (el.style.transform = 'scale(1.6)');
            el.onmouseleave = () => (el.style.transform = 'scale(1)');

            const locationLabel = stop._geocodedName || stop.location || stop.route || 'Stop';
            const popup = new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(`
              <div style="padding:6px 8px;font-family:sans-serif;font-size:13px;color:#111;min-width:120px;">
                <strong>Day ${stop.day}${isFirst || isAnchored ? ' · Start' : isLast ? ' · Finish' : ''}</strong>
                <div style="color:#444;margin-top:2px;">${locationLabel}</div>
                ${isInterpolated ? '<div style="color:#f59e0b;font-size:10px;margin-top:2px;">⚠ Approximate position</div>' : ''}
                ${stop.maxAltM || stop.maxAlt ? `<div style="color:#888;font-size:11px;margin-top:2px;">⛰ ${stop.maxAltM || stop.maxAlt}m</div>` : ''}
                ${stop.distanceKm || stop.distance ? `<div style="color:#888;font-size:11px;">📏 ${stop.distanceKm || stop.distance}km</div>` : ''}
              </div>
            `);

            new mapboxgl.Marker(el)
              .setLngLat([stop.lng, stop.lat])
              .setPopup(popup)
              .addTo(map.current!);

            bounds.extend([stop.lng, stop.lat]);
          });

          map.current.fitBounds(bounds, {
            padding: { top: 80, bottom: 100, left: 60, right: 80 },
            maxZoom: 12,
            pitch: 60,
            bearing: 20,
          });
        } else {
          // Fallback: single trek location marker
          const el = document.createElement('div');
          el.style.cssText = `
            width:20px; height:20px; border-radius:50%;
            background:#f59e0b; border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.6);
          `;
          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="padding:6px 8px;font-family:sans-serif;font-size:13px;color:#111;">
              <strong>${trek.name}</strong>
              <div style="color:#555;margin-top:2px;">${trek.region}, ${trek.country}</div>
              ${geocodedStops.length === 1 ? '<div style="color:#888;font-size:11px;margin-top:2px;">Route data limited</div>' : ''}
            </div>
          `);
          new mapboxgl.Marker(el)
            .setLngLat([trek.longitude, trek.latitude])
            .setPopup(popup)
            .addTo(map.current!);
          map.current.flyTo({ center: [trek.longitude, trek.latitude], zoom: 9, pitch: 60, essential: true });
        }
      });
    } catch (err) {
      console.error('[RouteMap] Map init failed:', err);
      setStatus('error');
    }

    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(mapContainer.current);
    return () => {
      observer.disconnect();
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, [geocodedStops, trek, status]);

  // ── No token UI ──────────────────────────────────────────────────────────────
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[500px] rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="text-4xl">🗺️</div>
        <h3 className="text-lg font-semibold">Map not configured</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">VITE_MAPBOX_TOKEN</code> to
          your Cloudflare Pages environment variables.
        </p>
        <ol className="text-xs text-muted-foreground text-left space-y-1 max-w-xs list-decimal list-inside">
          <li>Sign up free at <strong>mapbox.com</strong></li>
          <li>Copy your public access token</li>
          <li>Cloudflare Pages → Settings → Environment variables</li>
          <li>Add <code className="bg-muted px-1 rounded font-mono">VITE_MAPBOX_TOKEN</code> = your token</li>
          <li>Redeploy</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Geocoding spinner */}
      {status === 'geocoding' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white z-10">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Locating route waypoints…</p>
        </div>
      )}

      {/* Legend */}
      {status === 'ready' && geocodedStops.length >= 2 && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 flex items-center gap-3 pointer-events-none z-10">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" />Start</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 border border-white inline-block" />Waypoint</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block" />Finish</span>
          {geocodedStops.some(s => s._interpolated) && (
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 border border-white/60 border-dashed inline-block opacity-70" />Approx</span>
          )}
        </div>
      )}
    </div>
  );
}
