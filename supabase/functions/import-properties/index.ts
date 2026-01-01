import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVProperty {
  property_id?: string;
  source?: string;
  source_loan_number?: string;
  deal_stage?: string;
  address: string;
  city: string;
  state?: string;
  zip_code: string;
  county?: string;
  property_type?: string;
  zoning?: string;
  num_units?: string;
  bedrooms?: string;
  bathrooms?: string;
  square_feet?: string;
  sqft_gla?: string;
  lot_size?: string;
  year_built?: string;
  occupancy_status?: string;
  occupancy?: string;
  owner_occupied?: string;
  bpo?: string;
  arv?: string;
  latest_property_value?: string;
  zillow_value?: string;
  upb?: string;
  total_balance?: string;
  accrued_interest?: string;
  deferred_balance?: string;
  corporate_advances?: string;
  escrow_balance?: string;
  estimated_legal_balance?: string;
  estimated_full_payoff?: string;
  current_interest_rate?: string;
  original_interest_rate?: string;
  original_loan_amount?: string;
  original_term_months?: string;
  remaining_term_months?: string;
  lien_position?: string;
  last_payment_date?: string;
  days_since_last_payment?: string;
  delinquent_status?: string;
  foreclosure_flag?: string;
  foreclosure_status?: string;
  foreclosure_start_date?: string;
  bankruptcy_flag?: string;
  bankruptcy_status?: string;
  bankruptcy_case_number?: string;
  bankruptcy_filing_type?: string;
  bankruptcy_filing_date?: string;
  reo_flag?: string;
  strike_price?: string;
  discount_to_upb?: string;
  discount_to_bpo?: string;
  estimated_roi?: string;
  estimated_irr?: string;
  projected_hold_period_months?: string;
  risk_score?: string;
  original_lender?: string;
  current_servicer?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  phone_numbers?: string;
  email_addresses?: string;
  mailing_address?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_zip_code?: string;
  notes?: string;
  internal_notes?: string;
  source_file?: string;
}

const parseNumber = (val?: string): number | null => {
  if (!val || val === '' || val === '-') return null;
  const cleaned = String(val).replace(/[$,%]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const parseInteger = (val?: string): number | null => {
  if (!val || val === '' || val === '-') return null;
  const num = parseInt(String(val).replace(/[^0-9-]/g, ''), 10);
  return isNaN(num) ? null : num;
};

const parseBoolean = (val?: string): boolean => {
  if (!val) return false;
  const strVal = String(val).toLowerCase().trim();
  return strVal === 'true' || strVal === 'yes' || strVal === 'y' || strVal === '1';
};

const parseDate = (val?: string): string | null => {
  if (!val || val === '' || val === '-') return null;
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { properties } = await req.json() as { properties: CSVProperty[] };

    if (!properties || !Array.isArray(properties)) {
      console.error('Invalid request: properties array required');
      return new Response(
        JSON.stringify({ error: 'properties array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting import of ${properties.length} properties`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user session
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;

    // Service client for DB writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Transform CSV data to match database schema
    const dbProperties = properties.map((p, index) => {
      // Build contact info for notes
      const contactInfo: Record<string, any> = {};
      if (p.phone_numbers) contactInfo.phone_numbers = p.phone_numbers;
      if (p.email_addresses) contactInfo.email_addresses = p.email_addresses;
      if (p.mailing_address) contactInfo.mailing_address = p.mailing_address;
      if (p.mailing_city) contactInfo.mailing_city = p.mailing_city;
      if (p.mailing_state) contactInfo.mailing_state = p.mailing_state;
      if (p.mailing_zip_code) contactInfo.mailing_zip_code = p.mailing_zip_code;

      const notesContent = p.notes || '';
      const contactInfoStr = Object.keys(contactInfo).length > 0 
        ? `\n\nContact Info: ${JSON.stringify(contactInfo)}` 
        : '';

      return {
        property_id: p.property_id || `IMPORT-${Date.now()}-${index}`,
        source: p.source || p.source_file || 'CSV Import',
        source_loan_number: p.source_loan_number || null,
        deal_stage: p.deal_stage || 'Active',
        created_by: userId,
        last_modified_by: userId,
        address: p.address,
        city: p.city,
        state: p.state || 'NY',
        zip_code: p.zip_code,
        county: p.county || null,
        property_type: p.property_type || null,
        zoning: p.zoning && p.zoning !== '-' ? p.zoning : null,
        num_units: parseInteger(p.num_units),
        bedrooms: parseInteger(p.bedrooms),
        bathrooms: parseNumber(p.bathrooms),
        square_feet: parseInteger(p.square_feet || p.sqft_gla),
        lot_size: parseInteger(p.lot_size),
        year_built: parseInteger(p.year_built),
        occupancy_status: p.occupancy_status || p.occupancy || null,
        owner_occupied: parseBoolean(p.owner_occupied),
        bpo: parseNumber(p.bpo),
        arv: parseNumber(p.arv),
        latest_property_value: parseNumber(p.latest_property_value),
        zillow_value: parseNumber(p.zillow_value),
        upb: parseNumber(p.upb),
        total_balance: parseNumber(p.total_balance),
        accrued_interest: parseNumber(p.accrued_interest),
        deferred_balance: parseNumber(p.deferred_balance),
        corporate_advances: parseNumber(p.corporate_advances),
        escrow_balance: parseNumber(p.escrow_balance),
        estimated_legal_balance: parseNumber(p.estimated_legal_balance),
        estimated_full_payoff: parseNumber(p.estimated_full_payoff),
        current_interest_rate: parseNumber(p.current_interest_rate),
        original_interest_rate: parseNumber(p.original_interest_rate),
        original_loan_amount: parseNumber(p.original_loan_amount),
        original_term_months: parseInteger(p.original_term_months),
        remaining_term_months: parseInteger(p.remaining_term_months),
        lien_position: parseInteger(p.lien_position),
        last_payment_date: parseDate(p.last_payment_date),
        days_since_last_payment: parseInteger(p.days_since_last_payment),
        delinquent_status: p.delinquent_status || null,
        foreclosure_flag: parseBoolean(p.foreclosure_flag),
        foreclosure_status: p.foreclosure_status || null,
        foreclosure_start_date: parseDate(p.foreclosure_start_date),
        bankruptcy_flag: parseBoolean(p.bankruptcy_flag),
        bankruptcy_status: p.bankruptcy_status || null,
        bankruptcy_case_number: p.bankruptcy_case_number || null,
        bankruptcy_filing_type: p.bankruptcy_filing_type || null,
        bankruptcy_filing_date: parseDate(p.bankruptcy_filing_date),
        reo_flag: parseBoolean(p.reo_flag),
        strike_price: parseNumber(p.strike_price),
        discount_to_upb: parseNumber(p.discount_to_upb),
        discount_to_bpo: parseNumber(p.discount_to_bpo),
        estimated_roi: parseNumber(p.estimated_roi),
        estimated_irr: parseNumber(p.estimated_irr),
        projected_hold_period_months: parseInteger(p.projected_hold_period_months),
        risk_score: parseInteger(p.risk_score),
        original_lender: p.original_lender || null,
        current_servicer: p.current_servicer || null,
        owner_first_name: p.owner_first_name && p.owner_first_name !== '-' ? p.owner_first_name : null,
        owner_last_name: p.owner_last_name || null,
        notes: notesContent + contactInfoStr || null,
        internal_notes: p.internal_notes || null,
        is_active: true
      };
    });

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < dbProperties.length; i += batchSize) {
      const batch = dbProperties.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}, ${batch.length} properties`);

      const { data, error } = await supabase
        .from('properties')
        .upsert(batch, { 
          onConflict: 'property_id',
          ignoreDuplicates: false 
        })
        .select('id');

      if (error) {
        console.error(`Batch ${i / batchSize + 1} error:`, error);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        inserted += data?.length || 0;
        console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${data?.length || 0} properties`);
      }
    }

    console.log(`Import complete: ${inserted} properties inserted, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        total: properties.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({
        error: 'Import failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
