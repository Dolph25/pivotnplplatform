import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('PayPal webhook received:', JSON.stringify(payload, null, 2));

    // Verify it's a payment completion event
    const eventType = payload.event_type;
    console.log('Event type:', eventType);

    // Handle different PayPal event types
    const paymentEvents = [
      'PAYMENT.CAPTURE.COMPLETED',
      'CHECKOUT.ORDER.APPROVED',
      'PAYMENT.SALE.COMPLETED'
    ];

    if (!paymentEvents.includes(eventType)) {
      console.log('Ignoring non-payment event:', eventType);
      return new Response(
        JSON.stringify({ message: 'Event type not handled', eventType }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract payer email from payload
    const resource = payload.resource || {};
    let payerEmail = '';
    let amount = 0;

    // Try different payload structures
    if (resource.payer?.email_address) {
      payerEmail = resource.payer.email_address;
    } else if (resource.payee?.email_address) {
      payerEmail = resource.payee.email_address;
    } else if (payload.payer?.email_address) {
      payerEmail = payload.payer.email_address;
    }

    // Extract amount
    if (resource.amount?.value) {
      amount = parseFloat(resource.amount.value);
    } else if (resource.purchase_units?.[0]?.amount?.value) {
      amount = parseFloat(resource.purchase_units[0].amount.value);
    }

    console.log('Payer email:', payerEmail);
    console.log('Amount:', amount);

    if (!payerEmail) {
      console.error('No payer email found in payload');
      return new Response(
        JSON.stringify({ error: 'No payer email found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the investor_leads record
    const { data, error } = await supabase
      .from('investor_leads')
      .update({
        deposit_submitted: true,
        deposit_amount: amount || 5000,
        deposit_date: new Date().toISOString()
      })
      .eq('email', payerEmail.toLowerCase())
      .select();

    if (error) {
      console.error('Database update error:', error);
      return new Response(
        JSON.stringify({ error: 'Database update failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      console.log('No matching lead found for email:', payerEmail);
      // Still return 200 to acknowledge receipt
      return new Response(
        JSON.stringify({ message: 'No matching lead found', email: payerEmail }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully updated lead:', data[0].id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deposit recorded',
        leadId: data[0].id,
        email: payerEmail,
        amount: amount || 5000
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
