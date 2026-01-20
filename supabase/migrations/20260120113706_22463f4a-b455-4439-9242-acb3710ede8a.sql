-- Create email_templates table for database-driven email customization
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  available_placeholders JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read email templates (needed by edge function)
CREATE POLICY "Anyone can read email templates"
ON public.email_templates
FOR SELECT
USING (true);

-- Super admins can manage email templates
CREATE POLICY "Super admins can manage email templates"
ON public.email_templates
FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Insert default email templates
INSERT INTO public.email_templates (template_key, template_name, subject_template, html_template, description, available_placeholders) VALUES
(
  'welcome',
  'Welcome Email',
  'Welcome to {{site_name}}!',
  '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #0d9488; margin: 0;">Welcome! 👋</h1>
    </div>
    <p style="color: #333; font-size: 16px;">Dear <strong>{{name}}</strong>,</p>
    <p style="color: #666; line-height: 1.6;">Thank you for registering with {{site_name}}. We''re excited to have you join our community of learners!</p>
    <p style="color: #666; line-height: 1.6;">Explore our programs and start your learning journey today.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© {{year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
  'Sent when a new user registers on the platform',
  '["{{name}}", "{{site_name}}", "{{dashboard_url}}", "{{year}}"]'
),
(
  'application_approved',
  'Application Approved',
  '🎉 Application Approved - Complete Your Registration',
  '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #10b981; margin: 0;">Congratulations! 🎉</h1>
    </div>
    <p style="color: #333; font-size: 16px;">Dear <strong>{{name}}</strong>,</p>
    <p style="color: #666; line-height: 1.6;">Great news! Your application for <strong>{{program}}</strong> has been approved.</p>
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <p style="margin: 0; color: #166534;"><strong>Registration Number:</strong> {{registration_number}}</p>
    </div>
    <p style="color: #666; line-height: 1.6;">To complete your enrollment, please pay the registration fee of <strong>₦{{registration_fee}}</strong>.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Complete Registration</a>
    </div>
    {{#admin_notes}}<p style="color: #666; font-style: italic;">Admin Notes: {{admin_notes}}</p>{{/admin_notes}}
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© {{year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
  'Sent when an admin approves a trainee application',
  '["{{name}}", "{{program}}", "{{registration_number}}", "{{registration_fee}}", "{{dashboard_url}}", "{{admin_notes}}", "{{site_name}}", "{{year}}"]'
),
(
  'application_rejected',
  'Application Rejected',
  'Application Status Update',
  '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="color: #333; font-size: 16px;">Dear <strong>{{name}}</strong>,</p>
    <p style="color: #666; line-height: 1.6;">Thank you for your interest in <strong>{{program}}</strong>.</p>
    <p style="color: #666; line-height: 1.6;">After careful review, we regret to inform you that we are unable to proceed with your application at this time.</p>
    {{#admin_notes}}<div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;"><p style="margin: 0; color: #991b1b;">{{admin_notes}}</p></div>{{/admin_notes}}
    <p style="color: #666; line-height: 1.6;">If you have any questions or would like more information, please don''t hesitate to contact our support team.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© {{year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
  'Sent when an admin rejects a trainee application',
  '["{{name}}", "{{program}}", "{{admin_notes}}", "{{site_name}}", "{{year}}"]'
),
(
  'payment_receipt',
  'Payment Receipt',
  'Payment Receipt - {{payment_type}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #10b981; margin: 0;">Payment Successful ✓</h1>
    </div>
    <p style="color: #333; font-size: 16px;">Dear <strong>{{name}}</strong>,</p>
    <p style="color: #666; line-height: 1.6;">Your payment has been received successfully. Here are your transaction details:</p>
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666;">Transaction Reference:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">{{reference}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Payment Type:</td><td style="padding: 8px 0; text-align: right;">{{payment_type}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Program:</td><td style="padding: 8px 0; text-align: right;">{{program}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">₦{{amount}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; text-align: right;">{{date}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Payment Method:</td><td style="padding: 8px 0; text-align: right;">{{provider}}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{receipt_url}}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Receipt</a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© {{year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
  'Sent when a payment is successfully processed',
  '["{{name}}", "{{reference}}", "{{payment_type}}", "{{program}}", "{{amount}}", "{{date}}", "{{provider}}", "{{receipt_url}}", "{{site_name}}", "{{year}}"]'
),
(
  'registration_complete',
  'Registration Complete',
  '🎓 Registration Complete - Your ID Card is Ready!',
  '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0d9488; margin: 0;">Registration Complete! 🎓</h1>
    </div>
    <p style="color: #333; font-size: 16px;">Dear <strong>{{name}}</strong>,</p>
    <p style="color: #666; line-height: 1.6;">Congratulations! You are now officially enrolled in <strong>{{program}}</strong>.</p>
    
    <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 25px; border-radius: 12px; margin: 25px 0; color: white; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Trainee ID</p>
      <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">{{registration_number}}</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">What''s Next?</h3>
      <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Download your Digital ID Card from your dashboard</li>
        <li>Check your training schedule for upcoming sessions</li>
        <li>Access your program resources and materials</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="{{id_card_url}}" style="color: #0d9488; text-decoration: underline; font-weight: 500;">Download ID Card →</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© {{year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
  'Sent when trainee completes full registration with payment',
  '["{{name}}", "{{program}}", "{{registration_number}}", "{{dashboard_url}}", "{{id_card_url}}", "{{site_name}}", "{{year}}"]'
);

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();