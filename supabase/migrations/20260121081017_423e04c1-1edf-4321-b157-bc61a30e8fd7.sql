-- Create receipt template table for super admin customization
CREATE TABLE public.receipt_template (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  header_text TEXT NOT NULL DEFAULT 'PAYMENT RECEIPT',
  organization_name TEXT NOT NULL DEFAULT 'Training Center',
  footer_text TEXT NOT NULL DEFAULT 'Thank you for your payment!',
  show_logo BOOLEAN NOT NULL DEFAULT true,
  primary_color TEXT NOT NULL DEFAULT '24 96% 45%',
  secondary_color TEXT NOT NULL DEFAULT '160 84% 39%',
  include_qr_code BOOLEAN NOT NULL DEFAULT false,
  email_subject_template TEXT NOT NULL DEFAULT 'Payment Receipt - {{payment_type}}',
  email_body_template TEXT NOT NULL DEFAULT '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #10b981; margin: 0;">Payment Confirmed ✓</h1>
    </div>
    <p style="color: #333; font-size: 16px;">Dear <strong>{{name}}</strong>,</p>
    <p style="color: #666; line-height: 1.6;">Your {{payment_type}} payment has been verified successfully.</p>
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666;">Receipt #:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">{{receipt_number}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Program:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">{{program}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">₦{{amount}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; text-align: right;">{{date}}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Provider:</td><td style="padding: 8px 0; text-align: right;">{{provider}}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Payment History</a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© {{year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
  send_email_on_verification BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receipt_template ENABLE ROW LEVEL SECURITY;

-- Anyone can read receipt template
CREATE POLICY "Anyone can read receipt template" 
ON public.receipt_template 
FOR SELECT 
USING (true);

-- Only super admins can update
CREATE POLICY "Super admins can update receipt template" 
ON public.receipt_template 
FOR UPDATE 
USING (is_super_admin(auth.uid()));

-- Insert default template
INSERT INTO public.receipt_template (singleton) VALUES (true);

-- Create updated_at trigger
CREATE TRIGGER update_receipt_template_updated_at
BEFORE UPDATE ON public.receipt_template
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();