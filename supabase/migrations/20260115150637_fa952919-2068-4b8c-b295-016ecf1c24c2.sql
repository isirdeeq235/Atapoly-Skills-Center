-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'instructor', 'trainee');

-- Create program status enum
CREATE TYPE public.program_status AS ENUM ('draft', 'published', 'archived');

-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create payment type enum
CREATE TYPE public.payment_type AS ENUM ('application_fee', 'registration_fee');

-- Create payment provider enum
CREATE TYPE public.payment_provider AS ENUM ('paystack', 'flutterwave');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- USER ROLES TABLE (Separate for security)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'trainee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ============================================
-- SITE CONFIG TABLE (Single row)
-- ============================================
CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'TrainHub',
  logo_url TEXT,
  favicon_url TEXT,
  certificate_signature_url TEXT,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default site config
INSERT INTO public.site_config (site_name) VALUES ('TrainHub');

-- ============================================
-- PAYMENT SETTINGS TABLE
-- ============================================
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paystack_public_key TEXT,
  paystack_secret_key TEXT,
  paystack_enabled BOOLEAN NOT NULL DEFAULT false,
  flutterwave_public_key TEXT,
  flutterwave_secret_key TEXT,
  flutterwave_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default payment settings
INSERT INTO public.payment_settings (paystack_enabled, flutterwave_enabled) VALUES (false, false);

-- ============================================
-- HERO SLIDES TABLE
-- ============================================
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default hero slide
INSERT INTO public.hero_slides (title, subtitle, cta_text, cta_link, display_order)
VALUES ('Transform Your Training Management Experience', 'A complete platform for managing training programs, tracking progress, processing payments, and empowering learners to achieve their goals.', 'Start Your Journey', '/register', 1);

-- ============================================
-- PROGRAMS TABLE
-- ============================================
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  application_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  registration_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_capacity INT,
  enrolled_count INT NOT NULL DEFAULT 0,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status program_status NOT NULL DEFAULT 'draft',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  application_fee_paid BOOLEAN NOT NULL DEFAULT false,
  registration_fee_paid BOOLEAN NOT NULL DEFAULT false,
  registration_number TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trainee_id, program_id)
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type payment_type NOT NULL,
  provider payment_provider NOT NULL,
  provider_reference TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RECEIPTS TABLE
-- ============================================
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Check if user is admin or higher
CREATE OR REPLACE FUNCTION public.is_admin_or_higher(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND role = 'super_admin'
  );
$$;

-- Check if user is instructor
CREATE OR REPLACE FUNCTION public.is_instructor(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND role = 'instructor'
  );
$$;

-- ============================================
-- AUTO-CREATE PROFILE & ROLE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Create user role (default trainee, unless specified)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'trainee')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATE TIMESTAMPS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- RLS POLICIES: USER ROLES
-- ============================================
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Only super admin can modify roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: SITE CONFIG
-- ============================================
CREATE POLICY "Anyone can view site config"
  ON public.site_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only super admin can update site config"
  ON public.site_config FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: PAYMENT SETTINGS
-- ============================================
CREATE POLICY "Only super admin can view payment settings"
  ON public.payment_settings FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Only super admin can update payment settings"
  ON public.payment_settings FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: HERO SLIDES
-- ============================================
CREATE POLICY "Anyone can view active hero slides"
  ON public.hero_slides FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage hero slides"
  ON public.hero_slides FOR ALL
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()))
  WITH CHECK (public.is_admin_or_higher(auth.uid()));

-- ============================================
-- RLS POLICIES: PROGRAMS
-- ============================================
CREATE POLICY "Anyone can view published programs"
  ON public.programs FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin_or_higher(auth.uid()) OR instructor_id = auth.uid());

CREATE POLICY "Admins can create programs"
  ON public.programs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins and assigned instructors can update programs"
  ON public.programs FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()) OR (instructor_id = auth.uid() AND public.is_instructor(auth.uid())))
  WITH CHECK (public.is_admin_or_higher(auth.uid()) OR (instructor_id = auth.uid() AND public.is_instructor(auth.uid())));

CREATE POLICY "Admins can delete programs"
  ON public.programs FOR DELETE
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()));

-- ============================================
-- RLS POLICIES: APPLICATIONS
-- ============================================
CREATE POLICY "Trainees can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (trainee_id = auth.uid() OR public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Trainees can create applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (trainee_id = auth.uid());

CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()))
  WITH CHECK (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can delete applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()));

-- ============================================
-- RLS POLICIES: PAYMENTS
-- ============================================
CREATE POLICY "Trainees can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (trainee_id = auth.uid() OR public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Trainees can create payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (trainee_id = auth.uid());

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()))
  WITH CHECK (public.is_admin_or_higher(auth.uid()));

-- ============================================
-- RLS POLICIES: RECEIPTS
-- ============================================
CREATE POLICY "Trainees can view own receipts"
  ON public.receipts FOR SELECT
  TO authenticated
  USING (trainee_id = auth.uid() OR public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage receipts"
  ON public.receipts FOR ALL
  TO authenticated
  USING (public.is_admin_or_higher(auth.uid()))
  WITH CHECK (public.is_admin_or_higher(auth.uid()));

-- ============================================
-- CREATE STORAGE BUCKET FOR RECEIPTS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Storage policies for receipts
CREATE POLICY "Trainees can view own receipt files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin_or_higher(auth.uid())));

CREATE POLICY "Admins can upload receipt files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND public.is_admin_or_higher(auth.uid()));

-- ============================================
-- CREATE STORAGE BUCKET FOR SITE ASSETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Storage policies for site assets
CREATE POLICY "Anyone can view site assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "Super admin can manage site assets"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_super_admin(auth.uid()))
  WITH CHECK (bucket_id = 'site-assets' AND public.is_super_admin(auth.uid()));