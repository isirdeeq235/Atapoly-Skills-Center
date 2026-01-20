-- Drop the existing status check constraint
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_status_check;

-- Add a new check constraint that includes all valid statuses
ALTER TABLE public.batches ADD CONSTRAINT batches_status_check 
CHECK (status IN ('open', 'upcoming', 'ongoing', 'completed', 'closed'));