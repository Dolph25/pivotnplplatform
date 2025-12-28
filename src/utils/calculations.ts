import { DealData, CalculatedMetrics, RiskFactor } from '@/types/deal';

export function calculateMetrics(deal: DealData): CalculatedMetrics {
  const closingCosts = deal.strikePrice * 0.03;
  const annualHoldingCostRate = 0.08;
  const holdingCosts = (deal.strikePrice + deal.rehabCosts) * annualHoldingCostRate * (deal.holdPeriod / 12);
  const totalInvestment = deal.strikePrice + closingCosts + deal.rehabCosts + holdingCosts;
  
  const sellingCosts = deal.salePrice * 0.06;
  const netProceeds = deal.salePrice - sellingCosts;
  const profit = netProceeds - totalInvestment;
  
  const roi = (profit / totalInvestment) * 100;
  const irr = (Math.pow((netProceeds / totalInvestment), (12 / deal.holdPeriod)) - 1) * 100;
  const ltv = (deal.strikePrice / deal.bpoValue) * 100;
  const discount = ((deal.bpoValue - deal.strikePrice) / deal.bpoValue) * 100;
  const costBasis = deal.strikePrice + deal.rehabCosts;

  return {
    discount,
    closingCosts,
    holdingCosts,
    totalInvestment,
    sellingCosts,
    netProceeds,
    profit,
    roi,
    irr,
    ltv,
    costBasis
  };
}

export function getVerdict(roi: number): 'buy' | 'consider' | 'pass' {
  if (roi >= 25) return 'buy';
  if (roi >= 10) return 'consider';
  return 'pass';
}

export function getVerdictText(verdict: 'buy' | 'consider' | 'pass'): string {
  switch (verdict) {
    case 'buy': return 'Strong Buy';
    case 'consider': return 'Consider';
    case 'pass': return 'Pass';
  }
}

export function calculateRiskFactors(deal: DealData, metrics: CalculatedMetrics): RiskFactor[] {
  const risks: RiskFactor[] = [];
  
  // Market Risk - based on LTV
  const marketRiskPct = metrics.ltv > 70 ? 50 : metrics.ltv > 50 ? 30 : 15;
  risks.push({
    name: 'Market Risk',
    level: marketRiskPct > 40 ? 'high' : marketRiskPct > 25 ? 'medium' : 'low',
    percentage: marketRiskPct,
    description: metrics.ltv > 70 
      ? 'High LTV increases exposure to market corrections'
      : 'Discount provides buffer against market volatility'
  });
  
  // Execution Risk - based on rehab relative to strike
  const rehabRatio = deal.rehabCosts / deal.strikePrice;
  const execRiskPct = rehabRatio > 0.4 ? 45 : rehabRatio > 0.2 ? 25 : 15;
  risks.push({
    name: 'Execution Risk',
    level: execRiskPct > 40 ? 'high' : execRiskPct > 20 ? 'medium' : 'low',
    percentage: execRiskPct,
    description: rehabRatio > 0.4 
      ? 'Significant rehab scope increases timeline and budget risk'
      : 'Manageable rehab scope with controlled execution risk'
  });
  
  // Liquidity Risk - based on hold period
  const liquidityRiskPct = deal.holdPeriod > 24 ? 40 : deal.holdPeriod > 12 ? 30 : 20;
  risks.push({
    name: 'Liquidity Risk',
    level: liquidityRiskPct > 35 ? 'high' : liquidityRiskPct > 25 ? 'medium' : 'low',
    percentage: liquidityRiskPct,
    description: deal.holdPeriod > 24 
      ? 'Extended hold period increases capital lock-up risk'
      : 'Reasonable timeline for exit execution'
  });
  
  return risks;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
