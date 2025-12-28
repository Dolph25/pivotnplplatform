import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapError, setMapError] = useState<string>('');

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;

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

      // Add marker
      marker.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<p class="text-slate-900 font-medium text-sm">${address}</p>`))
        .addTo(map.current);

      setShowTokenInput(false);
      setMapError('');
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Invalid Mapbox token. Please check and try again.');
    }
  };

  // Update marker position when coordinates change
  useEffect(() => {
    if (map.current && marker.current && !showTokenInput) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 1500,
      });
    }
  }, [latitude, longitude, showTokenInput]);

  // Cleanup
  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🗺️</span> Property Location Map
        </h3>
        <div className="bg-secondary/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Enter your Mapbox public token to enable the interactive map. Get one free at{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <input
            type="text"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="pk.eyJ1..."
            className="input-field mb-3"
          />
          {mapError && (
            <p className="text-destructive text-sm mb-3">{mapError}</p>
          )}
          <button
            onClick={() => initializeMap(mapboxToken)}
            disabled={!mapboxToken}
            className="btn-primary w-full"
          >
            Load Map
          </button>
        </div>
        {/* Placeholder map */}
        <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl mb-2 block">📍</span>
            <p className="text-muted-foreground text-sm">Map preview will appear here</p>
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
      <div ref={mapContainer} className="h-72 rounded-lg overflow-hidden" />
    </div>
  );
}
