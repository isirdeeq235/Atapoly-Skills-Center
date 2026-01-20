-- Theme Configuration Table (for dynamic colors)
CREATE TABLE public.theme_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (singleton = true),
  primary_color TEXT NOT NULL DEFAULT '24 96% 45%',
  primary_foreground TEXT NOT NULL DEFAULT '0 0% 100%',
  secondary_color TEXT NOT NULL DEFAULT '30 100% 96%',
  secondary_foreground TEXT NOT NULL DEFAULT '24 96% 30%',
  accent_color TEXT NOT NULL DEFAULT '160 84% 39%',
  accent_foreground TEXT NOT NULL DEFAULT '0 0% 100%',
  background_color TEXT NOT NULL DEFAULT '30 40% 98%',
  foreground_color TEXT NOT NULL DEFAULT '24 30% 15%',
  muted_color TEXT NOT NULL DEFAULT '30 30% 94%',
  muted_foreground TEXT NOT NULL DEFAULT '24 20% 47%',
  border_color TEXT NOT NULL DEFAULT '30 30% 88%',
  card_color TEXT NOT NULL DEFAULT '0 0% 100%',
  card_foreground TEXT NOT NULL DEFAULT '24 30% 15%',
  destructive_color TEXT NOT NULL DEFAULT '0 84% 60%',
  destructive_foreground TEXT NOT NULL DEFAULT '0 0% 100%',
  sidebar_background TEXT NOT NULL DEFAULT '24 40% 12%',
  sidebar_foreground TEXT NOT NULL DEFAULT '30 40% 90%',
  sidebar_primary TEXT NOT NULL DEFAULT '24 96% 50%',
  sidebar_accent TEXT NOT NULL DEFAULT '24 40% 20%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Homepage Content Table
CREATE TABLE public.homepage_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (singleton = true),
  hero_title TEXT NOT NULL DEFAULT 'Transform Your Career',
  hero_subtitle TEXT NOT NULL DEFAULT 'Join our professional training programs',
  hero_cta_text TEXT NOT NULL DEFAULT 'Apply Now',
  hero_cta_link TEXT NOT NULL DEFAULT '/register',
  hero_image_url TEXT,
  features_title TEXT NOT NULL DEFAULT 'Why Choose Us',
  features_subtitle TEXT NOT NULL DEFAULT 'Excellence in training and professional development',
  feature_1_title TEXT NOT NULL DEFAULT 'Expert Instructors',
  feature_1_description TEXT NOT NULL DEFAULT 'Learn from industry professionals with years of experience',
  feature_1_icon TEXT NOT NULL DEFAULT 'GraduationCap',
  feature_2_title TEXT NOT NULL DEFAULT 'Hands-on Training',
  feature_2_description TEXT NOT NULL DEFAULT 'Practical exercises and real-world projects',
  feature_2_icon TEXT NOT NULL DEFAULT 'Briefcase',
  feature_3_title TEXT NOT NULL DEFAULT 'Certification',
  feature_3_description TEXT NOT NULL DEFAULT 'Receive recognized certificates upon completion',
  feature_3_icon TEXT NOT NULL DEFAULT 'Award',
  feature_4_title TEXT NOT NULL DEFAULT 'Career Support',
  feature_4_description TEXT NOT NULL DEFAULT 'Job placement assistance and career guidance',
  feature_4_icon TEXT NOT NULL DEFAULT 'Users',
  cta_title TEXT NOT NULL DEFAULT 'Ready to Start Your Journey?',
  cta_subtitle TEXT NOT NULL DEFAULT 'Join thousands of successful graduates',
  cta_button_text TEXT NOT NULL DEFAULT 'Get Started Today',
  cta_button_link TEXT NOT NULL DEFAULT '/register',
  footer_about TEXT NOT NULL DEFAULT 'We are a leading training institution committed to excellence.',
  show_programs_section BOOLEAN NOT NULL DEFAULT true,
  show_how_it_works BOOLEAN NOT NULL DEFAULT true,
  show_testimonials BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ID Card Template Table
CREATE TABLE public.id_card_template (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (singleton = true),
  background_color TEXT NOT NULL DEFAULT '24 96% 45%',
  text_color TEXT NOT NULL DEFAULT '0 0% 100%',
  header_text TEXT NOT NULL DEFAULT 'STUDENT IDENTITY CARD',
  show_logo BOOLEAN NOT NULL DEFAULT true,
  show_qr_code BOOLEAN NOT NULL DEFAULT true,
  show_photo BOOLEAN NOT NULL DEFAULT true,
  show_registration_number BOOLEAN NOT NULL DEFAULT true,
  show_program BOOLEAN NOT NULL DEFAULT true,
  show_batch BOOLEAN NOT NULL DEFAULT true,
  show_validity_date BOOLEAN NOT NULL DEFAULT true,
  show_emergency_contact BOOLEAN NOT NULL DEFAULT true,
  custom_fields JSONB DEFAULT '[]',
  footer_text TEXT NOT NULL DEFAULT 'This card is property of the institution',
  card_width INTEGER NOT NULL DEFAULT 350,
  card_height INTEGER NOT NULL DEFAULT 220,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Certificate Template Table
CREATE TABLE public.certificate_template (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (singleton = true),
  border_style TEXT NOT NULL DEFAULT 'classic',
  background_color TEXT NOT NULL DEFAULT '0 0% 100%',
  text_color TEXT NOT NULL DEFAULT '24 30% 15%',
  accent_color TEXT NOT NULL DEFAULT '24 96% 45%',
  header_text TEXT NOT NULL DEFAULT 'CERTIFICATE OF COMPLETION',
  subheader_text TEXT NOT NULL DEFAULT 'This is to certify that',
  body_template TEXT NOT NULL DEFAULT '{{trainee_name}} has successfully completed the {{program_title}} program on {{completion_date}}.',
  footer_text TEXT NOT NULL DEFAULT 'Awarded this {{issue_day}} day of {{issue_month}}, {{issue_year}}',
  show_logo BOOLEAN NOT NULL DEFAULT true,
  show_signature BOOLEAN NOT NULL DEFAULT true,
  show_certificate_number BOOLEAN NOT NULL DEFAULT true,
  show_qr_code BOOLEAN NOT NULL DEFAULT false,
  signature_title TEXT NOT NULL DEFAULT 'Director',
  signature_name TEXT,
  paper_size TEXT NOT NULL DEFAULT 'A4',
  orientation TEXT NOT NULL DEFAULT 'landscape',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification Templates Table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default notification templates
INSERT INTO public.notification_templates (template_key, title_template, message_template) VALUES
('application_submitted', 'Application Submitted', 'Your application for {{program_title}} has been submitted successfully.'),
('application_approved', 'Application Approved', 'Congratulations! Your application for {{program_title}} has been approved.'),
('application_rejected', 'Application Rejected', 'Your application for {{program_title}} has been rejected. {{reason}}'),
('payment_received', 'Payment Received', 'Your payment of ₦{{amount}} for {{payment_type}} has been received.'),
('registration_complete', 'Registration Complete', 'Your registration for {{program_title}} is complete. Your ID: {{registration_number}}'),
('certificate_issued', 'Certificate Issued', 'Your certificate for {{program_title}} is now available for download.');

-- Insert default records
INSERT INTO public.theme_config (singleton) VALUES (true);
INSERT INTO public.homepage_content (singleton) VALUES (true);
INSERT INTO public.id_card_template (singleton) VALUES (true);
INSERT INTO public.certificate_template (singleton) VALUES (true);

-- Enable RLS
ALTER TABLE public.theme_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_card_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for theme and homepage
CREATE POLICY "Anyone can read theme config"
ON public.theme_config FOR SELECT
USING (true);

CREATE POLICY "Anyone can read homepage content"
ON public.homepage_content FOR SELECT
USING (true);

CREATE POLICY "Anyone can read ID card template"
ON public.id_card_template FOR SELECT
USING (true);

CREATE POLICY "Anyone can read certificate template"
ON public.certificate_template FOR SELECT
USING (true);

CREATE POLICY "Anyone can read notification templates"
ON public.notification_templates FOR SELECT
USING (true);

-- Super admin write access
CREATE POLICY "Super admins can update theme config"
ON public.theme_config FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update homepage content"
ON public.homepage_content FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update ID card template"
ON public.id_card_template FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update certificate template"
ON public.certificate_template FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage notification templates"
ON public.notification_templates FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Update triggers
CREATE TRIGGER update_theme_config_updated_at
BEFORE UPDATE ON public.theme_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_content_updated_at
BEFORE UPDATE ON public.homepage_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_id_card_template_updated_at
BEFORE UPDATE ON public.id_card_template
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificate_template_updated_at
BEFORE UPDATE ON public.certificate_template
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();