import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Geocoder Imports
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface Stop {
  day: number;
  location: string;
  lat: number;
  lng: number;
  elevation: number | string;
}

interface RouteMapProps {
  stops: Stop[];
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ stops }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Compute elevation stats safely
  const stats = useMemo(() => {
    let totalAscent = 0;
    let totalDescent = 0;
    for (let i = 1; i < stops.length; i++) {
      const currentElev = Number(stops[i].elevation) || 0;
      const prevElev = Number(stops[i - 1].elevation) || 0;
      const diff = currentElev - prevElev;
      
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
        zoom: 10,
      });

      // ✅ Initialize and add the Geocoder Search Box
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any,
        marker: true,
        placeholder: 'Search nearby towns or trails...'
      });
      
      map.current.addControl(geocoder, 'top-right');

      // Add navigation controls (zoom in/out/rotate)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Draw the route line connecting the stops
        const coordinates = stops.map(stop => [stop.lng, stop.lat]);
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-dasharray': [2, 2]
          }
        });

        // Add custom markers for each stop
        const bounds = new mapboxgl.LngLatBounds();

        stops.forEach((stop, index) => {
          const el = document.createElement('div');
          el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-md';
          
          if (index === 0) el.style.backgroundColor = '#10b981'; // Start: Green
          else if (index === stops.length - 1) el.style.backgroundColor = '#ef4444'; // Finish: Red
          else el.style.backgroundColor = '#3b82f6'; // Overnight: Blue

          // Create Popup
          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="padding: 4px; font-family: sans-serif;">
              <strong style="font-size: 14px;">Day ${stop.day}</strong><br/>
              <span style="color: #666;">${stop.location}</span><br/>
              ${stop.elevation ? `<span style="font-weight: bold;">${stop.elevation}m</span>` : ''}
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([stop.lng, stop.lat])
            .setPopup(popup)
            .addTo(map.current!);

          bounds.extend([stop.lng, stop.lat]);
        });

        // Fit map to show the entire route with padding
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      });
    }

    // Handle map resize observer
    const resizeObserver = new ResizeObserver(() => map.current?.resize());
    resizeObserver.observe(mapContainer.current);

    return () => resizeObserver.disconnect();
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
      {/* Map Legend & Stats */}
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
        <div className="flex gap-3">
          <span className="text-[#10b981]">↑ {stats.totalAscent}m</span>
          <span className="text-[#ef4444]">↓ {stats.totalDescent}m</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-border shadow-sm">
        {!MAPBOX_TOKEN && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 backdrop-blur-sm p-4 text-center">
            <div className="bg-background p-4 rounded-lg shadow-lg border border-border max-w-sm">
              <p className="text-sm font-bold text-foreground mb-2">Mapbox Token Missing</p>
              <p className="text-xs text-muted-foreground">
                Please configure <code className="bg-muted px-1 py-0.5 rounded">VITE_MAPBOX_TOKEN</code> in your environment variables.
              </p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
