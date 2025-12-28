import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealData, metrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior real estate investment analyst specializing in distressed property deals and NPL (Non-Performing Loan) acquisitions. You provide concise, data-driven analysis for institutional investors.

Your analysis style:
- Lead with the investment thesis and clear recommendation
- Use specific numbers and percentages
- Identify key risks and opportunities
- Be direct and actionable
- Keep responses to 4-5 sentences maximum`;

    const userPrompt = `Analyze this distressed property deal:

Property Details:
- Address: ${dealData.address}
- Type: ${dealData.propertyType} (${dealData.units} units)
- BPO Value: $${dealData.bpoValue.toLocaleString()}
- Strike Price: $${dealData.strikePrice.toLocaleString()} (${metrics.discount.toFixed(1)}% discount to BPO)
- Rehab Budget: $${dealData.rehabCosts.toLocaleString()}
- Hold Period: ${dealData.holdPeriod} months
- Exit Strategy: ${dealData.exitStrategy}
- Expected Sale Price: $${dealData.salePrice.toLocaleString()}

Calculated Metrics:
- ROI: ${metrics.roi.toFixed(1)}%
- IRR: ${metrics.irr.toFixed(1)}%
- LTV: ${metrics.ltv.toFixed(1)}%
- Total Investment: $${metrics.totalInvestment.toLocaleString()}
- Expected Profit: $${metrics.profit.toLocaleString()}

Provide a concise investment analysis with clear recommendation (Strong Buy / Consider / Pass).`;

    console.log("Calling Lovable AI Gateway for deal analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("analyze-deal error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
