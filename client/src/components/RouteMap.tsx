import React, { useEffect, useRef, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';

interface RouteMapProps {
  stops: any[] | null;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ stops }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [processedStops, setProcessedStops] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. AUTO-GEOCODER
  useEffect(() => {
    const fetchMissingCoordinates = async () => {
      if (!stops || stops.length === 0) {
        setProcessedStops([]);
        return;
      }

      setIsProcessing(true);

      const resolvedStops = await Promise.all(
        stops.map(async (stop) => {
          // If already has coords, keep them
          if (stop.lat !== undefined && stop.lng !== undefined) return stop;

          // Cleaning logic: "Day 2: Syange to Dharapani" -> "Dharapani"
          // Also removes common trekking terms that confuse the geocoder
          const rawName = stop.location || stop.route || "";
          let searchName = rawName.split(' to ').pop() || rawName;
          searchName = searchName
            .replace(/\(Drive\)|\(Jeep\)|\(Bus\)|\(Trek\)/gi, '')
            .replace(/Camp|Hut|Lodge/gi, '') // Remove generic terms to find the town name
            .trim();

          if (!searchName || searchName.length < 3) return null;

          try {
            console.log(`🔍 Geocoding: ${searchName}...`);
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchName)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
            );
            
            if (!response.ok) {
              console.warn(`❌ Mapbox API Error for ${searchName}: ${response.status}`);
              return null;
            }

            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              console.log(`✅ Found ${searchName}:`, lat, lng);
              return { ...stop, lat, lng };
            } else {
              console.warn(`⚠️ No results found for: ${searchName}`);
            }
          } catch (error) {
            console.error(`Failed to geocode: ${searchName}`, error);
          }
          return null;
        })
      );

      setProcessedStops(resolvedStops.filter(Boolean));
      setIsProcessing(false);
    };

    if (MAPBOX_TOKEN) {
      fetchMissingCoordinates();
    } else {
      console.error("Missing VITE_MAPBOX_TOKEN");
    }
  }, [stops]);

  // Compute elevation stats
  const stats = useMemo(() => {
    let totalAscent = 0;
    let totalDescent = 0;
    for (let i = 1; i < processedStops.length; i++) {
      const currentElev = Number(processedStops[i].elevation || processedStops[i].maxAltM || 0);
      const prevElev = Number(processedStops[i - 1].elevation || processedStops[i - 1].maxAltM || 0);
      const diff = currentElev - prevElev;
      
      if (diff > 0) totalAscent += diff;
      else totalDescent += Math.abs(diff);
    }
    return { totalAscent, totalDescent };
  }, [processedStops]);

  // 2. DRAW THE MAP
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || processedStops.length === 0 || isProcessing) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [processedStops[0].lng, processedStops[0].lat],
        zoom: 9, // Zoomed out slightly to see more context
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        const coordinates = processedStops.map(stop => [stop.lng, stop.lat]);
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coordinates }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 2] }
        });

        const bounds = new mapboxgl.LngLatBounds();

        processedStops.forEach((stop, index) => {
          const el = document.createElement('div');
          el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform';
          
          if (index === 0) el.style.backgroundColor = '#10b981';
          else if (index === processedStops.length - 1) el.style.backgroundColor = '#ef4444';
          else el.style.backgroundColor = '#3b82f6';

          const displayName = stop.location || stop.route || 'Checkpoint';
          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="padding: 4px; font-family: sans-serif;">
              <strong style="font-size: 14px;">Day ${stop.day}</strong><br/>
              <span style="color: #666;">${displayName}</span><br/>
              ${stop.elevation || stop.maxAltM ? `<span style="font-weight: bold;">${stop.elevation || stop.maxAltM}m</span>` : ''}
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([stop.lng, stop.lat])
            .setPopup(popup)
            .addTo(map.current!);

          bounds.extend([stop.lng, stop.lat]);
        });

        map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      });
    }

    const resizeObserver = new ResizeObserver(() => map.current?.resize());
    resizeObserver.observe(mapContainer.current);

    return () => resizeObserver.disconnect();
  }, [processedStops, isProcessing]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className="w-full h-[450px] bg-muted/30 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="font-bold text-foreground">Locating Route...</p>
        <p className="text-sm">Connecting to Mapbox Satellite...</p>
      </div>
    );
  }

  if (!stops || stops.length === 0 || processedStops.length === 0) {
    return (
      <div className="w-full h-[450px] bg-muted/30 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <p className="font-bold text-foreground">Interactive Map Unavailable</p>
        <p className="text-sm mt-1">We couldn't generate coordinates. Check console (F12) for API errors.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-muted-foreground mb-2 bg-muted/30 p-2 rounded-lg border border-border/50">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm" /> Start
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-sm" /> Overnight
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm" /> Finish
          </div>
        </div>
        {(stats.totalAscent > 0 || stats.totalDescent > 0) && (
          <div className="flex gap-3">
            <span className="text-[#10b981]">↑ {stats.totalAscent}m</span>
            <span className="text-[#ef4444]">↓ {stats.totalDescent}m</span>
          </div>
        )}
      </div>

      <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-border shadow-sm">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
