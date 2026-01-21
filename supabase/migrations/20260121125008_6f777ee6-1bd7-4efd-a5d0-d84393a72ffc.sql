-- Create a database function to notify all admins when a new application is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_new_application(
  p_trainee_name text,
  p_program_title text,
  p_application_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT 
    ur.user_id, 
    'application_submitted', 
    'New Application Submitted 📋',
    p_trainee_name || ' has submitted an application for ' || p_program_title || '. Please review it.',
    jsonb_build_object('application_id', p_application_id, 'program_title', p_program_title, 'trainee_name', p_trainee_name)
  FROM public.user_roles ur
  WHERE ur.role IN ('admin', 'super_admin');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;