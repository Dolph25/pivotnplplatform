import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealData } from '@/types/deal';
import { toast } from 'sonner';

interface SavedDeal {
  id: string;
  address: string;
  property_type: string;
  units: number;
  bpo_value: number;
  strike_price: number;
  rehab_costs: number;
  hold_period: number;
  exit_strategy: string;
  sale_price: number;
  latitude: number | null;
  longitude: number | null;
  roi: number | null;
  irr: number | null;
  profit: number | null;
  verdict: string | null;
  ai_insights: string | null;
  created_at: string;
}

export function useSavedDeals(userId: string | undefined) {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('saved_deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load saved deals');
    } else {
      setSavedDeals(data || []);
    }
    setLoading(false);
  }, [userId]);

  const saveDeal = useCallback(async (
    dealData: DealData, 
    metrics: { roi: number; irr: number; profit: number },
    verdict: string,
    aiInsights: string
  ) => {
    if (!userId) {
      toast.error('Please sign in to save deals');
      return null;
    }

    const { data, error } = await supabase
      .from('saved_deals')
      .insert({
        user_id: userId,
        address: dealData.address,
        property_type: dealData.propertyType,
        units: dealData.units,
        bpo_value: dealData.bpoValue,
        strike_price: dealData.strikePrice,
        rehab_costs: dealData.rehabCosts,
        hold_period: dealData.holdPeriod,
        exit_strategy: dealData.exitStrategy,
        sale_price: dealData.salePrice,
        latitude: dealData.latitude,
        longitude: dealData.longitude,
        roi: metrics.roi,
        irr: metrics.irr,
        profit: metrics.profit,
        verdict,
        ai_insights: aiInsights
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving deal:', error);
      toast.error('Failed to save deal');
      return null;
    }

    toast.success('Deal saved successfully');
    await fetchDeals();
    return data;
  }, [userId, fetchDeals]);

  const deleteDeal = useCallback(async (dealId: string) => {
    const { error } = await supabase
      .from('saved_deals')
      .delete()
      .eq('id', dealId);

    if (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
      return false;
    }

    toast.success('Deal deleted');
    await fetchDeals();
    return true;
  }, [fetchDeals]);

  return { savedDeals, loading, fetchDeals, saveDeal, deleteDeal };
}
