-- Fix security issues

-- Drop and recreate views with SECURITY INVOKER (default, explicit)
DROP VIEW IF EXISTS public.v_portfolio_summary;
DROP VIEW IF EXISTS public.v_deal_pipeline;

CREATE VIEW public.v_portfolio_summary
WITH (security_invoker = true)
AS
SELECT
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE deal_stage = 'Active') as active_properties,
  COUNT(*) FILTER (WHERE foreclosure_flag = TRUE) as foreclosures,
  COUNT(*) FILTER (WHERE bankruptcy_flag = TRUE) as bankruptcies,
  COALESCE(SUM(upb), 0) as total_upb,
  COALESCE(SUM(total_balance), 0) as total_balance,
  COALESCE(SUM(bpo), 0) as total_bpo,
  COALESCE(AVG(current_interest_rate), 0) as avg_interest_rate,
  COALESCE(SUM(strike_price), 0) as total_strike_price
FROM public.properties
WHERE is_active = TRUE;

CREATE VIEW public.v_deal_pipeline
WITH (security_invoker = true)
AS
SELECT
  status,
  COUNT(*) as deal_count,
  COALESCE(SUM(total_investment), 0) as total_capital,
  COALESCE(SUM(projected_profit), 0) as total_projected_profit,
  COALESCE(AVG(projected_roi_pct), 0) as avg_roi,
  COALESCE(AVG(projected_irr_pct), 0) as avg_irr
FROM public.deals
WHERE is_active = TRUE
GROUP BY status;

-- Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;