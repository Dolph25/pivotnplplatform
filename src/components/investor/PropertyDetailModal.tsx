import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Home,
  DollarSign,
  Calendar,
  Building2,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  FileDown,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatPercent } from '@/lib/maps';

interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  county?: string;
  latitude?: number | null;
  longitude?: number | null;
  property_type?: string | null;
  num_units?: number | null;
  year_built?: number | null;
  square_feet?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  bpo?: number | null;
  upb?: number | null;
  strike_price?: number | null;
  ltv_ratio?: number | null;
  deal_stage: string;
  estimated_roi?: number | null;
  estimated_irr?: number | null;
  ai_analysis?: string | null;
}

interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapboxToken?: string;
  googleMapsKey?: string;
}

export function PropertyDetailModal({
  property,
  open,
  onOpenChange,
  mapboxToken,
  googleMapsKey,
}: PropertyDetailModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [streetViewError, setStreetViewError] = useState(false);

  useEffect(() => {
    if (!open || !property?.latitude || !property?.longitude || !mapboxToken || !mapContainer.current) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [property.longitude, property.latitude],
      zoom: 15,
      pitch: 45,
    });

    new mapboxgl.Marker({ color: '#06b6d4' })
      .setLngLat([property.longitude, property.latitude])
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [open, property, mapboxToken]);

  useEffect(() => {
    if (open && property && !property.ai_analysis && !aiDescription) {
      generateAIDescription();
    } else if (property?.ai_analysis) {
      setAiDescription(property.ai_analysis);
    }
  }, [open, property]);

  const generateAIDescription = async () => {
    if (!property) return;
    
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-property-description', {
        body: { property },
      });

      if (error) throw error;
      setAiDescription(data.description);
    } catch (error) {
      console.error('AI description error:', error);
      setAiDescription('AI-generated description unavailable.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const copyAddress = () => {
    if (!property) return;
    const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`;
    navigator.clipboard.writeText(fullAddress);
    toast.success('Address copied to clipboard');
  };

  const openDirections = () => {
    if (!property) return;
    const fullAddress = encodeURIComponent(
      `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`
    );
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${fullAddress}`, '_blank');
  };

  if (!property) return null;

  const streetViewUrl = googleMapsKey
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(
        `${property.address}, ${property.city}, ${property.state}`
      )}&fov=90&heading=0&pitch=0&key=${googleMapsKey}`
    : null;

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      'Active': 'status-active',
      'Litigation': 'status-litigation',
      'Under Contract': 'status-contract',
      'Closed': 'status-closed',
    };
    return classes[status] || 'status-active';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-display flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {property.address}
              </DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                {property.city}, {property.state} {property.zip_code}
                {property.county && ` • ${property.county} County`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getStatusClass(property.deal_stage)}>
                {property.deal_stage}
              </Badge>
              {property.property_type && (
                <Badge variant="outline">{property.property_type}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Street View / Property Image */}
            <div className="rounded-lg overflow-hidden border border-border">
              {streetViewUrl && !streetViewError ? (
                <img
                  src={streetViewUrl}
                  alt={`Street view of ${property.address}`}
                  className="w-full h-64 object-cover"
                  onError={() => setStreetViewError(true)}
                />
              ) : (
                <div className="w-full h-64 bg-secondary flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Street view not available
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Description */}
            <div className="ai-panel">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">AI Property Analysis</span>
              </div>
              {isLoadingAI ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating analysis...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiDescription || property.ai_analysis || 'No AI analysis available.'}
                </p>
              )}
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DetailItem
                icon={<Building2 className="w-4 h-4" />}
                label="Property Type"
                value={property.property_type || 'N/A'}
              />
              <DetailItem
                icon={<Home className="w-4 h-4" />}
                label="Units"
                value={property.num_units?.toString() || 'N/A'}
              />
              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Year Built"
                value={property.year_built?.toString() || 'N/A'}
              />
              <DetailItem
                icon={<Building2 className="w-4 h-4" />}
                label="Sq Ft"
                value={property.square_feet?.toLocaleString() || 'N/A'}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={copyAddress}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
              <Button variant="outline" size="sm" onClick={openDirections}>
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              <Button variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard label="BPO Value" value={formatCurrency(property.bpo)} />
              <MetricCard label="UPB" value={formatCurrency(property.upb)} />
              <MetricCard label="Strike Price" value={formatCurrency(property.strike_price)} />
              <MetricCard label="LTV Ratio" value={formatPercent(property.ltv_ratio)} />
              <MetricCard label="Est. ROI" value={formatPercent(property.estimated_roi)} highlight />
              <MetricCard label="Est. IRR" value={formatPercent(property.estimated_irr)} highlight />
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            <div
              ref={mapContainer}
              className="w-full h-80 rounded-lg overflow-hidden border border-border"
            />
            {!mapboxToken && (
              <div className="mt-4 p-4 bg-secondary rounded-lg text-center">
                <p className="text-muted-foreground text-sm">
                  Configure Mapbox token to enable interactive map
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'}`}>
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold font-display ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  );
}
