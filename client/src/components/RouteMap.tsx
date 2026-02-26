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

// ─── Parse a location name out of itinerary strings ────────────────────────────
// Handles formats like:
//   "Lukla to Namche Bazaar"  → "Namche Bazaar"
//   "Namche Bazaar"           → "Namche Bazaar"
//   "Rest day at Dole"        → "Dole"
//   "Camp 1 (5100m)"          → "Camp 1"
function parseLocationName(raw: string): string {
  if (!raw) return '';
  // "X to Y" → take Y (the overnight destination)
  const toMatch = raw.match(/\bto\s+(.+)$/i);
  if (toMatch) return toMatch[1].trim().replace(/\s*\(.*?\)/, '').trim();
  // "rest day at X" → take X
  const atMatch = raw.match(/\bat\s+(.+)$/i);
  if (atMatch) return atMatch[1].trim().replace(/\s*\(.*?\)/, '').trim();
  // Strip parenthetical elevation notes: "Thorong La (5416m)" → "Thorong La"
  return raw.replace(/\s*\(.*?\)/, '').trim();
}

// ─── Geocode a single clean place name via Mapbox Geocoding v5 ─────────────────
async function geocode(
  placeName: string,
  country: string,
  proximityLng: number,
  proximityLat: number,
  token: string
): Promise<[number, number] | null> {
  const key = `${placeName}|${country}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    // Include country name for disambiguation, e.g. "Namche Bazaar Nepal"
    const query = encodeURIComponent(`${placeName} ${country}`);
    const proximity = `${proximityLng},${proximityLat}`;
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
      `?proximity=${proximity}&limit=1&types=place,locality,neighborhood,poi&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[RouteMap] Geocoding HTTP ${res.status} for "${placeName}"`);
      geocodeCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const coords = data.features?.[0]?.geometry?.coordinates as [number, number] | undefined;
    geocodeCache.set(key, coords ?? null);
    return coords ?? null;
  } catch (err) {
    console.error(`[RouteMap] Geocoding error for "${placeName}":`, err);
    geocodeCache.set(key, null);
    return null;
  }
}

export default function RouteMap({ stops, trek }: RouteMapProps) {
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

    // Geocode each stop in parallel
    Promise.all(
      stops.map(async (stop) => {
        // Get the raw location string - try all common field names
        const rawName = stop.location || stop.route || stop.overnightStay || stop.place || '';
        if (!rawName) return null;

        // Clean up "Lukla to Namche Bazaar" → "Namche Bazaar"
        const cleanName = parseLocationName(rawName);
        if (!cleanName) return null;

        const coords = await geocode(
          cleanName,
          trek.country || '',
          trek.longitude,
          trek.latitude,
          MAPBOX_TOKEN
        );

        if (!coords) {
          console.warn(`[RouteMap] No coords for "${cleanName}" (from "${rawName}")`);
          return null;
        }

        return { ...stop, lng: coords[0], lat: coords[1], _geocodedName: cleanName };
      })
    ).then((results) => {
      const valid = results.filter(Boolean) as any[];
      console.log(`[RouteMap] Geocoded ${valid.length}/${stops.length} stops`);
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
            const size = isFirst || isLast ? 14 : 9;

            const el = document.createElement('div');
            el.style.cssText = `
              width:${size}px; height:${size}px; border-radius:50%;
              background:${isFirst ? '#10b981' : isLast ? '#ef4444' : '#3b82f6'};
              border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.5);
              cursor:pointer; transition:transform 0.15s;
            `;
            el.onmouseenter = () => (el.style.transform = 'scale(1.6)');
            el.onmouseleave = () => (el.style.transform = 'scale(1)');

            const locationLabel = stop._geocodedName || stop.location || stop.route || 'Stop';
            const popup = new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(`
              <div style="padding:6px 8px;font-family:sans-serif;font-size:13px;color:#111;min-width:120px;">
                <strong>Day ${stop.day}${isFirst ? ' · Start' : isLast ? ' · Finish' : ''}</strong>
                <div style="color:#444;margin-top:2px;">${locationLabel}</div>
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
        </div>
      )}
    </div>
  );
}