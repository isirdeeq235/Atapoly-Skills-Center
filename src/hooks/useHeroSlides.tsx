import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export interface HeroSlide {
  id?: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/hero_slides');
      return (data || []) as HeroSlide[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides-all'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/hero_slides');
      return (data || []) as HeroSlide[];
    },
  });
}

// Admin helpers: update entire slides array
export function useSetHeroSlides() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slides: HeroSlide[]) => {
      const data = await apiFetch('/api/site-config/hero_slides', { method: 'PUT', body: JSON.stringify(slides) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides-all'] });
    },
  });
}
