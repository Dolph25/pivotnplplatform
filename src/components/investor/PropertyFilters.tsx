import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface FilterState {
  city: string;
  propertyType: string;
  occupancyStatus: string;
  dealStage: string;
  priceRange: [number, number];
  roiRange: [number, number];
}

interface PropertyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  cities: string[];
  propertyTypes: string[];
  maxPrice: number;
}

export const defaultFilters: FilterState = {
  city: 'all',
  propertyType: 'all',
  occupancyStatus: 'all',
  dealStage: 'all',
  priceRange: [0, 1000000],
  roiRange: [0, 100],
};

export function PropertyFilters({
  filters,
  onFiltersChange,
  cities,
  propertyTypes,
  maxPrice,
}: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const activeFilterCount = [
    filters.city !== 'all',
    filters.propertyType !== 'all',
    filters.occupancyStatus !== 'all',
    filters.dealStage !== 'all',
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice,
    filters.roiRange[0] > 0 || filters.roiRange[1] < 100,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({ ...defaultFilters, priceRange: [0, maxPrice] });
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-3">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-muted-foreground">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      <CollapsibleContent className="mt-4">
        <div className="glass-card p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* City Filter */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">City</label>
              <Select
                value={filters.city}
                onValueChange={(value) => updateFilter('city', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Property Type</label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => updateFilter('propertyType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Occupancy Status Filter */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Occupancy</label>
              <Select
                value={filters.occupancyStatus}
                onValueChange={(value) => updateFilter('occupancyStatus', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deal Stage Filter */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Deal Stage</label>
              <Select
                value={filters.dealStage}
                onValueChange={(value) => updateFilter('dealStage', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Contract">Under Contract</SelectItem>
                  <SelectItem value="Due Diligence">Due Diligence</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground font-medium">Strike Price Range</label>
              <span className="text-xs text-primary font-medium">
                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </span>
            </div>
            <Slider
              value={filters.priceRange}
              min={0}
              max={maxPrice}
              step={10000}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              className="py-2"
            />
          </div>

          {/* ROI Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground font-medium">Est. ROI Range</label>
              <span className="text-xs text-primary font-medium">
                {filters.roiRange[0]}% - {filters.roiRange[1]}%
              </span>
            </div>
            <Slider
              value={filters.roiRange}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => updateFilter('roiRange', value as [number, number])}
              className="py-2"
            />
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {filters.city !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  City: {filters.city}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => updateFilter('city', 'all')}
                  />
                </Badge>
              )}
              {filters.propertyType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Type: {filters.propertyType}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => updateFilter('propertyType', 'all')}
                  />
                </Badge>
              )}
              {filters.occupancyStatus !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.occupancyStatus}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => updateFilter('occupancyStatus', 'all')}
                  />
                </Badge>
              )}
              {filters.dealStage !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Stage: {filters.dealStage}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => updateFilter('dealStage', 'all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
