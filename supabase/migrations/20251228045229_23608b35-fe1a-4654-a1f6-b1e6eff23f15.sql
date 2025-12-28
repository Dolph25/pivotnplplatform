-- Explicitly set views to use security invoker (respects RLS of querying user)
ALTER VIEW public.vip_qualified_leads SET (security_invoker = on);
ALTER VIEW public.investor_metrics SET (security_invoker = on);