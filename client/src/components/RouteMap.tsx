import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  stops: any[] | null;
  trek: any;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ stops, trek }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const validStops = useMemo(() => {
    if (!stops || !Array.isArray(stops)) return [];
    return stops.filter(stop => stop.lat !== undefined && stop.lng !== undefined);
  }, [stops]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || !trek?.latitude || !trek?.longitude) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!map.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12', // ✅ Gives us beautiful satellite imagery
          center: [trek.longitude, trek.latitude],
          zoom: validStops.length > 0 ? 10 : 4,
          pitch: 60, // ✅ Tilts the camera for a 3D effect
          bearing: 0,
          projection: 'globe' as any // ✅ Turns the flat map into a 3D Globe!
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('style.load', () => {
          if (!map.current) return;

          // ✅ Add Atmosphere (Space background and horizon glow)
          map.current.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          });

          // ✅ Add 3D Mountain Terrain
          map.current.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
          map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        });

        map.current.on('load', () => {
          if (!map.current) return;
          const bounds = new mapboxgl.LngLatBounds();

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
              el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform';
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
            // Fallback to the main trek location
            const el = document.createElement('div');
            el.className = 'w-5 h-5 rounded-full border-2 border-white shadow-lg';
            el.style.backgroundColor = '#f59e0b'; 

            const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
              <div style="padding: 4px; font-family: sans-serif;">
                <strong>${trek.name}</strong><br/>
                <span style="color: #666;">${trek.region}, ${trek.country}</span>
              </div>
            `);

            new mapboxgl.Marker(el).setLngLat([trek.longitude, trek.latitude]).setPopup(popup).addTo(map.current!);
            
            // For a single point on a globe, we just fly to it instead of fitting bounds
            map.current.flyTo({ center: [trek.longitude, trek.latitude], zoom: 8, essential: true });
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
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
