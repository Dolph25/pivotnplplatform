import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getStatusColor, createPropertyPopup, add3DBuildings, MAPBOX_ACCESS_TOKEN } from '@/lib/maps';
import { Loader2, Layers, Map as MapIcon, Satellite, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  bpo?: number | null;
  deal_stage: string;
  property_type?: string | null;
}

interface PortfolioMapProps {
  properties: Property[];
  mapboxToken?: string;
  onPropertyClick?: (property: Property) => void;
  height?: string;
  showControls?: boolean;
}

export function PortfolioMap({
  properties,
  mapboxToken,
  onPropertyClick,
  height = '400px',
  showControls = true,
}: PortfolioMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [show3D, setShow3D] = useState(false);

  // Use provided token or fall back to default
  const activeToken = mapboxToken || MAPBOX_ACCESS_TOKEN;

  const styleUrls: Record<string, string> = {
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  };

  useEffect(() => {
    if (!mapContainer.current || !activeToken) {
      setMapError('No Mapbox token available');
      setIsLoading(false);
      return;
    }

    try {
      mapboxgl.accessToken = activeToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: styleUrls[mapStyle],
        center: [-74.006, 40.7128],
        zoom: 8,
        pitch: show3D ? 45 : 0,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoading(false);
        setMapError(null);
        if (show3D && map.current) {
          add3DBuildings(map.current);
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map. Please check your connection.');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [activeToken, mapStyle, show3D]);

  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter properties with valid coordinates
    const validProperties = properties.filter(
      p => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
    );

    if (validProperties.length === 0) return;

    // Add markers
    validProperties.forEach(property => {
      const color = getStatusColor(property.deal_stage);
      
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '3px solid rgba(255,255,255,0.8)';
      el.style.cursor = 'pointer';
      el.style.boxShadow = `0 0 10px ${color}`;
      el.style.transition = 'transform 0.2s';
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        createPropertyPopup(property)
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.longitude!, property.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPropertyClick?.(property);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all properties
    if (validProperties.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validProperties.forEach(p => {
        bounds.extend([p.longitude!, p.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    } else if (validProperties.length === 1) {
      map.current.flyTo({
        center: [validProperties[0].longitude!, validProperties[0].latitude!],
        zoom: 14,
      });
    }
  }, [properties, isLoading, onPropertyClick]);

  const handleStyleChange = (style: 'dark' | 'streets' | 'satellite') => {
    setMapStyle(style);
    setIsLoading(true);
  };

  if (mapError) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/50 flex items-center justify-center" style={{ height }}>
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Map Unavailable</p>
          <p className="text-muted-foreground text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-border" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-card/80 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
      
      {showControls && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg p-1 flex flex-col gap-1 border border-border">
            <Button
              variant={mapStyle === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStyleChange('dark')}
              className="justify-start"
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Dark
            </Button>
            <Button
              variant={mapStyle === 'streets' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStyleChange('streets')}
              className="justify-start"
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Streets
            </Button>
            <Button
              variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStyleChange('satellite')}
              className="justify-start"
            >
              <Satellite className="w-4 h-4 mr-2" />
              Satellite
            </Button>
          </div>
          
          <Button
            variant={show3D ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShow3D(!show3D)}
            className="bg-card/90 backdrop-blur-sm border-border"
          >
            <Layers className="w-4 h-4 mr-2" />
            3D
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border z-10">
        <p className="text-xs font-medium mb-2 text-foreground">Property Status</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
            <span className="text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-muted-foreground">Litigation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-muted-foreground">Contract</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span className="text-muted-foreground">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
