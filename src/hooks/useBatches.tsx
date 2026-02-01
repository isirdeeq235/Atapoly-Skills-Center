import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

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
      const params = new URLSearchParams();
      if (programId) params.set('program_id', programId);

      if (statusFilter) {
        if (Array.isArray(statusFilter)) params.set('status', statusFilter.join(','));
        else params.set('status', statusFilter);
      } else {
        params.set('status', ['open', 'upcoming', 'ongoing'].join(','));
      }

      const data = await apiFetch(`/api/batches?${params.toString()}`);
      return data as Batch[];
    },
    enabled: !!programId,
  });
}

export function useAllBatches() {
  return useQuery({
    queryKey: ['batches', 'all'],
    queryFn: async () => {
      const data = await apiFetch('/api/batches');
      return data;
    },
  });
}
