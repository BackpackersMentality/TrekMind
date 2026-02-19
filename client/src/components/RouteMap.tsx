import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Stop {
  day: number;
  location: string;
  lat: number;
  lng: number;
  elevation: number;
}

interface RouteMapProps {
  stops: Stop[];
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ stops }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Compute elevation stats
  const stats = useMemo(() => {
    let totalAscent = 0;
    let totalDescent = 0;
    for (let i = 1; i < stops.length; i++) {
      const diff = stops[i].elevation - stops[i - 1].elevation;
      if (diff > 0) totalAscent += diff;
      else totalDescent += Math.abs(diff);
    }
    return { totalAscent, totalDescent };
  }, [stops]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || stops.length === 0) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [stops[0].lng, stops[0].lat],
        zoom: 9,
        attributionControl: false
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add route source
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: stops.map(s => [s.lng, s.lat])
            }
          }
        });

        // Add route layer
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1e40af',
            'line-width': 4
          }
        });

        // Add markers
        stops.forEach((stop, index) => {
          let color = '#3b82f6'; // Default blue
          if (index === 0) color = '#10b981'; // Start green
          if (index === stops.length - 1) color = '#ef4444'; // End red

          new mapboxgl.Marker({ color, scale: index === 0 || index === stops.length - 1 ? 1 : 0.6 })
            .setLngLat([stop.lng, stop.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <h4 class="font-bold">Day ${stop.day}: ${stop.location}</h4>
                <p class="text-xs">${stop.elevation}m altitude</p>
              </div>
            `))
            .addTo(map.current!);
        });

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        stops.forEach(stop => bounds.extend([stop.lng, stop.lat]));
        map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
      });
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => map.current?.resize());
    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [stops]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 text-xs font-medium text-muted-foreground mb-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Start
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Overnight
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Finish
        </div>
      </div>
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-sm">
        {!MAPBOX_TOKEN && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 backdrop-blur-sm p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please configure <code className="bg-background px-1 rounded">VITE_MAPBOX_TOKEN</code> to view the route map.
            </p>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
