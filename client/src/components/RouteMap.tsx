import React, { useEffect, useRef, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  stops: any[] | null;
  trek: any;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ─────────────────────────────────────────────────────────────
// Geocode a place name string → [lng, lat] using Mapbox API.
// We bias results toward the trek's own coordinates so "Camp 1"
// or "High Pass" finds the right mountain, not a random match.
// ─────────────────────────────────────────────────────────────
async function geocodeLocation(
  locationName: string,
  proximityLng: number,
  proximityLat: number,
  token: string
): Promise<[number, number] | null> {
  try {
    const query = encodeURIComponent(locationName);
    const proximity = `${proximityLng},${proximityLat}`;
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
      `?proximity=${proximity}&limit=1&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    return feature.geometry.coordinates as [number, number]; // [lng, lat]
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Simple in-memory cache so navigating back/forward doesn't
// re-geocode the same trek twice in a session.
// ─────────────────────────────────────────────────────────────
const geocodeCache: Record<string, [number, number]> = {};

export default function RouteMap({ stops, trek }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // geocodedStops: stops enriched with [lng, lat] coords
  const [geocodedStops, setGeocodedStops] = useState<any[]>([]);
  const [geocoding, setGeocoding] = useState(false);

  // ── Step 1: figure out which stops already have coords ──────
  const stopsWithCoords = useMemo(() => {
    if (!stops || !Array.isArray(stops)) return [];
    return stops.filter(
      (s) =>
        typeof (s.lat ?? s.latitude) === 'number' &&
        typeof (s.lng ?? s.longitude) === 'number'
    ).map((s) => ({
      ...s,
      lat: s.lat ?? s.latitude,
      lng: s.lng ?? s.longitude,
    }));
  }, [stops]);

  // ── Step 2: if coords are missing, geocode the location names ─
  useEffect(() => {
    // If the itinerary already has full coordinates, use them directly
    if (stopsWithCoords.length > 0 && stopsWithCoords.length === (stops?.length ?? 0)) {
      setGeocodedStops(stopsWithCoords);
      return;
    }

    // No token → can't geocode, fall back to single trek marker
    if (!MAPBOX_TOKEN || !trek?.latitude || !trek?.longitude) {
      setGeocodedStops([]);
      return;
    }

    // No stops at all → nothing to geocode
    if (!stops || stops.length === 0) {
      setGeocodedStops([]);
      return;
    }

    const cacheKey = `${trek.id}-stops`;
    if (geocodeCache[cacheKey + '-done']) {
      // Restore from cache
      const cached = stops.map((_, i) => geocodeCache[`${cacheKey}-${i}`])
        .map((coords, i) => coords ? { ...stops[i], lng: coords[0], lat: coords[1] } : null)
        .filter(Boolean);
      setGeocodedStops(cached as any[]);
      return;
    }

    setGeocoding(true);

    // Geocode each stop in parallel (Mapbox free tier: 100k/month, ~66 stops per trek is fine)
    Promise.all(
      stops.map(async (stop, i) => {
        const locationName = stop.location || stop.route || stop.overnightStay;
        if (!locationName) return null;

        // Already cached individually?
        if (geocodeCache[`${cacheKey}-${i}`]) {
          const [lng, lat] = geocodeCache[`${cacheKey}-${i}`];
          return { ...stop, lng, lat };
        }

        // Add trek country/region for better accuracy: "Namche Bazaar, Nepal"
        const searchTerm = `${locationName}, ${trek.country}`;
        const coords = await geocodeLocation(
          searchTerm,
          trek.longitude,
          trek.latitude,
          MAPBOX_TOKEN
        );

        if (coords) {
          geocodeCache[`${cacheKey}-${i}`] = coords;
          return { ...stop, lng: coords[0], lat: coords[1] };
        }
        return null;
      })
    ).then((results) => {
      const valid = results.filter(Boolean) as any[];
      geocodeCache[cacheKey + '-done'] = [0, 0]; // Mark as attempted
      setGeocodedStops(valid);
      setGeocoding(false);
    });
  }, [stops, stopsWithCoords, trek]);

  // ── Step 3: initialise / update the map ────────────────────
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || !trek?.latitude || !trek?.longitude) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Clean up any previous map instance when trek changes
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [trek.longitude, trek.latitude],
        zoom: geocodedStops.length > 0 ? 11 : 9,
        pitch: 65,
        bearing: 30,
        projection: 'globe' as any,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('style.load', () => {
        if (!map.current) return;

        // 3D terrain
        map.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.8 });

        // Atmospheric sky
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

      map.current.on('load', () => {
        if (!map.current) return;

        if (geocodedStops.length > 1) {
          // ── Draw route line ──────────────────────────────────
          const coordinates = geocodedStops.map((s) => [s.lng, s.lat]);

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates },
            },
          });

          // Subtle glow/halo under the main line
          map.current.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#facc15', 'line-width': 10, 'line-opacity': 0.3 },
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#facc15',
              'line-width': 4,
              'line-dasharray': [2, 1.5],
            },
          });

          // ── Drop markers for each stop ───────────────────────
          const bounds = new mapboxgl.LngLatBounds();

          geocodedStops.forEach((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === geocodedStops.length - 1;

            const el = document.createElement('div');
            el.style.width = isFirst || isLast ? '16px' : '10px';
            el.style.height = isFirst || isLast ? '16px' : '10px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)';
            el.style.backgroundColor = isFirst
              ? '#10b981'   // green = start
              : isLast
              ? '#ef4444'   // red = finish
              : '#3b82f6';  // blue = waypoint
            el.style.cursor = 'pointer';
            el.style.transition = 'transform 0.15s';
            el.onmouseenter = () => (el.style.transform = 'scale(1.5)');
            el.onmouseleave = () => (el.style.transform = 'scale(1)');

            const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`
              <div style="padding:6px 8px; font-family:sans-serif; font-size:13px; color:#111;">
                <strong style="display:block; margin-bottom:2px;">Day ${stop.day}${isFirst ? ' · Start' : isLast ? ' · Finish' : ''}</strong>
                <span style="color:#555;">${stop.location || stop.route || 'Checkpoint'}</span>
                ${stop.maxAltM || stop.maxAlt ? `<span style="display:block;color:#888;font-size:11px;margin-top:2px;">⛰ ${stop.maxAltM || stop.maxAlt}m</span>` : ''}
              </div>
            `);

            new mapboxgl.Marker(el)
              .setLngLat([stop.lng, stop.lat])
              .setPopup(popup)
              .addTo(map.current!);

            bounds.extend([stop.lng, stop.lat]);
          });

          map.current.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 60, right: 80 },
            maxZoom: 13,
            pitch: 65,
            bearing: 30,
          });

        } else {
          // ── Fallback: single marker at trek location ─────────
          const el = document.createElement('div');
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#f59e0b';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.6)';

          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="padding:6px 8px; font-family:sans-serif; font-size:13px; color:#111;">
              <strong>${trek.name}</strong><br/>
              <span style="color:#555;">${trek.region}, ${trek.country}</span>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([trek.longitude, trek.latitude])
            .setPopup(popup)
            .addTo(map.current!);

          map.current.flyTo({
            center: [trek.longitude, trek.latitude],
            zoom: 9,
            pitch: 65,
            bearing: 30,
            essential: true,
          });
        }
      });
    } catch (err) {
      console.error('Map initialisation failed:', err);
    }

    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(mapContainer.current);
    return () => {
      observer.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [geocodedStops, trek]);

  // ── No token: show setup instructions ──────────────────────
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[500px] rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="text-4xl">🗺️</div>
        <h3 className="text-lg font-semibold">Map not configured</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">VITE_MAPBOX_TOKEN</code> to your Cloudflare Pages environment variables to enable the interactive 3D route map.
        </p>
        <ol className="text-xs text-muted-foreground text-left space-y-1 max-w-sm list-decimal list-inside">
          <li>Go to <strong>mapbox.com</strong> → sign up free</li>
          <li>Copy your public access token</li>
          <li>In Cloudflare Pages → Settings → Environment variables</li>
          <li>Add <code className="bg-muted px-1 rounded font-mono">VITE_MAPBOX_TOKEN</code> = your token</li>
          <li>Redeploy</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Geocoding loading overlay */}
      {geocoding && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading route coordinates…</p>
        </div>
      )}

      {/* Legend */}
      {geocodedStops.length > 1 && !geocoding && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 flex items-center gap-3 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" /> Start
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white inline-block" /> Waypoint
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block" /> Finish
          </span>
        </div>
      )}
    </div>
  );
}