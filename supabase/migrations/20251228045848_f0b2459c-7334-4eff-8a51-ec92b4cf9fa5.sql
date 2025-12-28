-- Update VIP qualified leads view with $250K threshold
DROP VIEW IF EXISTS public.vip_qualified_leads;
CREATE VIEW public.vip_qualified_leads AS
SELECT * FROM public.investor_leads
WHERE qualified = TRUE 
AND investment_amount >= 250000
ORDER BY created_at DESC;

-- Update metrics view with $250K VIP threshold
DROP VIEW IF EXISTS public.investor_metrics;
CREATE VIEW public.investor_metrics AS
SELECT 
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE qualified = TRUE) as qualified_count,
  COUNT(*) FILTER (WHERE investment_amount >= 250000) as vip_count,
  SUM(investment_amount) FILTER (WHERE qualified = TRUE) as total_committed,
  COUNT(*) FILTER (WHERE converted_to_lp = TRUE) as converted_count
FROM public.investor_leads;

-- Set security invoker on views
ALTER VIEW public.vip_qualified_leads SET (security_invoker = on);
ALTER VIEW public.investor_metrics SET (security_invoker = on);