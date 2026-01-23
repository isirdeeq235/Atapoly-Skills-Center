-- Add resubmission_count column if not exists
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS resubmission_count INTEGER DEFAULT 0;

-- Enable realtime for status_history and payments only (applications already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'status_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.status_history;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create function to log status changes automatically
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.status_history (
      application_id,
      trainee_id,
      previous_status,
      new_status,
      changed_by,
      change_type,
      notes,
      metadata
    ) VALUES (
      NEW.id,
      NEW.trainee_id,
      OLD.status,
      NEW.status,
      auth.uid(),
      'status_change',
      NEW.admin_notes,
      jsonb_build_object(
        'registration_number', NEW.registration_number,
        'submitted', NEW.submitted,
        'application_fee_paid', NEW.application_fee_paid,
        'registration_fee_paid', NEW.registration_fee_paid
      )
    );
  END IF;
  
  -- Log payment status changes
  IF OLD.application_fee_paid IS DISTINCT FROM NEW.application_fee_paid AND NEW.application_fee_paid = true THEN
    INSERT INTO public.status_history (
      application_id,
      trainee_id,
      previous_status,
      new_status,
      changed_by,
      change_type,
      metadata
    ) VALUES (
      NEW.id,
      NEW.trainee_id,
      'unpaid',
      'application_fee_paid',
      auth.uid(),
      'payment_update',
      jsonb_build_object('payment_type', 'application_fee')
    );
  END IF;
  
  IF OLD.registration_fee_paid IS DISTINCT FROM NEW.registration_fee_paid AND NEW.registration_fee_paid = true THEN
    INSERT INTO public.status_history (
      application_id,
      trainee_id,
      previous_status,
      new_status,
      changed_by,
      change_type,
      metadata
    ) VALUES (
      NEW.id,
      NEW.trainee_id,
      'approved',
      'registration_fee_paid',
      auth.uid(),
      'payment_update',
      jsonb_build_object('payment_type', 'registration_fee')
    );
  END IF;
  
  -- Log submission
  IF OLD.submitted IS DISTINCT FROM NEW.submitted AND NEW.submitted = true THEN
    INSERT INTO public.status_history (
      application_id,
      trainee_id,
      previous_status,
      new_status,
      changed_by,
      change_type
    ) VALUES (
      NEW.id,
      NEW.trainee_id,
      'draft',
      'submitted',
      auth.uid(),
      'submission'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_application_status_change ON public.applications;

CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_status_change();

-- Create function to handle resubmission
CREATE OR REPLACE FUNCTION public.resubmit_application(p_application_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_trainee_id UUID;
  v_current_status TEXT;
BEGIN
  -- Get current application
  SELECT trainee_id, status INTO v_trainee_id, v_current_status
  FROM public.applications
  WHERE id = p_application_id;
  
  -- Verify ownership
  IF v_trainee_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to resubmit this application';
  END IF;
  
  -- Only allow resubmission if rejected
  IF v_current_status != 'rejected' THEN
    RAISE EXCEPTION 'Only rejected applications can be resubmitted';
  END IF;
  
  -- Update application status back to pending
  UPDATE public.applications
  SET 
    status = 'pending',
    submitted = true,
    submitted_at = now(),
    resubmission_count = COALESCE(resubmission_count, 0) + 1,
    admin_notes = NULL,
    updated_at = now()
  WHERE id = p_application_id;
  
  -- Log resubmission
  INSERT INTO public.status_history (
    application_id,
    trainee_id,
    previous_status,
    new_status,
    changed_by,
    change_type
  ) VALUES (
    p_application_id,
    v_trainee_id,
    'rejected',
    'pending',
    auth.uid(),
    'resubmission'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;