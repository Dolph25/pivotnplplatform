import React, { useState } from 'react';
import { DealData, CalculatedMetrics, RiskFactor } from '@/types/deal';
import { formatCurrency, formatPercentage } from '@/utils/calculations';

interface AnalysisTabsProps {
  dealData: DealData;
  metrics: CalculatedMetrics;
  riskFactors: RiskFactor[];
  insights: string;
}

type TabId = 'summary' | 'financial' | 'risk';

export function AnalysisTabs({ dealData, metrics, riskFactors, insights }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  const tabs = [
    { id: 'summary' as TabId, label: 'Executive Summary' },
    { id: 'financial' as TabId, label: 'Financial Analysis' },
    { id: 'risk' as TabId, label: 'Risk Assessment' },
  ];

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-destructive';
    }
  };

  return (
    <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
      {/* Tab Headers */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button flex-1 ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Deal Overview</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {dealData.propertyType} property at {dealData.address} with {dealData.units} unit(s). 
                Acquired at a {formatPercentage(metrics.discount)} discount to BPO value with a {dealData.holdPeriod}-month 
                hold strategy targeting a {dealData.exitStrategy.toLowerCase()} exit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Investment Thesis</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {insights ? insights.split('.').slice(0, 2).join('.') + '.' : 'Run AI analysis to generate investment thesis.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatPercentage(metrics.roi)}</div>
                <div className="text-xs text-muted-foreground">ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{formatCurrency(metrics.profit)}</div>
                <div className="text-xs text-muted-foreground">Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{dealData.holdPeriod}mo</div>
                <div className="text-xs text-muted-foreground">Hold</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6 animate-fade-in">
            {/* Sources */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Sources (Investment Required)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strike Price</span>
                  <span className="text-foreground">{formatCurrency(dealData.strikePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closing Costs (3%)</span>
                  <span className="text-foreground">{formatCurrency(metrics.closingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rehab Budget</span>
                  <span className="text-foreground">{formatCurrency(dealData.rehabCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holding Costs</span>
                  <span className="text-foreground">{formatCurrency(metrics.holdingCosts)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-foreground">Total Investment</span>
                  <span className="text-primary">{formatCurrency(metrics.totalInvestment)}</span>
                </div>
              </div>
            </div>

            {/* Uses / Returns */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Uses / Returns</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Sale Price</span>
                  <span className="text-foreground">{formatCurrency(dealData.salePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling Costs (6%)</span>
                  <span className="text-destructive">-{formatCurrency(metrics.sellingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Proceeds</span>
                  <span className="text-foreground">{formatCurrency(metrics.netProceeds)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-foreground">Net Profit</span>
                  <span className={metrics.profit >= 0 ? 'text-success' : 'text-destructive'}>
                    {formatCurrency(metrics.profit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-lg font-bold text-foreground">{formatPercentage(metrics.roi)}</div>
                <div className="text-xs text-muted-foreground">Cash-on-Cash</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-lg font-bold text-foreground">{formatPercentage(metrics.irr)}</div>
                <div className="text-xs text-muted-foreground">Annualized IRR</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-lg font-bold text-foreground">{formatPercentage(metrics.ltv)}</div>
                <div className="text-xs text-muted-foreground">LTV Ratio</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Risk Matrix</h4>
              <div className="space-y-4">
                {riskFactors.map((risk) => (
                  <div key={risk.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{risk.name}</span>
                      <span className={`text-xs font-medium uppercase ${
                        risk.level === 'low' ? 'text-success' : 
                        risk.level === 'medium' ? 'text-warning' : 
                        'text-destructive'
                      }`}>
                        {risk.level} ({risk.percentage}%)
                      </span>
                    </div>
                    <div className="risk-bar">
                      <div 
                        className={`risk-fill ${getRiskColor(risk.level)}`}
                        style={{ width: `${risk.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Risk Factors</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-warning">⚠️</span>
                  <span className="text-muted-foreground">Rehab timeline may be aggressive for scope</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">⚠️</span>
                  <span className="text-muted-foreground">Market conditions may soften during hold period</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">⚠️</span>
                  <span className="text-muted-foreground">Permit approvals could delay exit timing</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
