import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Home, MapPin, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StreetViewProps {
  address: string;
}

export function StreetView({ address }: StreetViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchStreetView = async () => {
      if (!address) {
        setIsLoading(false);
        setError('No address provided');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-street-view', {
          body: { address, width: 600, height: 400 }
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data.fallback || !data.available) {
          setIsAvailable(false);
          setImageUrl(null);
        } else if (data.url) {
          setImageUrl(data.url);
          setIsAvailable(true);
        }
      } catch (err) {
        console.error('Street View error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load street view');
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreetView();
  }, [address]);

  const handleImageError = () => {
    setIsAvailable(false);
    setImageUrl(null);
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary" />
        Street View
      </h3>
      
      {isLoading ? (
        <div className="h-48 bg-secondary/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Loading street view...</p>
          </div>
        </div>
      ) : imageUrl && isAvailable ? (
        <div className="relative h-48 rounded-lg overflow-hidden group">
          <img
            src={imageUrl}
            alt={`Street view of ${address}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-foreground text-sm font-medium truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {address}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-secondary/80 to-secondary rounded-lg flex items-center justify-center border border-border/50">
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-medium text-sm mb-1">Street View Unavailable</p>
            <p className="text-muted-foreground text-xs max-w-[200px] mx-auto">
              {error || "No imagery available for this location"}
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[180px]">{address}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
