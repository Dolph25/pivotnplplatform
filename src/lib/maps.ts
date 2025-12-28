import mapboxgl from 'mapbox-gl';

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDaDC8cgO8moRKDJn5w7k1Vyiw2gUmu1I8';

export const initializeMap = (
  container: string | HTMLElement,
  options?: Partial<mapboxgl.MapboxOptions>
): mapboxgl.Map => {
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-74.006, 40.7128],
    zoom: 10,
    ...options,
  });
};

export const getStreetViewUrl = (
  address: string,
  apiKey: string,
  width = 600,
  height = 400
): string => {
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodeURIComponent(address)}&fov=90&heading=0&pitch=0&key=${apiKey}`;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Active': '#06b6d4',
    'Litigation': '#f59e0b',
    'Under Contract': '#3b82f6',
    'Closed': '#10b981',
    'Pipeline': '#8b5cf6',
    'Due Diligence': '#06b6d4',
    'REO': '#ef4444',
  };
  return statusColors[status] || '#06b6d4';
};

export const add3DBuildings = (map: mapboxgl.Map): void => {
  const layers = map.getStyle()?.layers;
  if (!layers) return;

  const labelLayerId = layers.find(
    (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
  )?.id;

  map.addLayer(
    {
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#1e293b',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.6,
      },
    },
    labelLayerId
  );
};

export const createPropertyPopup = (property: {
  address: string;
  city?: string;
  state?: string;
  bpo?: number | null;
  deal_stage?: string;
  property_type?: string | null;
}): string => {
  const bpoFormatted = property.bpo
    ? `$${Number(property.bpo).toLocaleString()}`
    : 'N/A';

  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-semibold text-sm mb-1">${property.address}</h3>
      <p class="text-xs text-muted-foreground mb-2">${property.city || ''}, ${property.state || ''}</p>
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">BPO:</span>
        <span class="font-medium">${bpoFormatted}</span>
      </div>
      ${property.deal_stage ? `
        <div class="flex items-center justify-between text-xs mt-1">
          <span class="text-muted-foreground">Status:</span>
          <span class="font-medium">${property.deal_stage}</span>
        </div>
      ` : ''}
      ${property.property_type ? `
        <div class="flex items-center justify-between text-xs mt-1">
          <span class="text-muted-foreground">Type:</span>
          <span class="font-medium">${property.property_type}</span>
        </div>
      ` : ''}
    </div>
  `;
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(1)}%`;
};
