import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { PropertyForm } from '@/components/PropertyForm';
import { PropertyMap } from '@/components/PropertyMap';
import { StreetView } from '@/components/StreetView';
import { MetricsGrid } from '@/components/MetricsGrid';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { VerdictBadge } from '@/components/VerdictBadge';
import { AnalysisTabs } from '@/components/AnalysisTabs';
import { EmptyState } from '@/components/EmptyState';
import { DealData, AnalysisResult, RiskFactor } from '@/types/deal';
import { calculateMetrics, getVerdict, calculateRiskFactors } from '@/utils/calculations';
import { exampleDeal } from '@/utils/exampleDeal';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

const Index = () => {
  const [dealData, setDealData] = useState<DealData>(exampleDeal);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  
  const { analyzeWithAI, isLoading, insights } = useAIAnalysis();

  const currentMetrics = calculateMetrics(dealData);

  const handleAnalyze = async () => {
    const metrics = calculateMetrics(dealData);
    const verdict = getVerdict(metrics.roi);
    const risks = calculateRiskFactors(dealData, metrics);
    
    // Set analysis immediately with empty insights
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
      // Error already handled in hook with toast
      setAnalysis(prev => prev ? { 
        ...prev, 
        insights: 'AI analysis unavailable. Review the calculated metrics above for your investment decision.' 
      } : null);
    }
  };

  const handleReset = () => {
    setDealData(exampleDeal);
    setAnalysis(null);
    setRiskFactors([]);
  };

  // Use streaming insights while loading, otherwise use saved analysis
  const displayInsights = isLoading ? insights : (analysis?.insights || '');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
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
                {/* Verdict Badge */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Analysis Results</h2>
                  <VerdictBadge verdict={analysis.verdict} />
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
