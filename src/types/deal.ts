export interface DealData {
  address: string;
  propertyType: string;
  units: number;
  bpoValue: number;
  strikePrice: number;
  rehabCosts: number;
  holdPeriod: number;
  exitStrategy: string;
  salePrice: number;
  latitude: number;
  longitude: number;
}

export interface CalculatedMetrics {
  discount: number;
  closingCosts: number;
  holdingCosts: number;
  totalInvestment: number;
  sellingCosts: number;
  netProceeds: number;
  profit: number;
  roi: number;
  irr: number;
  ltv: number;
  costBasis: number;
}

export interface AnalysisResult {
  metrics: CalculatedMetrics;
  insights: string;
  verdict: 'buy' | 'consider' | 'pass';
}

export interface RiskFactor {
  name: string;
  level: 'low' | 'medium' | 'high';
  percentage: number;
  description: string;
}
