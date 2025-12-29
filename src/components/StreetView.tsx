import React, { useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/maps';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface StreetViewProps {
  address: string;
}

export function StreetView({ address }: StreetViewProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&fov=90&heading=0&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>📸</span> Street View
      </h3>
      {imageError ? (
        <div className="h-48 bg-secondary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-foreground font-medium text-sm mb-1">Street View Unavailable</p>
            <p className="text-muted-foreground text-xs">No imagery for this location</p>
          </div>
        </div>
      ) : (
        <div className="relative h-48 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-secondary flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          <img
            src={streetViewUrl}
            alt={`Street view of ${address}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      )}
    </div>
  );
}
