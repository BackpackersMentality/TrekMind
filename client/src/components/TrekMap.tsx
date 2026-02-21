import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface TrekMapProps {
  stops: Array<{
    day: number;
    location: string;
    lat: number;
    lng: number;
    elevation?: number | string;
  }>;
  centerLat?: number;
  centerLng?: number;
}

export default function TrekMap({ stops, centerLat, centerLng }: TrekMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Check if token exists
    if (!mapboxgl.accessToken) {
      setMapError(true);
      console.error('Mapbox token not configured');
      return;
    }

    try {
      // Calculate center from stops or use provided coords
      const center: [number, number] = centerLng && centerLat 
        ? [centerLng, centerLat]
        : stops.length > 0 
          ? [stops[0].lng, stops[0].lat]
          : [0, 0];

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12', // Good for hiking
        center: center,
        zoom: 9,
        pitch: 45, // 3D tilt
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map to load
      map.current.on('load', () => {
        if (!map.current) return;

        // Add 3D terrain
        map.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // Create route line from stops
        if (stops.length > 1) {
          const coordinates = stops.map(stop => [stop.lng, stop.lat]);
          
          map.current?.addSource('route', {
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

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 3,
              'line-opacity': 0.8
            }
          });
        }

        // Add markers for each stop
        stops.forEach((stop, index) => {
          const el = document.createElement('div');
          el.className = 'trek-map-marker';
          el.style.backgroundColor = index === 0 ? '#10b981' : index === stops.length - 1 ? '#ef4444' : '#3b82f6';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.color = 'white';
          el.style.fontSize = '10px';
          el.style.fontWeight = 'bold';
          el.textContent = String(stop.day);

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 4px;">
              <strong>Day ${stop.day}</strong><br/>
              ${stop.location}<br/>
              ${stop.elevation ? `${stop.elevation}m` : ''}
            </div>`
          );

          new mapboxgl.Marker(el)
            .setLngLat([stop.lng, stop.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Fit map to show all markers
        if (stops.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          stops.forEach(stop => bounds.extend([stop.lng, stop.lat]));
          map.current?.fitBounds(bounds, { padding: 50 });
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [stops, centerLat, centerLng]);

  if (mapError) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-xl flex items-center justify-center">
        <p className="text-slate-500">Map unavailable. Please configure VITE_MAPBOX_TOKEN.</p>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-96 rounded-xl overflow-hidden shadow-lg" />
  );
}
