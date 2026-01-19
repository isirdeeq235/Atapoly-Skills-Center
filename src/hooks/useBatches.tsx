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

export function useBatches(programId?: string) {
  return useQuery({
    queryKey: ['batches', programId],
    queryFn: async () => {
      let query = supabase
        .from('batches')
        .select('*')
        .eq('status', 'open')
        .order('start_date', { ascending: true });
      
      if (programId) {
        query = query.eq('program_id', programId);
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
