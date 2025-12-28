import React from 'react';
import { CalculatedMetrics } from '@/types/deal';
import { formatCurrency, formatPercentage } from '@/utils/calculations';

interface MetricsGridProps {
  metrics: CalculatedMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricsData = [
    { 
      label: 'Expected ROI', 
      value: formatPercentage(metrics.roi),
      color: metrics.roi >= 25 ? 'text-success' : metrics.roi >= 10 ? 'text-warning' : 'text-destructive'
    },
    { 
      label: 'Expected IRR', 
      value: formatPercentage(metrics.irr),
      color: metrics.irr >= 15 ? 'text-success' : metrics.irr >= 8 ? 'text-warning' : 'text-muted-foreground'
    },
    { 
      label: 'Total Investment', 
      value: formatCurrency(metrics.totalInvestment),
      color: 'text-foreground'
    },
    { 
      label: 'Expected Profit', 
      value: formatCurrency(metrics.profit),
      color: metrics.profit > 0 ? 'text-success' : 'text-destructive'
    },
    { 
      label: 'Loan-to-Value', 
      value: formatPercentage(metrics.ltv),
      color: metrics.ltv < 60 ? 'text-success' : metrics.ltv < 80 ? 'text-warning' : 'text-destructive'
    },
    { 
      label: 'Cost Basis', 
      value: formatCurrency(metrics.costBasis),
      color: 'text-foreground'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metricsData.map((metric, index) => (
        <div 
          key={metric.label}
          className="metric-card animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="text-muted-foreground text-sm mb-1">{metric.label}</div>
          <div className={`text-2xl font-bold ${metric.color}`}>
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}
