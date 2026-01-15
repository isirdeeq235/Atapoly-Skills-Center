-- Function to increment enrolled count
CREATE OR REPLACE FUNCTION public.increment_enrolled_count(program_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.programs
  SET enrolled_count = enrolled_count + 1
  WHERE id = program_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;