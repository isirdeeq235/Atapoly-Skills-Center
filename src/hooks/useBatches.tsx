import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Batch {
  id: string;
  program_id: string;
  batch_name: string;
  start_date: string;
  end_date: string | null;
  max_capacity: number | null;
  enrolled_count: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useBatches(programId?: string, statusFilter?: string | string[]) {
  return useQuery({
    queryKey: ['batches', programId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('batches')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (programId) {
        query = query.eq('program_id', programId);
      }

      // Filter by status - default to open, upcoming, and ongoing for trainee selection
      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          query = query.in('status', statusFilter);
        } else {
          query = query.eq('status', statusFilter);
        }
      } else {
        // Default: show open, upcoming, and ongoing batches for trainee selection
        // Exclude only 'closed' and 'completed' batches
        query = query.in('status', ['open', 'upcoming', 'ongoing']);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Batch[];
    },
    enabled: !!programId,
  });
}

export function useAllBatches() {
  return useQuery({
    queryKey: ['batches', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*, programs(title)')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
