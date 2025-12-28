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

const Index = () => {
  const [dealData, setDealData] = useState<DealData>(exampleDeal);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentMetrics = calculateMetrics(dealData);

  const generateMockAIInsights = (data: DealData, metrics: ReturnType<typeof calculateMetrics>): string => {
    const verdict = getVerdict(metrics.roi);
    
    const insights = {
      buy: `This ${data.propertyType.toLowerCase()} in ${data.address.split(',').slice(-2).join(',')} presents a compelling investment opportunity with a ${metrics.discount.toFixed(1)}% discount to BPO. The ${metrics.roi.toFixed(1)}% projected ROI significantly exceeds typical market returns, supported by conservative rehab estimates and realistic exit pricing. Strong fundamentals and favorable LTV positioning make this a STRONG BUY recommendation for institutional capital deployment.`,
      consider: `The property at ${data.address.split(',')[0]} offers moderate upside with ${metrics.roi.toFixed(1)}% ROI potential. While the ${metrics.discount.toFixed(1)}% discount provides some margin of safety, the ${data.holdPeriod}-month timeline and ${data.exitStrategy.toLowerCase()} exit strategy carry execution risks. Consider proceeding with enhanced due diligence on renovation scope and local market conditions before commitment.`,
      pass: `Current deal metrics suggest caution. With only ${metrics.roi.toFixed(1)}% projected ROI and ${metrics.discount.toFixed(1)}% discount to BPO, risk-adjusted returns appear insufficient. The ${data.holdPeriod}-month hold period and substantial rehab requirements increase execution risk without commensurate upside. Recommend passing unless strike price can be renegotiated by 15-20%.`
    };

    return insights[verdict];
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const metrics = calculateMetrics(dealData);
    const verdict = getVerdict(metrics.roi);
    const insights = generateMockAIInsights(dealData, metrics);
    const risks = calculateRiskFactors(dealData, metrics);
    
    setAnalysis({
      metrics,
      insights,
      verdict
    });
    setRiskFactors(risks);
    setIsLoading(false);
  };

  const handleReset = () => {
    setDealData(exampleDeal);
    setAnalysis(null);
    setRiskFactors([]);
  };

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
                <AIInsightsPanel insights={analysis.insights} isLoading={isLoading} />

                {/* Analysis Tabs */}
                <AnalysisTabs
                  dealData={dealData}
                  metrics={analysis.metrics}
                  riskFactors={riskFactors}
                  insights={analysis.insights}
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
            <span className="text-primary ml-1">Powered by Gemini 2.0 Flash & Mapbox 3.2</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
