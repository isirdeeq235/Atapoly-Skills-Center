-- Create batches table for program cohorts
CREATE TABLE public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  batch_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  max_capacity INTEGER,
  enrolled_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add batch_id to applications (optional link - existing applications work without it)
ALTER TABLE public.applications 
ADD COLUMN batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL;

-- Add completion tracking to applications
ALTER TABLE public.applications 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completion_status TEXT DEFAULT 'enrolled' CHECK (completion_status IN ('enrolled', 'completed', 'withdrawn', 'failed'));

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  issued_by UUID REFERENCES public.profiles(id),
  pdf_storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Batches policies - viewable by all authenticated, manageable by admins
CREATE POLICY "Batches are viewable by everyone" 
ON public.batches FOR SELECT USING (true);

CREATE POLICY "Admins can manage batches" 
ON public.batches FOR ALL 
USING (public.is_admin_or_higher(auth.uid()));

-- Certificates policies
CREATE POLICY "Users can view their own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = trainee_id);

CREATE POLICY "Admins can view all certificates" 
ON public.certificates FOR SELECT 
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage certificates" 
ON public.certificates FOR ALL 
USING (public.is_admin_or_higher(auth.uid()));

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number(program_title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INTEGER;
  cert_number TEXT;
BEGIN
  -- Create a prefix from the program title (first 3 letters uppercase)
  prefix := UPPER(LEFT(REGEXP_REPLACE(program_title, '[^a-zA-Z]', '', 'g'), 3));
  IF LENGTH(prefix) < 3 THEN
    prefix := RPAD(prefix, 3, 'X');
  END IF;
  
  -- Get current year
  year_suffix := TO_CHAR(NOW(), 'YY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(NULLIF(REGEXP_REPLACE(certificate_number, '^[A-Z]+' || year_suffix || '-', ''), '') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.certificates
  WHERE certificate_number LIKE prefix || year_suffix || '-%';
  
  -- Generate certificate number: ABC26-00001
  cert_number := prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN cert_number;
END;
$$;

-- Function to issue certificate
CREATE OR REPLACE FUNCTION public.issue_certificate(
  p_application_id UUID,
  p_issued_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trainee_id UUID;
  v_program_id UUID;
  v_batch_id UUID;
  v_program_title TEXT;
  v_cert_number TEXT;
  v_cert_id UUID;
  v_existing_cert UUID;
BEGIN
  -- Check if certificate already exists for this application
  SELECT id INTO v_existing_cert FROM certificates WHERE application_id = p_application_id;
  IF v_existing_cert IS NOT NULL THEN
    RETURN v_existing_cert;
  END IF;

  -- Get application details
  SELECT a.trainee_id, a.program_id, a.batch_id, p.title
  INTO v_trainee_id, v_program_id, v_batch_id, v_program_title
  FROM applications a
  JOIN programs p ON p.id = a.program_id
  WHERE a.id = p_application_id
    AND a.status = 'approved'
    AND a.registration_fee_paid = true
    AND a.completion_status = 'completed';
    
  IF v_trainee_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or not eligible for certificate';
  END IF;
  
  -- Generate certificate number
  v_cert_number := generate_certificate_number(v_program_title);
  
  -- Create certificate
  INSERT INTO certificates (trainee_id, application_id, program_id, batch_id, certificate_number, issued_by)
  VALUES (v_trainee_id, p_application_id, v_program_id, v_batch_id, v_cert_number, COALESCE(p_issued_by, auth.uid()))
  RETURNING id INTO v_cert_id;
  
  RETURN v_cert_id;
END;
$$;

-- Trigger to update batches updated_at
CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_batches_program_id ON public.batches(program_id);
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_certificates_trainee_id ON public.certificates(trainee_id);
CREATE INDEX idx_certificates_application_id ON public.certificates(application_id);
CREATE INDEX idx_applications_batch_id ON public.applications(batch_id);
CREATE INDEX idx_applications_completion_status ON public.applications(completion_status);