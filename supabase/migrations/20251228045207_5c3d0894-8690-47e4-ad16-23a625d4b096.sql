-- Create investor leads table
CREATE TABLE public.investor_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  investment_tier TEXT,
  accredited_status TEXT,
  experience TEXT,
  investment_amount NUMERIC,
  timeline TEXT,
  qualified BOOLEAN,
  source TEXT DEFAULT 'portal',
  notes TEXT,
  status TEXT DEFAULT 'new',
  last_contact_date TIMESTAMP WITH TIME ZONE,
  converted_to_lp BOOLEAN DEFAULT FALSE,
  UNIQUE(email)
);

-- Create indexes for faster queries
CREATE INDEX idx_investor_email ON public.investor_leads(email);
CREATE INDEX idx_qualified ON public.investor_leads(qualified);
CREATE INDEX idx_investment_tier ON public.investor_leads(investment_tier);

-- Create view for VIP qualified leads
CREATE VIEW public.vip_qualified_leads AS
SELECT * FROM public.investor_leads
WHERE qualified = TRUE 
AND investment_amount >= 500000
ORDER BY created_at DESC;

-- Create view for dashboard metrics
CREATE VIEW public.investor_metrics AS
SELECT 
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE qualified = TRUE) as qualified_count,
  COUNT(*) FILTER (WHERE investment_amount >= 500000) as vip_count,
  SUM(investment_amount) FILTER (WHERE qualified = TRUE) as total_committed,
  COUNT(*) FILTER (WHERE converted_to_lp = TRUE) as converted_count
FROM public.investor_leads;

-- Enable Row Level Security
ALTER TABLE public.investor_leads ENABLE ROW LEVEL SECURITY;

-- Create policies - admins can do everything, authenticated users can insert and read
CREATE POLICY "Admins can do everything on investor_leads"
ON public.investor_leads
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enable insert for authenticated users"
ON public.investor_leads
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users"
ON public.investor_leads
FOR SELECT
TO authenticated
USING (true);