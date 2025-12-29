import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_id } = await req.json();

    if (!property_id) {
      return new Response(
        JSON.stringify({ error: 'property_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch property from Supabase
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', property_id)
      .single();

    if (fetchError || !property) {
      console.error('Property fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(property);

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a real estate investment analyst specializing in distressed properties. Provide data-driven analysis with conservative estimates. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis content returned from AI');
    }

    // Parse the JSON response - handle markdown code blocks
    let analysis;
    try {
      let jsonStr = analysisText.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Failed to parse AI analysis response');
    }

    const processingTime = Date.now() - startTime;

    // Store analysis in properties table (ai_analysis column)
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        ai_analysis: JSON.stringify({
          ...analysis,
          analyzed_at: new Date().toISOString(),
          processing_time_ms: processingTime,
          model: 'google/gemini-2.5-flash'
        }),
        updated_at: new Date().toISOString()
      })
      .eq('property_id', property_id);

    if (updateError) {
      console.error('Failed to store analysis:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        property_id,
        analysis,
        processing_time_ms: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildAnalysisPrompt(property: any): string {
  const getCityTier = (city: string): string => {
    const tier1 = ['New York', 'Brooklyn', 'Manhattan'];
    const tier2 = ['Bronx', 'Queens', 'Staten Island'];
    if (tier1.includes(city)) return 'Tier 1 (Premium)';
    if (tier2.includes(city)) return 'Tier 2 (Strong)';
    return 'Tier 3 (Emerging)';
  };

  return `Analyze this distressed property for institutional investors.

PROPERTY DETAILS:
- Address: ${property.address}, ${property.city}, ${property.state} ${property.zip_code}
- Property Type: ${property.property_type || 'Unknown'}
- Bedrooms: ${property.bedrooms || 'Unknown'}
- Bathrooms: ${property.bathrooms || 'Unknown'}
- Square Feet: ${property.square_feet?.toLocaleString() || 'Unknown'}
- Lot Size: ${property.lot_size?.toLocaleString() || 'Unknown'} sqft
- Year Built: ${property.year_built || 'Unknown'}
- Zoning: ${property.zoning || 'Unknown'}
- Units: ${property.num_units || 1}

FINANCIAL DATA:
- BPO Value: $${property.bpo?.toLocaleString() || 'Unknown'}
- Strike Price: $${property.strike_price?.toLocaleString() || 'Unknown'}
- UPB: $${property.upb?.toLocaleString() || 'Unknown'}
- ARV: $${property.arv?.toLocaleString() || 'Unknown'}
- LTV Ratio: ${property.ltv_ratio ? (property.ltv_ratio * 100).toFixed(1) + '%' : 'Unknown'}
- Discount to BPO: ${property.discount_to_bpo ? (property.discount_to_bpo * 100).toFixed(1) + '%' : 'Unknown'}

LOAN STATUS:
- Foreclosure Status: ${property.foreclosure_status || 'Unknown'}
- Foreclosure Flag: ${property.foreclosure_flag ? 'Yes' : 'No'}
- Bankruptcy Flag: ${property.bankruptcy_flag ? 'Yes' : 'No'}
- Bankruptcy Status: ${property.bankruptcy_status || 'N/A'}
- Delinquent Status: ${property.delinquent_status || 'Unknown'}
- Days Since Last Payment: ${property.days_since_last_payment || 'Unknown'}
- Occupancy: ${property.occupancy_status || 'Unknown'}

MARKET CONTEXT:
- Location: ${property.city} is a ${getCityTier(property.city)} market
- Deal Stage: ${property.deal_stage || 'Unknown'}
- Source: ${property.source || 'Unknown'}

Provide investment analysis in this EXACT JSON format (no markdown, just raw JSON):
{
  "arv_low": <number - conservative ARV estimate>,
  "arv_high": <number - optimistic ARV estimate>,
  "arv_confidence": "HIGH" | "MEDIUM" | "LOW",
  "repair_low": <number - minimum repair cost estimate>,
  "repair_high": <number - maximum repair cost estimate>,
  "condition": "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "UNKNOWN",
  "roi_conservative": <number - conservative ROI percentage>,
  "roi_moderate": <number - moderate ROI percentage>,
  "roi_aggressive": <number - aggressive ROI percentage>,
  "risk_factors": ["<list 3 specific risks>"],
  "opportunities": ["<list 3 specific opportunities>"],
  "recommendation": "BUY" | "WATCH" | "PASS",
  "recommendation_reason": "<2-3 sentence explanation>",
  "deal_quality_score": <0-100 overall score>
}

Be specific and data-driven. Return ONLY valid JSON, no markdown or explanation.`;
}
