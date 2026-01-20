import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, string>;
}

// Fallback templates (used if database templates are not available)
const fallbackTemplates: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  application_approved: (data) => ({
    subject: "🎉 Application Approved - Complete Your Registration",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Congratulations! 🎉</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Great news! Your application for <strong>${data.program}</strong> has been approved.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #166534;"><strong>Registration Number:</strong> ${data.registration_number}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">To complete your enrollment, please pay the registration fee of <strong>₦${data.registration_fee}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboard_url}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Complete Registration</a>
          </div>
          ${data.admin_notes ? `<p style="color: #666; font-style: italic;">Admin Notes: ${data.admin_notes}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Training Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  }),

  application_rejected: (data) => ({
    subject: "Application Status Update",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Thank you for your interest in <strong>${data.program}</strong>.</p>
          <p style="color: #666; line-height: 1.6;">After careful review, we regret to inform you that we are unable to proceed with your application at this time.</p>
          ${data.admin_notes ? `<div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;"><p style="margin: 0; color: #991b1b;">${data.admin_notes}</p></div>` : ''}
          <p style="color: #666; line-height: 1.6;">If you have any questions or would like more information, please don't hesitate to contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Training Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  }),

  payment_receipt: (data) => ({
    subject: `Payment Receipt - ${data.payment_type}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #10b981; margin: 0;">Payment Successful ✓</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Your payment has been received successfully.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Reference:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.reference}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">₦${data.amount}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; text-align: right;">${data.date}</td></tr>
            </table>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Training Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: (data) => ({
    subject: "Welcome to Our Training Platform!",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0d9488; margin: 0;">Welcome! 👋</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Thank you for registering with our training platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboard_url}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Training Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  }),

  registration_complete: (data) => ({
    subject: "🎓 Registration Complete - Your ID Card is Ready!",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0d9488; margin: 0;">Registration Complete! 🎓</h1>
          </div>
          <p style="color: #333; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Congratulations! You are now officially enrolled in <strong>${data.program}</strong>.</p>
          <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 25px; border-radius: 12px; margin: 25px 0; color: white; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Trainee ID</p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${data.registration_number}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboard_url}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Your Dashboard</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Training Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  }),
};

// Replace placeholders in template
function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  
  // Add common placeholders
  data.year = new Date().getFullYear().toString();
  
  // Replace simple placeholders {{key}}
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  // Handle conditional blocks {{#key}}...{{/key}}
  Object.entries(data).forEach(([key, value]) => {
    const conditionalRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{/${key}\\}\\}`, 'g');
    if (value) {
      result = result.replace(conditionalRegex, '$1');
    } else {
      result = result.replace(conditionalRegex, '');
    }
  });
  
  // Remove any remaining conditional blocks for keys not in data
  result = result.replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, '');
  
  return result;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      console.error("SMTP configuration incomplete");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html, text, template, data }: EmailRequest = await req.json();

    let emailSubject = subject;
    let emailHtml = html;

    // Try to fetch template from database if template key is provided
    if (template && data && supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: dbTemplate, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('template_key', template)
          .eq('is_enabled', true)
          .single();

        if (dbTemplate && !error) {
          console.log(`Using database template for: ${template}`);
          emailSubject = replacePlaceholders(dbTemplate.subject_template, data);
          emailHtml = replacePlaceholders(dbTemplate.html_template, data);
        } else {
          console.log(`Database template not found for: ${template}, using fallback`);
          // Fall back to hardcoded template
          if (fallbackTemplates[template]) {
            const templateResult = fallbackTemplates[template](data);
            emailSubject = templateResult.subject;
            emailHtml = templateResult.html;
          }
        }
      } catch (dbError) {
        console.error("Error fetching template from database:", dbError);
        // Fall back to hardcoded template
        if (fallbackTemplates[template]) {
          const templateResult = fallbackTemplates[template](data);
          emailSubject = templateResult.subject;
          emailHtml = templateResult.html;
        }
      }
    } else if (template && data && fallbackTemplates[template]) {
      // Use fallback template if no database connection
      const templateResult = fallbackTemplates[template](data);
      emailSubject = templateResult.subject;
      emailHtml = templateResult.html;
    }

    if (!to || !emailSubject || !emailHtml) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject/template, html/data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to ${to} with subject: ${emailSubject}`);

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    await client.send({
      from: fromEmail,
      to: to,
      subject: emailSubject,
      content: text || "",
      html: emailHtml,
    });

    await client.close();

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
