-- Create custom_form_fields table to store field definitions
CREATE TABLE public.custom_form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL CHECK (form_type IN ('profile', 'application')),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'email', 'phone', 'date', 'select', 'checkbox', 'radio', 'file')),
  field_options JSONB DEFAULT '[]',
  placeholder TEXT,
  help_text TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_type, field_name, program_id)
);

-- Add custom_field_values JSONB column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_field_values JSONB DEFAULT '{}';

-- Add custom_field_values JSONB column to applications table
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS custom_field_values JSONB DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.custom_form_fields ENABLE ROW LEVEL SECURITY;

-- Anyone can read active form fields
CREATE POLICY "Anyone can read active custom form fields"
ON public.custom_form_fields
FOR SELECT
USING (is_active = true OR is_super_admin(auth.uid()));

-- Super admins can manage custom form fields
CREATE POLICY "Super admins can manage custom form fields"
ON public.custom_form_fields
FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_custom_form_fields_form_type ON public.custom_form_fields(form_type);
CREATE INDEX idx_custom_form_fields_program_id ON public.custom_form_fields(program_id);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_form_fields_updated_at
BEFORE UPDATE ON public.custom_form_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();