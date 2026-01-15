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
      } else if (metadata.payment_type === "registration_fee") {
        await supabase
          .from("applications")
          .update({ registration_fee_paid: true, updated_at: new Date().toISOString() })
          .eq("id", metadata.application_id);

        // Update program enrolled count
        const { data: application } = await supabase
          .from("applications")
          .select("program_id")
          .eq("id", metadata.application_id)
          .single();

        if (application) {
          await supabase.rpc("increment_enrolled_count", { program_id: application.program_id });
        }
      }

      // Create receipt
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await supabase.from("receipts").insert({
        payment_id: metadata.payment_id,
        trainee_id: metadata.trainee_id,
        receipt_number: receiptNumber,
      });

      // Send confirmation email via SMTP
      try {
        await sendEmailNotification(metadata.trainee_email, metadata.payment_type, data.amount / 100);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

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

async function sendEmailNotification(to: string, paymentType: string, amount: number) {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("SMTP not configured, skipping email");
    return;
  }

  console.log(`Email would be sent to ${to} for ${paymentType} payment of ₦${amount}`);
  // Note: Deno doesn't have native SMTP support, would need external service
  // For production, consider using a service like SendGrid, Mailgun, or AWS SES
}
