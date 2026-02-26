import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  stops: any[] | null;
  trek: any; // Accept the main trek data
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ stops, trek }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Extract any stops that actually have valid coordinates
  const validStops = useMemo(() => {
    if (!stops || !Array.isArray(stops)) return [];
    return stops.filter(stop => stop.lat !== undefined && stop.lng !== undefined);
  }, [stops]);

  useEffect(() => {
    // If no token or no main trek coordinates, exit gracefully
    if (!mapContainer.current || !MAPBOX_TOKEN || !trek?.latitude || !trek?.longitude) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!map.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [trek.longitude, trek.latitude], // Guaranteed to work!
          zoom: validStops.length > 0 ? 10 : 7, // Zoom out a bit if no specific route
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          if (!map.current) return;

          const bounds = new mapboxgl.LngLatBounds();

          // SCENARIO 1: We have a detailed itinerary with coordinates (e.g., Alta Via)
          if (validStops.length > 0) {
            const coordinates = validStops.map(stop => [stop.lng, stop.lat]);
            
            map.current.addSource('route', {
              type: 'geojson',
              data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
            });

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 2] }
            });

            validStops.forEach((stop, index) => {
              const el = document.createElement('div');
              el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-md';
              el.style.backgroundColor = index === 0 ? '#10b981' : index === validStops.length - 1 ? '#ef4444' : '#3b82f6';

              const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div style="padding: 4px; font-family: sans-serif;">
                  <strong>Day ${stop.day}</strong><br/>
                  <span style="color: #666;">${stop.location || stop.route || 'Checkpoint'}</span>
                </div>
              `);

              new mapboxgl.Marker(el).setLngLat([stop.lng, stop.lat]).setPopup(popup).addTo(map.current!);
              bounds.extend([stop.lng, stop.lat]);
            });
            
            map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
            
          } else {
            // SCENARIO 2: No specific itinerary coords. Drop one main pin for the Trek!
            const el = document.createElement('div');
            el.className = 'w-5 h-5 rounded-full border-2 border-white shadow-lg';
            el.style.backgroundColor = '#f59e0b'; // Amber pin for the main region

            const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
              <div style="padding: 4px; font-family: sans-serif;">
                <strong>${trek.name}</strong><br/>
                <span style="color: #666;">${trek.region}, ${trek.country}</span>
              </div>
            `);

            new mapboxgl.Marker(el).setLngLat([trek.longitude, trek.latitude]).setPopup(popup).addTo(map.current!);
          }
        });
      } catch (err) {
        console.error("Map initialization failed", err);
      }
    }

    const resizeObserver = new ResizeObserver(() => map.current?.resize());
    resizeObserver.observe(mapContainer.current);
    return () => resizeObserver.disconnect();
  }, [validStops, trek]);

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
