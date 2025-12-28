-- Add deposit tracking columns to investor_leads table
ALTER TABLE public.investor_leads 
ADD COLUMN deposit_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN deposit_amount NUMERIC,
ADD COLUMN deposit_date TIMESTAMP WITH TIME ZONE;

-- Create view for deposited VIP leads
CREATE VIEW public.deposited_vip_leads AS
SELECT * FROM public.investor_leads
WHERE deposit_submitted = TRUE
AND investment_amount >= 250000
ORDER BY deposit_date ASC;

-- Set security invoker on view
ALTER VIEW public.deposited_vip_leads SET (security_invoker = on);