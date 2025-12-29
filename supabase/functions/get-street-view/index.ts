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
    const { address, width = 600, height = 400 } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Maps API key not configured", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodeURIComponent(address)}&fov=90&heading=0&pitch=0&key=${apiKey}`;

    // Check if street view is available using metadata API
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const metadataResponse = await fetch(metadataUrl);
    const metadata = await metadataResponse.json();

    if (metadata.status !== "OK") {
      return new Response(
        JSON.stringify({ 
          available: false, 
          status: metadata.status,
          fallback: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        url: streetViewUrl, 
        available: true,
        panoId: metadata.pano_id,
        location: metadata.location
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
