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

  // 1. AUTO-GEOCODER: Automatically fetch missing coordinates
  useEffect(() => {
    const fetchMissingCoordinates = async () => {
      if (!stops || stops.length === 0) {
        setProcessedStops([]);
        return;
      }

      setIsProcessing(true);

      const resolvedStops = await Promise.all(
        stops.map(async (stop) => {
          // If the stop already has coordinates in the JSON, use them!
          if (stop.lat !== undefined && stop.lng !== undefined) return stop;

          // If coordinates are missing, extract the destination name
          // E.g., "Syange to Dharapani" -> searches for "Dharapani"
          const rawName = stop.location || stop.route || "";
          const searchName = rawName.split(' to ').pop()?.replace('(Drive)', '').trim();

          if (!searchName) return null;

          try {
            // Ask Mapbox API for the coordinates silently in the background
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                searchName
              )}.json?access_token=${MAPBOX_TOKEN}&limit=1`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              return { ...stop, lat, lng }; // Inject the new coordinates
            }
          } catch (error) {
            console.error(`Failed to find coordinates for: ${searchName}`);
          }
          return null; // Skip drawing this point if Mapbox can't find it
        })
      );

      // Filter out any stops that completely failed to resolve
      setProcessedStops(resolvedStops.filter(Boolean));
      setIsProcessing(false);
    };

    if (MAPBOX_TOKEN) {
      fetchMissingCoordinates();
    }
  }, [stops]);

  // Compute elevation stats based on the successfully processed stops
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
        zoom: 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Draw the route line connecting the stops
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

        // Add custom markers for each stop
        const bounds = new mapboxgl.LngLatBounds();

        processedStops.forEach((stop, index) => {
          const el = document.createElement('div');
          el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform';
          
          if (index === 0) el.style.backgroundColor = '#10b981'; // Start
          else if (index === processedStops.length - 1) el.style.backgroundColor = '#ef4444'; // Finish
          else el.style.backgroundColor = '#3b82f6'; // Overnight

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

        // Fit map to show all pins
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      });
    }

    const resizeObserver = new ResizeObserver(() => map.current?.resize());
    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [processedStops, isProcessing]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // UI STATES
  if (isProcessing) {
    return (
      <div className="w-full h-[450px] bg-muted/30 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="font-bold text-foreground">Generating Map...</p>
        <p className="text-sm">Auto-locating itinerary coordinates via Mapbox.</p>
      </div>
    );
  }

  if (!stops || stops.length === 0 || processedStops.length === 0) {
    return (
      <div className="w-full h-[450px] bg-muted/30 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="font-bold text-foreground">Interactive Map Unavailable</p>
        <p className="text-sm">We couldn't generate coordinates for this route.</p>
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
        {!MAPBOX_TOKEN && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 backdrop-blur-sm p-4 text-center">
            <div className="bg-background p-4 rounded-lg shadow-lg border border-border max-w-sm">
              <p className="text-sm font-bold text-foreground mb-2">Mapbox Token Missing</p>
              <p className="text-xs text-muted-foreground">
                Please configure <code className="bg-muted px-1 py-0.5 rounded">VITE_MAPBOX_TOKEN</code>
              </p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
