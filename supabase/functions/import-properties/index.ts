import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVProperty {
  property_id: string;
  source_file: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bpo?: string;
  arv?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  phone_numbers?: string;
  email_addresses?: string;
  mailing_address?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_zip_code?: string;
  occupancy?: string;
  owner_occupied?: string;
  foreclosure_status?: string;
  property_type?: string;
  num_units?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft_gla?: string;
  lot_size?: string;
  zoning?: string;
  imported_date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { properties } = await req.json() as { properties: CSVProperty[] };

    if (!properties || !Array.isArray(properties)) {
      return new Response(
        JSON.stringify({ error: 'properties array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform CSV data to match database schema
    const dbProperties = properties.map((p) => {
      const parseNumber = (val?: string): number | null => {
        if (!val || val === '' || val === '-') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };

      const parseInteger = (val?: string): number | null => {
        if (!val || val === '' || val === '-') return null;
        const num = parseInt(val, 10);
        return isNaN(num) ? null : num;
      };

      return {
        property_id: `CSV-${p.property_id}`,
        source: p.source_file || 'CSV Import',
        address: p.address,
        city: p.city,
        state: p.state || 'NY',
        zip_code: p.zip_code,
        bpo: parseNumber(p.bpo),
        arv: parseNumber(p.arv),
        owner_first_name: p.owner_first_name && p.owner_first_name !== '-' ? p.owner_first_name : null,
        owner_last_name: p.owner_last_name || null,
        occupancy_status: p.occupancy || null,
        owner_occupied: p.owner_occupied === 'true' || p.owner_occupied === 'True',
        foreclosure_status: p.foreclosure_status || null,
        property_type: p.property_type || null,
        num_units: parseInteger(p.num_units),
        bedrooms: parseInteger(p.bedrooms),
        bathrooms: parseNumber(p.bathrooms),
        square_feet: parseInteger(p.sqft_gla),
        lot_size: parseInteger(p.lot_size),
        zoning: p.zoning && p.zoning !== '-' ? p.zoning : null,
        deal_stage: 'Active',
        is_active: true,
        // Store contact info in notes field as JSON
        notes: JSON.stringify({
          phone_numbers: p.phone_numbers || null,
          email_addresses: p.email_addresses || null,
          mailing_address: p.mailing_address || null,
          mailing_city: p.mailing_city || null,
          mailing_state: p.mailing_state || null,
          mailing_zip_code: p.mailing_zip_code || null,
          imported_date: p.imported_date || new Date().toISOString()
        })
      };
    });

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < dbProperties.length; i += batchSize) {
      const batch = dbProperties.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('properties')
        .upsert(batch, { 
          onConflict: 'property_id',
          ignoreDuplicates: false 
        })
        .select('id');

      if (error) {
        console.error(`Batch ${i / batchSize + 1} error:`, error);
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        inserted += data?.length || 0;
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
