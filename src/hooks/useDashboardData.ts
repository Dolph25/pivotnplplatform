import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioSummary {
  total_properties: number;
  active_properties: number;
  foreclosures: number;
  bankruptcies: number;
  total_upb: number;
  total_balance: number;
  total_bpo: number;
  avg_interest_rate: number;
  total_strike_price: number;
}

interface DealPipeline {
  status: string;
  deal_count: number;
  total_capital: number;
  total_projected_profit: number;
  avg_roi: number;
  avg_irr: number;
}

export function useDashboardData() {
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [dealPipeline, setDealPipeline] = useState<DealPipeline[]>([]);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch portfolio summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('v_portfolio_summary')
        .select('*')
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Portfolio summary error:', summaryError);
      } else {
        setPortfolioSummary(summaryData || {
          total_properties: 0,
          active_properties: 0,
          foreclosures: 0,
          bankruptcies: 0,
          total_upb: 0,
          total_balance: 0,
          total_bpo: 0,
          avg_interest_rate: 0,
          total_strike_price: 0
        });
      }

      // Fetch deal pipeline
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('v_deal_pipeline')
        .select('*');

      if (pipelineError) {
        console.error('Deal pipeline error:', pipelineError);
      } else {
        setDealPipeline(pipelineData || []);
      }

      // Fetch recent properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, property_id, address, city, state, property_type, bpo, strike_price, deal_stage, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (propertiesError) {
        console.error('Recent properties error:', propertiesError);
      } else {
        setRecentProperties(propertiesData || []);
      }

    } catch (err) {
      console.error('Dashboard data error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { portfolioSummary, dealPipeline, recentProperties, loading, error, refetch: fetchData };
}
