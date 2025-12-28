import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PropertyForm } from '@/components/PropertyForm';
import { PropertyMap } from '@/components/PropertyMap';
import { StreetView } from '@/components/StreetView';
import { MetricsGrid } from '@/components/MetricsGrid';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { VerdictBadge } from '@/components/VerdictBadge';
import { AnalysisTabs } from '@/components/AnalysisTabs';
import { EmptyState } from '@/components/EmptyState';
import { SavedDealsPanel } from '@/components/SavedDealsPanel';
import { DealData, AnalysisResult, RiskFactor } from '@/types/deal';
import { calculateMetrics, getVerdict, calculateRiskFactors } from '@/utils/calculations';
import { exampleDeal } from '@/utils/exampleDeal';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [dealData, setDealData] = useState<DealData>(exampleDeal);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  
  const { analyzeWithAI, isLoading, insights } = useAIAnalysis();
  const { user, signOut } = useAuth();
  const { savedDeals, loading: dealsLoading, fetchDeals, saveDeal, deleteDeal } = useSavedDeals(user?.id);

  useEffect(() => {
    if (user) {
      fetchDeals();
    }
  }, [user, fetchDeals]);

  const currentMetrics = calculateMetrics(dealData);

  const handleAnalyze = async () => {
    const metrics = calculateMetrics(dealData);
    const verdict = getVerdict(metrics.roi);
    const risks = calculateRiskFactors(dealData, metrics);
    
    setAnalysis({
      metrics,
      insights: '',
      verdict
    });
    setRiskFactors(risks);

    try {
      const aiInsights = await analyzeWithAI(dealData);
      setAnalysis(prev => prev ? { ...prev, insights: aiInsights } : null);
    } catch {
      setAnalysis(prev => prev ? { 
        ...prev, 
        insights: 'AI analysis unavailable. Review the calculated metrics above for your investment decision.' 
      } : null);
    }
  };

  const handleSaveDeal = async () => {
    if (!user) {
      toast.error('Please sign in to save deals');
      return;
    }
    if (!analysis) {
      toast.error('Analyze the deal first');
      return;
    }

    await saveDeal(
      dealData,
      { roi: analysis.metrics.roi, irr: analysis.metrics.irr, profit: analysis.metrics.profit },
      analysis.verdict,
      analysis.insights
    );
  };

  const handleLoadDeal = (dealId: string) => {
    const deal = savedDeals.find(d => d.id === dealId);
    if (!deal) return;

    const loadedDealData: DealData = {
      address: deal.address,
      propertyType: deal.property_type,
      units: deal.units,
      bpoValue: Number(deal.bpo_value),
      strikePrice: Number(deal.strike_price),
      rehabCosts: Number(deal.rehab_costs),
      holdPeriod: deal.hold_period,
      exitStrategy: deal.exit_strategy,
      salePrice: Number(deal.sale_price),
      latitude: deal.latitude || 41.7003,
      longitude: deal.longitude || -73.923
    };
    
    setDealData(loadedDealData);
    
    // Recalculate metrics from the loaded deal data
    const loadedMetrics = calculateMetrics(loadedDealData);

    if (deal.verdict && deal.ai_insights) {
      setAnalysis({
        metrics: loadedMetrics,
        insights: deal.ai_insights,
        verdict: deal.verdict as 'buy' | 'consider' | 'pass'
      });
    }

    toast.success('Deal loaded');
  };

  const handleReset = () => {
    setDealData(exampleDeal);
    setAnalysis(null);
    setRiskFactors([]);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const displayInsights = isLoading ? insights : (analysis?.insights || '');

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {user && (
              <SavedDealsPanel
                deals={savedDeals}
                onLoadDeal={handleLoadDeal}
                onDeleteDeal={deleteDeal}
                loading={dealsLoading}
              />
            )}

            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span>📋</span> Property Details
              </h2>
              <PropertyForm
                dealData={dealData}
                onChange={setDealData}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                isLoading={isLoading}
                discount={currentMetrics.discount}
              />
            </div>

            <PropertyMap
              latitude={dealData.latitude}
              longitude={dealData.longitude}
              address={dealData.address}
            />

            <StreetView address={dealData.address} />
          </div>

          {/* Right Column - Analysis Results */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Verdict Badge + Save Button */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Analysis Results</h2>
                  <div className="flex items-center gap-3">
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDeal}
                        disabled={isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Deal
                      </Button>
                    )}
                    <VerdictBadge verdict={analysis.verdict} />
                  </div>
                </div>

                {/* Metrics Grid */}
                <MetricsGrid metrics={analysis.metrics} />

                {/* AI Insights */}
                <AIInsightsPanel insights={displayInsights} isLoading={isLoading} />

                {/* Analysis Tabs */}
                <AnalysisTabs
                  dealData={dealData}
                  metrics={analysis.metrics}
                  riskFactors={riskFactors}
                  insights={displayInsights}
                />
              </>
            ) : (
              <div className="glass-card h-full min-h-[600px]">
                <EmptyState />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>
            © 2024 Pivot Investments • LJ Integrated AI AutoAgents • 
            <span className="text-primary ml-1">Powered by Gemini 2.5 Flash & Mapbox 3.2</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
