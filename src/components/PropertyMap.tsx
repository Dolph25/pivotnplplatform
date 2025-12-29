import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/maps';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_ACCESS_TOKEN) {
      setMapError('No Mapbox token available');
      setIsLoading(false);
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [longitude, latitude],
        zoom: 15,
        pitch: 45,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('load', () => {
        if (!map.current) return;
        setIsLoading(false);
        setMapError(null);

        // Add 3D buildings layer
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        map.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#374151',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.7,
            },
          },
          labelLayerId
        );
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map');
        setIsLoading(false);
      });

      // Add marker
      marker.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<p class="text-slate-900 font-medium text-sm">${address}</p>`))
        .addTo(map.current);

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, address]);

  if (mapError) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🗺️</span> Property Location
        </h3>
        <div className="h-72 bg-secondary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Map Unavailable</p>
            <p className="text-muted-foreground text-sm">{mapError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>🗺️</span> Property Location
      </h3>
      <div className="relative h-72 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
