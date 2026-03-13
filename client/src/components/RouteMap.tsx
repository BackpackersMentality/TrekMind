import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  stops: any[] | null;
  trek: any;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ─── Haversine distance in km ──────────────────────────────────────────────────
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── 1000km bbox around trek centre ───────────────────────────────────────────
function trekBbox(lat: number, lng: number): string {
  const R = 1000;
  const latOff = R / 111.0;
  const lngOff = R / (111.0 * Math.cos((lat * Math.PI) / 180));
  return `${Math.max(-180, lng - lngOff)},${Math.max(-90, lat - latOff)},${Math.min(180, lng + lngOff)},${Math.min(90, lat + latOff)}`;
}

// ─── Clean itinerary label: "Lukla to Namche Bazaar" → "Namche Bazaar" ────────
function parseLocationName(raw: string): string {
  if (!raw) return '';
  const toMatch = raw.match(/\bto\s+(.+)$/i);
  if (toMatch) return toMatch[1].replace(/\s*\(.*?\)/g, '').trim();
  const atMatch = raw.match(/\bat\s+(.+)$/i);
  if (atMatch) return atMatch[1].replace(/\s*\(.*?\)/g, '').trim();
  return raw.replace(/\s*\(.*?\)/g, '').trim();
}

// ─── Vague names that can't be reliably geocoded ───────────────────────────────
const VAGUE = [/^camp\s*\d*$/i, /^high\s+camp$/i, /^base\s+camp$/i, /^abc$/i, /^pass$/i, /^summit$/i, /^col\s/i, /^checkpoint/i, /^rest\s+day$/i];
const isVague = (n: string) => VAGUE.some(p => p.test(n.trim()));

// ─── Session geocode cache ─────────────────────────────────────────────────────
const cache = new Map<string, [number, number] | null>();

async function geocode(name: string, country: string, trekLng: number, trekLat: number, token: string): Promise<[number, number] | null> {
  const key = `${name}|${trekLat.toFixed(2)},${trekLng.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${name} ${country}`)}.json` +
      `?bbox=${trekBbox(trekLat, trekLng)}&proximity=${trekLng},${trekLat}&limit=1&types=place,locality,neighborhood,poi,region&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) { cache.set(key, null); return null; }
    const data = await res.json();
    const coords = data.features?.[0]?.geometry?.coordinates as [number, number] | undefined;
    if (!coords) { cache.set(key, null); return null; }
    const dist = distanceKm(trekLat, trekLng, coords[1], coords[0]);
    if (dist > 1000) { console.warn(`[RouteMap] Rejected "${name}" — ${Math.round(dist)}km away`); cache.set(key, null); return null; }
    cache.set(key, coords);
    return coords;
  } catch { cache.set(key, null); return null; }
}

// ─── Fill null stops by interpolating between neighbours ──────────────────────
function interpolateMissing(results: (any | null)[], trekLng: number, trekLat: number): any[] {
  let lastKnown: [number, number] = [trekLng, trekLat];
  return results.map((stop, i) => {
    if (stop) { lastKnown = [stop.lng, stop.lat]; return stop; }
    const next = results.slice(i + 1).find(Boolean);
    const nextC: [number, number] = next ? [next.lng, next.lat] : lastKnown;
    const lng = lastKnown[0] + (nextC[0] - lastKnown[0]) * 0.5;
    const lat = lastKnown[1] + (nextC[1] - lastKnown[1]) * 0.5;
    return { ...(results[i] ?? {}), lng, lat, _interpolated: true };
  });
}

// ─── Combined geocoding state (single setState prevents race conditions) ───────
type GeoState = { stops: any[]; ready: boolean; geocoding: boolean };

// ─── Waypoint type → colour mapping ──────────────────────────────────────────
const WP_COLOURS: Record<string, string> = {
  pass: '#4472C4',
  summit: '#ef4444',
  base_camp: '#a855f7',
  viewpoint: '#22c55e',
  landmark: '#f97316',
  glacier: '#93c5fd',
  hot_spring: '#fb7185',
};

export default function RouteMap({ stops, trek }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [geo, setGeo] = useState<GeoState>({ stops: [], ready: false, geocoding: false });

  // ── Step 1: Geocode stops ────────────────────────────────────────────────────
  useEffect(() => {
    if (!trek) return;

    setGeo({ stops: [], ready: false, geocoding: false });

    if (!stops || stops.length === 0) {
      setGeo({ stops: [], ready: true, geocoding: false });
      return;
    }

    // ✅ Already have coords from our hardcoded JSON — skip geocoding entirely
    const allHaveCoords = stops.every(s =>
      (typeof (s.lat ?? s.latitude) === 'number') && (typeof (s.lng ?? s.longitude) === 'number')
    );
    if (allHaveCoords) {
      setGeo({
        stops: stops.map(s => ({ ...s, lat: s.lat ?? s.latitude, lng: s.lng ?? s.longitude })),
        ready: true,
        geocoding: false,
      });
      return;
    }

    if (!MAPBOX_TOKEN) {
      setGeo({ stops: [], ready: true, geocoding: false });
      return;
    }

    setGeo(prev => ({ ...prev, geocoding: true }));

    Promise.all(stops.map(async (stop, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === stops.length - 1;
      const anchor = { ...stop, lng: trek.longitude, lat: trek.latitude, _anchored: true };

      const rawName = stop.location || stop.route || stop.overnightStay || stop.place || '';
      if (!rawName) return isFirst || isLast ? anchor : null;

      const cleanName = parseLocationName(rawName);
      if (!cleanName || isVague(cleanName)) return isFirst || isLast ? anchor : null;

      const coords = await geocode(cleanName, trek.country || '', trek.longitude, trek.latitude, MAPBOX_TOKEN);
      if (!coords) return isFirst || isLast ? anchor : null;

      return { ...stop, lng: coords[0], lat: coords[1], _geocodedName: cleanName };
    })).then(results => {
      const filled = interpolateMissing(results, trek.longitude, trek.latitude);
      const valid = filled.filter(Boolean) as any[];
      console.log(`[RouteMap] ${valid.length}/${stops.length} stops placed`);
      setGeo({ stops: valid, ready: true, geocoding: false });
    });
  }, [stops, trek]);

  // ── Step 2: Build map once geocoding is complete ─────────────────────────────
  useEffect(() => {
    if (!geo.ready || !mapContainer.current || !MAPBOX_TOKEN || !trek?.latitude || !trek?.longitude) return;

    if (map.current) { map.current.remove(); map.current = null; }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const hasRoute = geo.stops.length >= 2;
    const waypoints: any[] = trek.waypoints ?? [];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [trek.longitude, trek.latitude],
      zoom: hasRoute ? 10 : 9,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // ── Terrain & atmosphere ──────────────────────────────────────────────
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
        color: 'rgb(186,210,235)',
        'high-color': 'rgb(36,92,223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11,11,25)',
      });

      // ── Route line (Start → Overnights → Finish only, not waypoints) ─────
      if (hasRoute) {
        const coords = geo.stops.map(s => [s.lng, s.lat]);
        const bounds = new mapboxgl.LngLatBounds();

        map.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
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

        // ── Overnight stop markers ────────────────────────────────────────
        // FIX: Use togglePopup() on click so popup follows the marker's
        // rendered position (which shifts with 3D terrain exaggeration).
        // Pure DOM onclick on the marker element fires at the flat-map
        // hitbox position, which drifts away from the visual dot on steep
        // terrain — togglePopup() lets Mapbox recalculate the correct anchor.
        geo.stops.forEach((stop, i) => {
          if (!map.current) return;
          const isFirst = i === 0;
          const isLast = i === geo.stops.length - 1;
          const isApprox = stop._interpolated || stop._anchored;
          const size = isFirst || isLast ? 14 : isApprox ? 7 : 9;
          const colour = isFirst ? '#10b981' : isLast ? '#ef4444' : isApprox ? '#94a3b8' : '#3b82f6';

          const el = document.createElement('div');
          el.style.cssText = `
            width:${size}px;height:${size}px;border-radius:50%;
            background:${colour};
            border:${isApprox ? '1.5px dashed rgba(255,255,255,0.6)' : '2px solid white'};
            box-shadow:0 2px 6px rgba(0,0,0,0.5);
            opacity:${isApprox ? 0.7 : 1};
            cursor:pointer;
            transition:transform 0.15s;
          `;

          const label =
            stop.overnight ||
            stop._geocodedName ||
            stop.overnightStay ||
            stop.location ||
            parseLocationName(stop.route || stop.routePaths || stop.sectionRoute || '') ||
            `Day ${stop.day}`;

          const elev = stop.maxAltM || stop.maxAlt || '';
          const dist = stop.distanceKm || stop.distance || '';
          const note = stop.mapNote || '';

          const popupHtml = `
            <div style="padding:8px 10px;font-family:system-ui,sans-serif;font-size:13px;color:#111;min-width:140px;max-width:200px;">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">
                Day ${stop.day}${isFirst ? ' · Start' : isLast ? ' · Finish' : ' · Overnight'}
              </div>
              <div style="color:#333;font-size:13px;margin-bottom:4px;">${label}</div>
              ${note ? `<div style="color:#555;font-size:11px;margin-bottom:3px;font-style:italic;">${note}</div>` : ''}
              ${elev ? `<div style="color:#777;font-size:11px;">⛰ ${elev}m</div>` : ''}
              ${dist ? `<div style="color:#777;font-size:11px;">📏 ${dist}</div>` : ''}
              ${isApprox ? '<div style="color:#f59e0b;font-size:10px;margin-top:4px;">⚠ Approximate position</div>' : ''}
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 14, closeButton: true, maxWidth: '220px' }).setHTML(popupHtml);
          const marker = new mapboxgl.Marker(el)
            .setLngLat([stop.lng, stop.lat])
            .setPopup(popup)
            .addTo(map.current!);

          // Click opens/closes popup at the correct terrain-adjusted position
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            marker.togglePopup();
          });
          // Hover scale — keep rotation neutral for round markers
          el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.6)'; });
          el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });

          bounds.extend([stop.lng, stop.lat]);
        });

        // ── Waypoint markers (passes, summits, etc.) — all blue diamonds ──
        // Waypoints are reference points only, not part of the route line.
        waypoints.forEach(wp => {
          if (!map.current || typeof wp.lat !== 'number' || typeof wp.lng !== 'number') return;

          const el = document.createElement('div');
          el.style.cssText = `
            width:10px;height:10px;
            background:#3b82f6;
            border:1.5px solid white;
            box-shadow:0 2px 5px rgba(0,0,0,0.6);
            transform:rotate(45deg);
            cursor:pointer;
            transition:transform 0.15s;
          `;

          const type = wp.type || 'landmark';
          const typeLabel: Record<string, string> = {
            pass: '🏔 Pass', summit: '▲ Summit', base_camp: '⛺ Base Camp',
            viewpoint: '👁 Viewpoint', landmark: '★ Landmark', glacier: '🧊 Glacier', hot_spring: '♨ Hot Spring',
          };

          const wpHtml = `
            <div style="padding:8px 10px;font-family:system-ui,sans-serif;font-size:13px;color:#111;min-width:140px;max-width:210px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${wp.name}</div>
              <div style="color:#3b82f6;font-size:11px;font-weight:600;margin-bottom:4px;">${typeLabel[type] || type}</div>
              ${wp.altM ? `<div style="color:#777;font-size:11px;">⛰ ${wp.altM.toLocaleString()}m</div>` : ''}
              ${wp.note ? `<div style="color:#555;font-size:11px;margin-top:3px;font-style:italic;">${wp.note}</div>` : ''}
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 12, closeButton: true, maxWidth: '220px' }).setHTML(wpHtml);
          const marker = new mapboxgl.Marker(el)
            .setLngLat([wp.lng, wp.lat])
            .setPopup(popup)
            .addTo(map.current!);

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            marker.togglePopup();
          });
          el.addEventListener('mouseenter', () => { el.style.transform = 'rotate(45deg) scale(1.8)'; });
          el.addEventListener('mouseleave', () => { el.style.transform = 'rotate(45deg) scale(1)'; });

          bounds.extend([wp.lng, wp.lat]);
        });

        map.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 100, left: 60, right: 80 },
          maxZoom: 12,
        });

      } else {
        // Fallback single marker
        const el = document.createElement('div');
        el.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.6);cursor:pointer;';
        const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div style="padding:6px 8px;font-family:sans-serif;font-size:13px;color:#111;">
            <strong>${trek.name}</strong>
            <div style="color:#555;margin-top:2px;">${trek.region}, ${trek.country}</div>
          </div>`
        );
        const marker = new mapboxgl.Marker(el)
          .setLngLat([trek.longitude, trek.latitude])
          .setPopup(popup)
          .addTo(map.current!);
        el.addEventListener('click', (e) => { e.stopPropagation(); marker.togglePopup(); });
        map.current.flyTo({ center: [trek.longitude, trek.latitude], zoom: 9, essential: true });
      }
    });

    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(mapContainer.current);
    return () => {
      observer.disconnect();
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, [geo.ready, geo.stops, trek]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[500px] rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center gap-3 text-center p-8">
        <div className="text-4xl">🗺️</div>
        <h3 className="text-lg font-semibold">Map not configured</h3>
        <p className="text-sm text-muted-foreground">
          Add <code className="bg-muted px-1 rounded text-xs font-mono">VITE_MAPBOX_TOKEN</code> to Cloudflare Pages environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />

      {geo.geocoding && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white z-10">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Locating route waypoints…</p>
        </div>
      )}

      {/* ✅ FIX 3: Legend now includes waypoint types */}
      {geo.ready && geo.stops.length >= 2 && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 pointer-events-none z-10 max-w-[380px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" />Start
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white inline-block" />Overnight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block" />Finish
          </span>
          {(trek.waypoints?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 inline-block rotate-45 bg-blue-500 border border-white" style={{flexShrink:0}} />Waypoint
            </span>
          )}
          {geo.stops.some(s => s._interpolated) && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-400 border-dashed border border-white/60 inline-block opacity-70" />Approx
            </span>
          )}
        </div>
      )}
    </div>
  );
}
