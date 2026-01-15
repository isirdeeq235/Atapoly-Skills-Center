-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria',
ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster onboarding check
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(id, onboarding_completed);

-- Create function to generate unique registration number
CREATE OR REPLACE FUNCTION public.generate_registration_number(program_title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  year_code TEXT;
  sequence_num INT;
  reg_number TEXT;
BEGIN
  -- Create prefix from program title (first 3 letters uppercase)
  prefix := UPPER(LEFT(REGEXP_REPLACE(program_title, '[^a-zA-Z]', '', 'g'), 3));
  IF LENGTH(prefix) < 3 THEN
    prefix := RPAD(prefix, 3, 'X');
  END IF;
  
  -- Get year code (last 2 digits)
  year_code := TO_CHAR(NOW(), 'YY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(
      REGEXP_REPLACE(
        registration_number, 
        '^[A-Z]{3}' || year_code || '-', 
        ''
      ) AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM public.applications
  WHERE registration_number LIKE prefix || year_code || '-%';
  
  -- Generate registration number: XXX25-0001
  reg_number := prefix || year_code || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN reg_number;
END;
$$;