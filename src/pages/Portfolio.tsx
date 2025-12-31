import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { InvestorMetrics } from '@/components/investor/InvestorMetrics';
import { PortfolioMap } from '@/components/investor/PortfolioMap';
import { DealPipeline } from '@/components/investor/DealPipeline';
import { GeographicDistribution } from '@/components/investor/GeographicDistribution';
import { PropertyTable } from '@/components/investor/PropertyTable';
import { PropertyDetailModal } from '@/components/investor/PropertyDetailModal';
import { PropertyFilters, FilterState, defaultFilters } from '@/components/investor/PropertyFilters';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, List, Download } from 'lucide-react';
import { exportPropertiesToCSV, exportPropertiesToExcel } from '@/utils/dataExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Portfolio = () => {
  const { user, signOut } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, pipelineRes] = await Promise.all([
        supabase.from('properties').select('*').eq('is_active', true).limit(500),
        supabase.from('v_deal_pipeline').select('*'),
      ]);

      if (propertiesRes.error) throw propertiesRes.error;
      if (pipelineRes.error) throw pipelineRes.error;

      setProperties(propertiesRes.data || []);
      setPipelineData(pipelineRes.data || []);
      
      // Update max price for filters
      const maxStrikePrice = Math.max(...(propertiesRes.data || []).map(p => p.strike_price || 0), 500000);
      setFilters(prev => ({ ...prev, priceRange: [0, maxStrikePrice] }));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter dropdowns
  const { cities, propertyTypes, maxPrice } = useMemo(() => {
    const uniqueCities = [...new Set(properties.map(p => p.city).filter(Boolean))].sort();
    const uniqueTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))].sort();
    const maxStrikePrice = Math.max(...properties.map(p => p.strike_price || 0), 500000);
    return { cities: uniqueCities, propertyTypes: uniqueTypes, maxPrice: maxStrikePrice };
  }, [properties]);

  // Apply all filters
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Text search
      const matchesSearch = 
        p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.county?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // City filter
      const matchesCity = filters.city === 'all' || p.city === filters.city;
      
      // Property type filter
      const matchesType = filters.propertyType === 'all' || p.property_type === filters.propertyType;
      
      // Occupancy filter
      const matchesOccupancy = filters.occupancyStatus === 'all' || p.occupancy_status === filters.occupancyStatus;
      
      // Deal stage filter
      const matchesStage = filters.dealStage === 'all' || p.deal_stage === filters.dealStage;
      
      // Price range filter
      const strikePrice = p.strike_price || 0;
      const matchesPrice = strikePrice >= filters.priceRange[0] && strikePrice <= filters.priceRange[1];
      
      // ROI range filter
      const roi = p.estimated_roi || 0;
      const matchesROI = roi >= filters.roiRange[0] && roi <= filters.roiRange[1];
      
      return matchesSearch && matchesCity && matchesType && matchesOccupancy && matchesStage && matchesPrice && matchesROI;
    });
  }, [properties, searchQuery, filters]);

  const countyData = properties.reduce((acc: any[], p) => {
    if (!p.county) return acc;
    const existing = acc.find((c) => c.county === p.county);
    if (existing) {
      existing.count++;
      existing.totalValue += Number(p.bpo) || 0;
    } else {
      acc.push({ county: p.county, count: 1, totalValue: Number(p.bpo) || 0 });
    }
    return acc;
  }, []);

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Investor Portfolio
          </h1>
          <p className="text-muted-foreground">
            Distress Engineered: Where AI Finds the Deal and Crypto Funds the Close
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8">
          <InvestorMetrics />
        </div>

        {/* Portfolio Map */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <PortfolioMap
              properties={filteredProperties}
              onPropertyClick={handlePropertyClick}
              height="500px"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DealPipeline data={pipelineData} />
          <GeographicDistribution data={countyData} />
        </div>

        {/* Properties Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-display font-semibold">Properties ({filteredProperties.length})</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="pl-9 w-64"
                  />
                </div>
                
                {/* Export Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportPropertiesToCSV(filteredProperties)}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportPropertiesToExcel(filteredProperties)}>
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="rounded-none"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              cities={cities}
              propertyTypes={propertyTypes}
              maxPrice={maxPrice}
            />
          </div>

          <PropertyTable
            properties={filteredProperties}
            onViewProperty={handlePropertyClick}
            onViewOnMap={handlePropertyClick}
            isLoading={loading}
          />
        </div>
      </main>

      <PropertyDetailModal
        property={selectedProperty}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>
            © 2024 Pivot Investments • LJ Integrated AI AutoAgents •{' '}
            <span className="text-primary">Powered by Lovable AI & Mapbox</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
