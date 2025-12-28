import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/maps';

interface Property {
  id: string;
  property_id: string;
  address: string;
  city?: string;
  state?: string;
  county?: string;
  property_type?: string | null;
  bpo?: number | null;
  upb?: number | null;
  deal_stage: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface PropertyTableProps {
  properties: Property[];
  onViewProperty: (property: Property) => void;
  onViewOnMap: (property: Property) => void;
  isLoading?: boolean;
}

export function PropertyTable({
  properties,
  onViewProperty,
  onViewOnMap,
  isLoading = false,
}: PropertyTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; label: string }> = {
      'Active': { class: 'status-active', label: 'Active' },
      'Litigation': { class: 'status-litigation', label: 'Litigation' },
      'Under Contract': { class: 'status-contract', label: 'Under Contract' },
      'Closed': { class: 'status-closed', label: 'Closed' },
      'Pipeline': { class: 'bg-purple-500/20 text-purple-400', label: 'Pipeline' },
      'Due Diligence': { class: 'status-active', label: 'Due Diligence' },
    };
    const v = variants[status] || variants['Active'];
    return <Badge className={v.class}>{v.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No properties found</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Property ID</TableHead>
            <TableHead className="text-muted-foreground">Address</TableHead>
            <TableHead className="text-muted-foreground">City</TableHead>
            <TableHead className="text-muted-foreground">County</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground text-right">BPO</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id} className="border-border hover:bg-secondary/50">
              <TableCell className="font-mono text-sm text-muted-foreground">
                {property.property_id}
              </TableCell>
              <TableCell className="font-medium">{property.address}</TableCell>
              <TableCell className="text-muted-foreground">
                {property.city}, {property.state}
              </TableCell>
              <TableCell className="text-muted-foreground">{property.county || '-'}</TableCell>
              <TableCell className="text-muted-foreground">
                {property.property_type || '-'}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(property.bpo)}
              </TableCell>
              <TableCell>{getStatusBadge(property.deal_stage)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {property.latitude && property.longitude && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewOnMap(property)}
                      title="View on map"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewProperty(property)}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
