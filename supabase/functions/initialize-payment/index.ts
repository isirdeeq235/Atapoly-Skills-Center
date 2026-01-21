import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  provider: "paystack" | "flutterwave";
  amount: number;
  email: string;
  payment_type: "application_fee" | "registration_fee";
  application_id: string;
  trainee_id: string;
  callback_url: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Payment request received:", JSON.stringify(body));
    
    const { provider, amount, email, payment_type, application_id, trainee_id, callback_url }: PaymentRequest = body;

    // Validate required fields
    if (!provider || !amount || !email || !payment_type || !application_id || !trainee_id) {
      console.error("Missing required fields:", { provider, amount, email, payment_type, application_id, trainee_id });
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payment record first
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        application_id,
        trainee_id,
        amount,
        payment_type,
        provider,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", JSON.stringify(paymentError));
      throw paymentError;
    }

    console.log("Payment record created:", payment.id);

    const reference = `PAY-${payment.id}-${Date.now()}`;

    if (provider === "paystack") {
      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        throw new Error("Paystack not configured");
      }

      console.log("Initializing Paystack payment for:", email, "amount:", amount);
      
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Paystack uses kobo
          reference,
          callback_url,
          metadata: {
            payment_id: payment.id,
            payment_type,
            application_id,
            trainee_id,
            trainee_email: email,
            callback_url,
          },
        }),
      });

      const data = await response.json();
      console.log("Paystack response:", JSON.stringify(data));

      if (!data.status) {
        console.error("Paystack initialization failed:", data.message);
        throw new Error(data.message || "Paystack initialization failed");
      }

      // Store the reference immediately so we can verify later
      const paystackReference = data.data.reference;
      const { error: updateError } = await supabase
        .from("payments")
        .update({ provider_reference: paystackReference })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Error storing provider reference:", updateError);
      } else {
        console.log("Stored provider reference:", paystackReference, "for payment:", payment.id);
      }

      console.log("Paystack payment initialized successfully, URL:", data.data.authorization_url);
      return new Response(JSON.stringify({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: paystackReference,
        payment_id: payment.id,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (provider === "flutterwave") {
      const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!flutterwaveSecretKey) {
        console.error("FLUTTERWAVE_SECRET_KEY not configured");
        throw new Error("Flutterwave not configured");
      }

      console.log("Initializing Flutterwave payment for:", email, "amount:", amount);

      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount,
          currency: "NGN",
          redirect_url: callback_url,
          customer: {
            email,
          },
          meta: {
            payment_id: payment.id,
            payment_type,
            application_id,
            trainee_id,
            trainee_email: email,
            callback_url,
          },
          customizations: {
            title: "Training Program Payment",
            description: payment_type === "application_fee" ? "Application Fee" : "Registration Fee",
          },
        }),
      });

      const data = await response.json();
      console.log("Flutterwave response:", JSON.stringify(data));

      if (data.status !== "success") {
        console.error("Flutterwave initialization failed:", data.message);
        throw new Error(data.message || "Flutterwave initialization failed");
      }

      // Store the reference immediately so we can verify later
      const { error: updateError } = await supabase
        .from("payments")
        .update({ provider_reference: reference })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Error storing provider reference:", updateError);
      } else {
        console.log("Stored provider reference:", reference, "for payment:", payment.id);
      }

      console.log("Flutterwave payment initialized successfully, URL:", data.data.link);

      return new Response(JSON.stringify({
        success: true,
        authorization_url: data.data.link,
        reference,
        payment_id: payment.id,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid payment provider");
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
