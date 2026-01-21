-- Add submitted column to applications table to track when trainee has completed their application form
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS submitted boolean NOT NULL DEFAULT false;

-- Add submitted_at timestamp to track when the application was submitted
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

-- Create an index for efficient querying of submitted applications
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON public.applications (submitted, application_fee_paid, status);