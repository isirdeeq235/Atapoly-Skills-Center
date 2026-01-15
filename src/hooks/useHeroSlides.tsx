import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HeroSlide[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HeroSlide[];
    },
  });
}

export function useCreateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .insert(slide)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides-all'] });
    },
  });
}

export function useUpdateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides-all'] });
    },
  });
}

export function useDeleteHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides-all'] });
    },
  });
}
