import React, { useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/maps';

interface StreetViewProps {
  address: string;
}

export function StreetView({ address }: StreetViewProps) {
  const [imageError, setImageError] = useState(false);

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&fov=90&heading=0&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>📸</span> Street View
      </h3>
      {imageError ? (
        <div className="h-48 bg-secondary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl mb-2 block">⚠️</span>
            <p className="text-muted-foreground text-sm">Street View not available for this location</p>
          </div>
        </div>
      ) : (
        <img
          src={streetViewUrl}
          alt={`Street view of ${address}`}
          className="w-full h-48 object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
