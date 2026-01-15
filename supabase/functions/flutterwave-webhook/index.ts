import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secretHash = req.headers.get("verif-hash");
    const secretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    
    if (!secretKey) {
      console.error("FLUTTERWAVE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Flutterwave webhook verification is done via API call
    const body = await req.json();
    console.log("Flutterwave webhook event:", body.event);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (body.event === "charge.completed" && body.data.status === "successful") {
      const transactionData = body.data;
      const txRef = transactionData.tx_ref;
      const metadata = transactionData.meta || {};

      // Verify transaction with Flutterwave API
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionData.id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();
      
      if (verifyData.status !== "success" || verifyData.data.status !== "successful") {
        console.error("Transaction verification failed");
        return new Response(JSON.stringify({ error: "Verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update payment record
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          provider_reference: txRef,
          metadata: transactionData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", metadata.payment_id);

      if (updateError) {
        console.error("Error updating payment:", updateError);
        throw updateError;
      }

      // Update application based on payment type
      if (metadata.payment_type === "application_fee") {
        await supabase
          .from("applications")
          .update({ application_fee_paid: true, updated_at: new Date().toISOString() })
          .eq("id", metadata.application_id);
      } else if (metadata.payment_type === "registration_fee") {
        // Get application details including registration number and trainee info
        const { data: application } = await supabase
          .from("applications")
          .select(`
            *,
            profiles!applications_trainee_id_fkey(full_name, email),
            programs(id, title)
          `)
          .eq("id", metadata.application_id)
          .single();

        if (application) {
          // Update application as registration paid
          await supabase
            .from("applications")
            .update({ registration_fee_paid: true, updated_at: new Date().toISOString() })
            .eq("id", metadata.application_id);

          // Update program enrolled count
          await supabase.rpc("increment_enrolled_count", { program_id: application.program_id });

          // Send registration complete email with ID card
          try {
            const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                to: application.profiles?.email || metadata.trainee_email,
                template: 'registration_complete',
                data: {
                  name: application.profiles?.full_name || 'Trainee',
                  program: application.programs?.title || 'Training Program',
                  registration_number: application.registration_number || '',
                  dashboard_url: `${metadata.callback_url?.split('/dashboard')[0] || ''}/dashboard`,
                  id_card_url: `${metadata.callback_url?.split('/dashboard')[0] || ''}/dashboard/id-card`,
                },
              }),
            });
            
            if (!emailResponse.ok) {
              console.error("Failed to send registration email:", await emailResponse.text());
            } else {
              console.log("Registration complete email sent successfully");
            }
          } catch (emailError) {
            console.error("Error sending registration email:", emailError);
          }
        }
      }

      // Create receipt
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await supabase.from("receipts").insert({
        payment_id: metadata.payment_id,
        trainee_id: metadata.trainee_id,
        receipt_number: receiptNumber,
      });

      console.log("Flutterwave payment processed successfully:", txRef);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
