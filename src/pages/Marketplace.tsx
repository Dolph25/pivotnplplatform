import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { MarketplacePropertyCard } from '@/components/marketplace/MarketplacePropertyCard';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Grid3X3, List, Building2, Sparkles, TrendingUp, MapPin } from 'lucide-react';
import { PropertyDetailModal } from '@/components/investor/PropertyDetailModal';

const Marketplace = () => {
  const { user, signOut } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [qualityScoreRange, setQualityScoreRange] = useState<[number, number]>([0, 100]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load marketplace properties');
    } finally {
      setLoading(false);
    }
  };

  // Parse AI analysis to get deal quality score
  const getQualityScore = (property: any): number | null => {
    if (!property.ai_analysis) return null;
    try {
      const analysis = JSON.parse(property.ai_analysis);
      return analysis.deal_quality_score ?? null;
    } catch {
      return null;
    }
  };

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Text search (city or zip)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.city?.toLowerCase().includes(searchLower) ||
        p.zip_code?.toLowerCase().includes(searchLower) ||
        p.address?.toLowerCase().includes(searchLower);

      // Deal Quality Score filter
      const score = getQualityScore(p);
      const matchesScore =
        score === null || (score >= qualityScoreRange[0] && score <= qualityScoreRange[1]);

      return matchesSearch && matchesScore;
    });
  }, [properties, searchQuery, qualityScoreRange]);

  // Stats
  const stats = useMemo(() => {
    const withScore = properties.filter((p) => getQualityScore(p) !== null);
    const avgScore = withScore.length
      ? Math.round(withScore.reduce((sum, p) => sum + (getQualityScore(p) || 0), 0) / withScore.length)
      : 0;
    return {
      total: properties.length,
      analyzed: withScore.length,
      avgScore,
    };
  }, [properties]);

  const handleAnalyze = async (property: any) => {
    setAnalyzingId(property.property_id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-property`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ property_id: property.property_id }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }

      const result = await response.json();
      toast.success(`Analysis complete! Score: ${result.analysis?.deal_quality_score ?? 'N/A'}`);

      // Refresh properties to get updated ai_analysis
      await fetchProperties();
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewDetails = (property: any) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Property Marketplace
            </h1>
          </div>
          <p className="text-muted-foreground">
            Discover AI-analyzed distressed properties with deal quality scores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.analyzed}</p>
              <p className="text-sm text-muted-foreground">AI Analyzed</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgScore}</p>
              <p className="text-sm text-muted-foreground">Avg. Quality Score</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, zip code, or address..."
              className="pl-10"
            />
          </div>
          <MarketplaceFilters
            qualityScoreRange={qualityScoreRange}
            onQualityScoreChange={setQualityScoreRange}
          />
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProperties.map((property) => (
              <MarketplacePropertyCard
                key={property.id}
                property={property}
                viewMode={viewMode}
                onAnalyze={() => handleAnalyze(property)}
                onViewDetails={() => handleViewDetails(property)}
                isAnalyzing={analyzingId === property.property_id}
              />
            ))}
          </div>
        )}
      </main>

      <PropertyDetailModal
        property={selectedProperty}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Pivot Investments • AI-Powered Property Analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;
