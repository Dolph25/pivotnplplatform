-- ============================================================================
-- PIVOT INVESTMENTS NPL PLATFORM - CORE SCHEMA
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create app_role enum for secure role management
CREATE TYPE public.app_role AS ENUM ('admin', 'investor', 'analyst');

-- ============================================================================
-- USER ROLES TABLE (Secure role management)
-- ============================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PROPERTIES TABLE (Master Property Table)
-- ============================================================================
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Property Identification
  property_id VARCHAR(50) UNIQUE NOT NULL,
  source VARCHAR(50) NOT NULL,
  source_loan_number VARCHAR(100),
  deal_stage VARCHAR(50) NOT NULL DEFAULT 'Active',
  
  -- Location
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL DEFAULT 'NY',
  zip_code VARCHAR(10) NOT NULL,
  county VARCHAR(100),
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Property Details
  property_type VARCHAR(50),
  num_units INTEGER DEFAULT 1,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  lot_size INTEGER,
  year_built INTEGER,
  zoning VARCHAR(50),
  
  -- Occupancy & Status
  occupancy_status VARCHAR(50),
  owner_occupied BOOLEAN,
  
  -- Valuation
  bpo DECIMAL(12,2),
  arv DECIMAL(12,2),
  latest_property_value DECIMAL(12,2),
  latest_value_date DATE,
  zillow_value DECIMAL(12,2),
  
  -- Financial Data
  upb DECIMAL(12,2),
  total_balance DECIMAL(12,2),
  accrued_interest DECIMAL(12,2),
  deferred_balance DECIMAL(12,2),
  corporate_advances DECIMAL(12,2),
  escrow_balance DECIMAL(12,2),
  estimated_legal_balance DECIMAL(12,2),
  estimated_full_payoff DECIMAL(12,2),
  current_interest_rate DECIMAL(5,4),
  
  -- Loan Details
  original_loan_amount DECIMAL(12,2),
  original_interest_rate DECIMAL(5,4),
  loan_origination_date DATE,
  original_lender TEXT,
  current_servicer VARCHAR(100),
  original_term_months INTEGER,
  remaining_term_months INTEGER,
  maturity_date DATE,
  lien_position INTEGER DEFAULT 1,
  
  -- Payment History
  last_payment_date DATE,
  days_since_last_payment INTEGER,
  delinquent_status VARCHAR(50),
  
  -- Legal Status
  foreclosure_flag BOOLEAN DEFAULT FALSE,
  foreclosure_start_date DATE,
  foreclosure_status VARCHAR(100),
  bankruptcy_flag BOOLEAN DEFAULT FALSE,
  bankruptcy_case_number VARCHAR(50),
  bankruptcy_filing_type VARCHAR(20),
  bankruptcy_status VARCHAR(50),
  bankruptcy_filing_date DATE,
  reo_flag BOOLEAN DEFAULT FALSE,
  
  -- Investment Analysis
  strike_price DECIMAL(12,2),
  ltv_ratio DECIMAL(5,4),
  discount_to_upb DECIMAL(5,4),
  discount_to_bpo DECIMAL(5,4),
  estimated_roi DECIMAL(6,2),
  estimated_irr DECIMAL(6,2),
  projected_hold_period_months INTEGER,
  risk_score INTEGER,
  
  -- Contact Information (for Leads)
  owner_first_name VARCHAR(100),
  owner_last_name VARCHAR(100),
  
  -- Notes
  notes TEXT,
  ai_analysis TEXT,
  internal_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for properties
CREATE INDEX idx_properties_property_id ON public.properties(property_id);
CREATE INDEX idx_properties_source ON public.properties(source);
CREATE INDEX idx_properties_deal_stage ON public.properties(deal_stage);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_county ON public.properties(county);
CREATE INDEX idx_properties_zip ON public.properties(zip_code);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_foreclosure ON public.properties(foreclosure_flag);
CREATE INDEX idx_properties_is_active ON public.properties(is_active);
CREATE INDEX idx_properties_address_search ON public.properties USING gin(to_tsvector('english', address || ' ' || city));

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Properties RLS
CREATE POLICY "Admins can do everything on properties"
  ON public.properties FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ============================================================================
-- INVESTORS TABLE (Limited Partners)
-- ============================================================================
CREATE TABLE public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account Info
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  investor_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(200),
  
  -- Accreditation
  accredited_investor BOOLEAN DEFAULT FALSE,
  accreditation_type VARCHAR(100),
  accreditation_verified_date DATE,
  accreditation_verified_by UUID REFERENCES auth.users(id),
  
  -- Investment Details
  commitment_amount DECIMAL(12,2) DEFAULT 0,
  invested_amount DECIMAL(12,2) DEFAULT 0,
  distributions_received DECIMAL(12,2) DEFAULT 0,
  current_nav DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  investor_tier VARCHAR(50) DEFAULT 'Standard',
  status VARCHAR(50) DEFAULT 'Active',
  
  -- Contact
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  
  -- Documents
  documents_completed BOOLEAN DEFAULT FALSE,
  ppm_accepted BOOLEAN DEFAULT FALSE,
  ppm_accepted_date TIMESTAMP,
  subscription_agreement_signed BOOLEAN DEFAULT FALSE,
  subscription_agreement_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_investors_investor_id ON public.investors(investor_id);
CREATE INDEX idx_investors_email ON public.investors(email);
CREATE INDEX idx_investors_status ON public.investors(status);
CREATE INDEX idx_investors_is_active ON public.investors(is_active);

ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

-- Investors RLS
CREATE POLICY "Investors can view own data"
  ON public.investors FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can do everything on investors"
  ON public.investors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- DEALS TABLE (Investment Opportunities)
-- ============================================================================
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Deal Identification
  deal_id VARCHAR(50) UNIQUE NOT NULL,
  deal_name VARCHAR(200) NOT NULL,
  property_id UUID REFERENCES public.properties(id),
  
  -- Deal Structure
  deal_type VARCHAR(50) NOT NULL,
  acquisition_strategy VARCHAR(100),
  
  -- Financial Terms
  acquisition_price DECIMAL(12,2),
  estimated_rehab DECIMAL(12,2) DEFAULT 0,
  total_investment DECIMAL(12,2),
  exit_strategy VARCHAR(100),
  target_sale_price DECIMAL(12,2),
  
  -- Returns Projections
  projected_profit DECIMAL(12,2),
  projected_roi_pct DECIMAL(6,2),
  projected_irr_pct DECIMAL(6,2),
  projected_hold_months INTEGER,
  
  -- Capital Stack
  equity_required DECIMAL(12,2),
  debt_amount DECIMAL(12,2) DEFAULT 0,
  total_capital DECIMAL(12,2),
  
  -- Deal Status
  status VARCHAR(50) NOT NULL DEFAULT 'Pipeline',
  pipeline_stage VARCHAR(100),
  
  -- Key Dates
  identified_date DATE,
  contract_date DATE,
  closing_date DATE,
  exit_date DATE,
  
  -- LP Information
  presented_to_lps BOOLEAN DEFAULT FALSE,
  lp_approval_date DATE,
  funded_by_lps BOOLEAN DEFAULT FALSE,
  
  -- Track Record
  actual_acquisition_price DECIMAL(12,2),
  actual_rehab_cost DECIMAL(12,2),
  actual_exit_price DECIMAL(12,2),
  actual_profit DECIMAL(12,2),
  actual_roi_pct DECIMAL(6,2),
  actual_hold_months INTEGER,
  
  -- Notes
  deal_notes TEXT,
  underwriting_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_deals_deal_id ON public.deals(deal_id);
CREATE INDEX idx_deals_property_id ON public.deals(property_id);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_deals_is_active ON public.deals(is_active);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Deals RLS
CREATE POLICY "Admins can do everything on deals"
  ON public.deals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Investors can view active deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document Info
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Associations
  property_id UUID REFERENCES public.properties(id),
  deal_id UUID REFERENCES public.deals(id),
  investor_id UUID REFERENCES public.investors(id),
  
  -- Access Control
  visibility VARCHAR(50) DEFAULT 'Private',
  
  -- Metadata
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_documents_property_id ON public.documents(property_id);
CREATE INDEX idx_documents_deal_id ON public.documents(deal_id);
CREATE INDEX idx_documents_investor_id ON public.documents(investor_id);
CREATE INDEX idx_documents_is_active ON public.documents(is_active);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents RLS
CREATE POLICY "Admins can do everything on documents"
  ON public.documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (
    uploaded_by = auth.uid() 
    OR visibility = 'Public'
    OR (visibility = 'Investors Only' AND EXISTS (
      SELECT 1 FROM public.investors WHERE user_id = auth.uid()
    ))
  );

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at 
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at 
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- AUTO-CALCULATE LTV RATIO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_ltv()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.upb IS NOT NULL AND NEW.bpo IS NOT NULL AND NEW.bpo > 0 THEN
    NEW.ltv_ratio = NEW.upb / NEW.bpo;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_property_ltv 
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.calculate_ltv();

-- ============================================================================
-- VIEWS FOR DASHBOARD METRICS
-- ============================================================================
CREATE OR REPLACE VIEW public.v_portfolio_summary AS
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

CREATE OR REPLACE VIEW public.v_deal_pipeline AS
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