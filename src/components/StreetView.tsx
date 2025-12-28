import React, { useState } from 'react';

interface StreetViewProps {
  address: string;
}

export function StreetView({ address }: StreetViewProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [imageError, setImageError] = useState(false);

  const streetViewUrl = apiKey 
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&fov=90&heading=0&pitch=0&key=${apiKey}`
    : '';

  const handleLoadStreetView = () => {
    if (apiKey) {
      setShowKeyInput(false);
      setImageError(false);
    }
  };

  if (showKeyInput) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📸</span> Street View
        </h3>
        <div className="bg-secondary/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Enter your Google Maps API key to enable Street View. Get one at{' '}
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="input-field mb-3"
          />
          <button
            onClick={handleLoadStreetView}
            disabled={!apiKey}
            className="btn-primary w-full"
          >
            Load Street View
          </button>
        </div>
        {/* Placeholder */}
        <div className="h-48 bg-secondary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl mb-2 block">🏠</span>
            <p className="text-muted-foreground text-sm">Street View will appear here</p>
          </div>
        </div>
      </div>
    );
  }

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
