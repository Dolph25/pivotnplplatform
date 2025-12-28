-- Drop the overly permissive read policy
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.investor_leads;

-- Admins already have full access via "Admins can do everything on investor_leads" policy
-- The INSERT policy remains so users can submit their own lead forms