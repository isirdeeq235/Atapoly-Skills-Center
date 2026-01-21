import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  reference: string;
  provider: "paystack" | "flutterwave";
  payment_id?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { reference, provider, payment_id }: VerifyRequest = await req.json();
    console.log("Verifying payment:", { reference, provider, payment_id });

    if (!reference && !payment_id) {
      return new Response(JSON.stringify({ error: "Reference or payment_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // First check if payment is already completed
    let paymentQuery = supabase.from("payments").select("*");
    if (payment_id) {
      paymentQuery = paymentQuery.eq("id", payment_id);
    }
    
    const { data: existingPayment } = await paymentQuery.single();
    
    if (existingPayment?.status === "completed") {
      console.log("Payment already verified as completed");
      return new Response(JSON.stringify({ 
        success: true, 
        status: "completed",
        already_processed: true,
        payment: existingPayment
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let verificationResult: { success: boolean; data?: any; error?: string } = { success: false };

    if (provider === "paystack") {
      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        throw new Error("Paystack not configured");
      }

      console.log("Verifying with Paystack, reference:", reference);
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });

      const data = await response.json();
      console.log("Paystack verification response:", JSON.stringify(data));

      if (data.status && data.data.status === "success") {
        verificationResult = { success: true, data: data.data };
      } else {
        verificationResult = { success: false, error: data.message || "Payment not successful" };
      }
    } else if (provider === "flutterwave") {
      const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!flutterwaveSecretKey) {
        throw new Error("Flutterwave not configured");
      }

      console.log("Verifying with Flutterwave, reference:", reference);
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
        },
      });

      const data = await response.json();
      console.log("Flutterwave verification response:", JSON.stringify(data));

      if (data.status === "success" && data.data.status === "successful") {
        verificationResult = { success: true, data: data.data };
      } else {
        verificationResult = { success: false, error: data.message || "Payment not successful" };
      }
    }

    if (!verificationResult.success) {
      console.log("Payment verification failed:", verificationResult.error);
      return new Response(JSON.stringify({ 
        success: false, 
        status: "failed",
        error: verificationResult.error 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Payment verified - update payment record
    const paymentData = verificationResult.data;
    const metadata = provider === "paystack" ? paymentData.metadata : paymentData.meta;

    console.log("Payment verified successfully, updating records...");

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        provider_reference: reference,
        metadata: paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata?.payment_id || payment_id);

    if (updateError) {
      console.error("Error updating payment:", updateError);
      throw updateError;
    }

    const applicationId = metadata?.application_id;
    const traineeId = metadata?.trainee_id;
    const paymentType = metadata?.payment_type;

    // Update application based on payment type
    if (paymentType === "application_fee") {
      console.log("Updating application fee paid status for:", applicationId);
      await supabase
        .from("applications")
        .update({ application_fee_paid: true, updated_at: new Date().toISOString() })
        .eq("id", applicationId);

      // Create notification for trainee
      await supabase.rpc("create_notification", {
        p_user_id: traineeId,
        p_type: "payment_success",
        p_title: "Application Fee Paid ✓",
        p_message: "Your application fee has been received. Please complete your profile to continue.",
        p_metadata: { 
          payment_id: metadata?.payment_id || payment_id,
          application_id: applicationId,
          amount: provider === "paystack" ? paymentData.amount / 100 : paymentData.amount
        }
      });

    } else if (paymentType === "registration_fee") {
      console.log("Processing registration fee for:", applicationId);
      
      // Get application details including program info
      const { data: application } = await supabase
        .from("applications")
        .select(`
          *,
          profiles!applications_trainee_id_fkey(full_name, email),
          programs(id, title)
        `)
        .eq("id", applicationId)
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
          .eq("id", applicationId);

        // Update program enrolled count
        await supabase.rpc("increment_enrolled_count", { program_id: application.program_id });

        // Create notification for trainee - Registration Complete
        await supabase.rpc("create_notification", {
          p_user_id: traineeId,
          p_type: "registration_complete",
          p_title: "Registration Complete! 🎓",
          p_message: `Congratulations! You are now enrolled in ${application.programs?.title}. Your registration number is ${registrationNumber}. Visit your ID Card page to download your trainee ID.`,
          p_metadata: { 
            payment_id: metadata?.payment_id || payment_id,
            application_id: applicationId,
            registration_number: registrationNumber,
            program_title: application.programs?.title
          }
        });

        // Send registration complete email
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              to: application.profiles?.email,
              template: 'registration_complete',
              data: {
                name: application.profiles?.full_name || 'Trainee',
                program: application.programs?.title || 'Training Program',
                registration_number: registrationNumber || '',
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
      payment_id: metadata?.payment_id || payment_id,
      trainee_id: traineeId,
      receipt_number: receiptNumber,
    });

    // Get trainee profile for email
    const { data: traineeProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", traineeId)
      .single();

    // Get receipt template settings
    const { data: receiptTemplate } = await supabase
      .from("receipt_template")
      .select("*")
      .single();

    // Get site config for site name
    const { data: siteConfig } = await supabase
      .from("site_config")
      .select("site_name")
      .single();

    // Get program title
    let programTitle = "Program";
    if (metadata?.application_id) {
      const { data: app } = await supabase
        .from("applications")
        .select("programs(title)")
        .eq("id", metadata.application_id)
        .single();
      // programs is returned as an object when using .single() with a foreign key join
      const programs = (app as any)?.programs;
      if (programs?.title) {
        programTitle = programs.title;
      }
    }

    // Send receipt email if enabled
    if (receiptTemplate?.send_email_on_verification && traineeProfile?.email) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const paymentTypeLabel = paymentType === "application_fee" ? "Application Fee" : "Registration Fee";
        const amountValue = provider === "paystack" ? paymentData.amount / 100 : paymentData.amount;
        
        // Replace placeholders in email template
        const emailData: Record<string, string> = {
          name: traineeProfile.full_name || "Trainee",
          email: traineeProfile.email,
          payment_type: paymentTypeLabel,
          amount: amountValue.toLocaleString(),
          receipt_number: receiptNumber,
          program: programTitle,
          provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          reference: reference || "N/A",
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          dashboard_url: `${supabaseUrl.replace('.supabase.co', '')}/dashboard/payments`,
          site_name: siteConfig?.site_name || receiptTemplate.organization_name || "Training Center",
          year: new Date().getFullYear().toString(),
        };

        // Replace placeholders in subject and body
        let emailSubject = receiptTemplate.email_subject_template || "Payment Receipt - {{payment_type}}";
        let emailBody = receiptTemplate.email_body_template || "";

        Object.entries(emailData).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          emailSubject = emailSubject.replace(regex, value);
          emailBody = emailBody.replace(regex, value);
        });

        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: traineeProfile.email,
            subject: emailSubject,
            html: emailBody,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send receipt email:", await emailResponse.text());
        } else {
          console.log("Receipt email sent successfully to:", traineeProfile.email);
        }
      } catch (emailError) {
        console.error("Error sending receipt email:", emailError);
      }
    }

    console.log("Payment verification and processing completed successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      status: "completed",
      payment_type: paymentType,
      receipt_number: receiptNumber,
      message: paymentType === "application_fee" 
        ? "Application fee verified. Please complete your profile."
        : "Registration complete! You can now access your dashboard."
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
