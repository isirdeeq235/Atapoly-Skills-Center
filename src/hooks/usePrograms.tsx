import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export interface Program {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  application_fee: number;
  registration_fee: number;
  max_capacity: number | null;
  enrolled_count: number;
  instructor_id: string | null;
  status: 'draft' | 'published' | 'archived';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function usePrograms(showAll: boolean = false) {
  return useQuery({
    queryKey: ['programs', showAll],
    queryFn: async () => {
      const q = showAll ? '/api/programs?showAll=true' : '/api/programs';
      const data = await apiFetch(q) as Program[];
      return data;
    },
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Program;
    },
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: Omit<Program, 'id' | 'created_at' | 'updated_at' | 'enrolled_count'>) => {
      const { data, error } = await supabase
        .from('programs')
        .insert(program)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Program> & { id: string }) => {
      const { data, error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
