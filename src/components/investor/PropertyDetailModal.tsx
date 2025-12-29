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
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatPercent, MAPBOX_ACCESS_TOKEN, GOOGLE_MAPS_API_KEY } from '@/lib/maps';


interface Property {
  id: string;
  property_id?: string;
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
  lot_size?: number | null;
  bpo?: number | null;
  arv?: number | null;
  upb?: number | null;
  strike_price?: number | null;
  ltv_ratio?: number | null;
  discount_to_bpo?: number | null;
  deal_stage: string;
  estimated_roi?: number | null;
  estimated_irr?: number | null;
  risk_score?: number | null;
  ai_analysis?: string | null;
  // Loan details
  original_loan_amount?: number | null;
  current_interest_rate?: number | null;
  original_interest_rate?: number | null;
  loan_origination_date?: string | null;
  maturity_date?: string | null;
  last_payment_date?: string | null;
  days_since_last_payment?: number | null;
  lien_position?: number | null;
  original_lender?: string | null;
  current_servicer?: string | null;
  // Balances
  total_balance?: number | null;
  accrued_interest?: number | null;
  escrow_balance?: number | null;
  corporate_advances?: number | null;
  deferred_balance?: number | null;
  // Status flags
  occupancy_status?: string | null;
  owner_occupied?: boolean | null;
  foreclosure_flag?: boolean | null;
  bankruptcy_flag?: boolean | null;
  notes?: string | null;
}

interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailModal({
  property,
  open,
  onOpenChange,
}: PropertyDetailModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [streetViewError, setStreetViewError] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!open || !property?.latitude || !property?.longitude || !mapContainer.current) {
      return;
    }

    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError(true);
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

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

      map.current.on('error', () => {
        setMapError(true);
      });
    } catch (error) {
      console.error('Map error:', error);
      setMapError(true);
    }

    return () => {
      map.current?.remove();
    };
  }, [open, property]);

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

  const streetViewUrl = GOOGLE_MAPS_API_KEY
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(
        `${property.address}, ${property.city}, ${property.state}`
      )}&fov=90&heading=0&pitch=0&key=${GOOGLE_MAPS_API_KEY}`
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
            <TabsTrigger value="loan">Loan Details</TabsTrigger>
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
                label="Bed / Bath"
                value={`${property.bedrooms || '-'} / ${property.bathrooms || '-'}`}
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
              <DetailItem
                icon={<Home className="w-4 h-4" />}
                label="Units"
                value={property.num_units?.toString() || '1'}
              />
              <DetailItem
                icon={<MapPin className="w-4 h-4" />}
                label="Occupancy"
                value={property.occupancy_status || 'Unknown'}
              />
              <DetailItem
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Foreclosure"
                value={property.foreclosure_flag ? 'Yes' : 'No'}
              />
              <DetailItem
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Bankruptcy"
                value={property.bankruptcy_flag ? 'Yes' : 'No'}
              />
            </div>

            {/* Notes */}
            {property.notes && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground font-medium mb-2">Notes</p>
                <p className="text-sm">{property.notes}</p>
              </div>
            )}

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
              <MetricCard label="ARV" value={formatCurrency(property.arv)} />
              <MetricCard label="Strike Price" value={formatCurrency(property.strike_price)} highlight />
              <MetricCard label="UPB" value={formatCurrency(property.upb)} />
              <MetricCard label="Total Balance" value={formatCurrency(property.total_balance)} />
              <MetricCard label="Discount to BPO" value={formatPercent(property.discount_to_bpo ? property.discount_to_bpo * 100 : null)} />
              <MetricCard label="LTV Ratio" value={formatPercent(property.ltv_ratio ? property.ltv_ratio * 100 : null)} />
              <MetricCard label="Est. ROI" value={formatPercent(property.estimated_roi)} highlight />
              <MetricCard label="Est. IRR" value={formatPercent(property.estimated_irr)} highlight />
            </div>

            {/* Balance Breakdown */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Balance Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Accrued Interest</p>
                  <p className="font-medium">{formatCurrency(property.accrued_interest)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Escrow Balance</p>
                  <p className="font-medium">{formatCurrency(property.escrow_balance)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Corporate Advances</p>
                  <p className="font-medium">{formatCurrency(property.corporate_advances)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deferred Balance</p>
                  <p className="font-medium">{formatCurrency(property.deferred_balance)}</p>
                </div>
              </div>
            </div>

            {/* Risk Score */}
            {property.risk_score && (
              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          property.risk_score <= 30 ? 'bg-green-500' :
                          property.risk_score <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${property.risk_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{property.risk_score}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="loan" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard label="Original Loan Amount" value={formatCurrency(property.original_loan_amount)} />
              <MetricCard label="Current Interest Rate" value={formatPercent(property.current_interest_rate)} />
              <MetricCard label="Original Interest Rate" value={formatPercent(property.original_interest_rate)} />
              <MetricCard label="Lien Position" value={property.lien_position?.toString() || 'N/A'} />
              <MetricCard 
                label="Days Since Last Payment" 
                value={property.days_since_last_payment?.toString() || 'N/A'} 
                highlight={property.days_since_last_payment && property.days_since_last_payment > 180}
              />
              <MetricCard label="UPB" value={formatCurrency(property.upb)} />
            </div>

            {/* Loan Timeline */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Loan Timeline</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Origination Date</p>
                  <p className="font-medium">
                    {property.loan_origination_date 
                      ? new Date(property.loan_origination_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Payment Date</p>
                  <p className="font-medium">
                    {property.last_payment_date 
                      ? new Date(property.last_payment_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Maturity Date</p>
                  <p className="font-medium">
                    {property.maturity_date 
                      ? new Date(property.maturity_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Servicer Info */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Servicer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Original Lender</p>
                  <p className="font-medium">{property.original_lender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Servicer</p>
                  <p className="font-medium">{property.current_servicer || 'N/A'}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            {mapError ? (
              <div className="w-full h-80 rounded-lg overflow-hidden border border-border bg-secondary flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-foreground font-medium text-sm">Map Unavailable</p>
                  <p className="text-muted-foreground text-xs">Unable to load map</p>
                </div>
              </div>
            ) : (
              <div
                ref={mapContainer}
                className="w-full h-80 rounded-lg overflow-hidden border border-border"
              />
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
