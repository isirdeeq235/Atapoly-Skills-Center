import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error("Invalid Paystack signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      const metadata = data.metadata || {};

      // Update payment record
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          provider_reference: reference,
          metadata: data,
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

        // Create notification for trainee - redirect to complete profile
        await supabase.rpc("create_notification", {
          p_user_id: metadata.trainee_id,
          p_type: "payment_success",
          p_title: "Application Fee Paid ✓",
          p_message: "Your application fee has been received. Please complete your profile to continue.",
          p_metadata: { 
            payment_id: metadata.payment_id,
            application_id: metadata.application_id,
            amount: data.amount / 100,
            next_step: "complete_profile"
          }
        });

      } else if (metadata.payment_type === "registration_fee") {
        // Get application details including program info
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
          // Generate registration number using RPC
          let registrationNumber = application.registration_number;
          if (!registrationNumber) {
            const { data: regNum } = await supabase.rpc("generate_registration_number", {
              program_title: application.programs?.title || "PROG"
            });
            registrationNumber = regNum;
            console.log("Generated registration number:", registrationNumber);
          }

          // Update application as registration paid with registration number
          await supabase
            .from("applications")
            .update({ 
              registration_fee_paid: true, 
              registration_number: registrationNumber,
              updated_at: new Date().toISOString() 
            })
            .eq("id", metadata.application_id);

          // Update program enrolled count
          await supabase.rpc("increment_enrolled_count", { program_id: application.program_id });

          // Create notification for trainee - Registration Complete
          await supabase.rpc("create_notification", {
            p_user_id: metadata.trainee_id,
            p_type: "registration_complete",
            p_title: "Registration Complete! 🎓",
            p_message: `Congratulations! You are now enrolled in ${application.programs?.title}. Your registration number is ${registrationNumber}. Visit your ID Card page to download your trainee ID.`,
            p_metadata: { 
              payment_id: metadata.payment_id,
              application_id: metadata.application_id,
              registration_number: registrationNumber,
              program_title: application.programs?.title
            }
          });

          // Send registration complete email with ID card
          const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || '';
          const dashboardUrl = baseUrl ? `${baseUrl.replace('.supabase.co', '')}/dashboard` : '';
          
          try {
            // Call the send-email function
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
                  registration_number: registrationNumber || '',
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

      console.log("Payment processed successfully:", reference);
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

