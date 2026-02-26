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
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [trek.longitude, trek.latitude],
          zoom: validStops.length > 0 ? 11.5 : 9, // Zoomed in closer
          pitch: 75, // ✅ EXTREME TILT: Look *at* the mountains, not *down* at them
          bearing: 45, // ✅ Rotate camera slightly for perspective
          projection: 'globe' as any
        });

        map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.current.on('style.load', () => {
          if (!map.current) return;

          // ✅ 1. Turn on the 3D DEM (Digital Elevation Model)
          map.current.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
          
          // Exaggerate mountains by 1.8x to make them look dramatic
          map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.8 });

          // ✅ 2. Add realistic Sky/Atmosphere Layer
          map.current.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 0.0],
              'sky-atmosphere-sun-intensity': 15
            }
          });

          map.current.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)'
          });
        });

        map.current.on('load', () => {
          if (!map.current) return;
          const bounds = new mapboxgl.LngLatBounds();

          if (validStops.length > 0) {
            const coordinates = validStops.map(stop => [stop.lng, stop.lat]);
            
            // Draw the route line hovering slightly above the 3D ground
            map.current.addSource('route', {
              type: 'geojson',
              data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
            });

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#facc15', 'line-width': 5, 'line-dasharray': [2, 2] } // Bright yellow to pop against satellite
            });

            validStops.forEach((stop, index) => {
              const el = document.createElement('div');
              el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-xl cursor-pointer hover:scale-125 transition-transform';
              el.style.backgroundColor = index === 0 ? '#10b981' : index === validStops.length - 1 ? '#ef4444' : '#3b82f6';

              const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div style="padding: 4px; font-family: sans-serif; color: black;">
                  <strong>Day ${stop.day}</strong><br/>
                  <span>${stop.location || stop.route || 'Checkpoint'}</span>
                </div>
              `);

              new mapboxgl.Marker(el).setLngLat([stop.lng, stop.lat]).setPopup(popup).addTo(map.current!);
              bounds.extend([stop.lng, stop.lat]);
            });
            
            // Fit bounds with pitch preserved!
            map.current.fitBounds(bounds, { padding: 80, maxZoom: 13, pitch: 75, bearing: 45 })
            
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
