import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export interface HomepageContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;
  hero_badge_text: string;
  hero_badge_visible: boolean;
  hero_stat_1_value: string;
  hero_stat_1_label: string;
  hero_stat_2_value: string;
  hero_stat_2_label: string;
  hero_stat_3_value: string;
  hero_stat_3_label: string;
  hero_stats_visible: boolean;
  hero_trust_rating: string;
  hero_trust_reviews_count: string;
  hero_trust_graduates_text: string;
  hero_trust_visible: boolean;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  features_title: string;
  features_subtitle: string;
  feature_1_title: string;
  feature_1_description: string;
  feature_1_icon: string;
  feature_2_title: string;
  feature_2_description: string;
  feature_2_icon: string;
  feature_3_title: string;
  feature_3_description: string;
  feature_3_icon: string;
  feature_4_title: string;
  feature_4_description: string;
  feature_4_icon: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  cta_button_link: string;
  footer_about: string;
  show_programs_section: boolean;
  show_how_it_works: boolean;
  show_testimonials: boolean;
}

export function useHomepageContent() {
  return useQuery({
    queryKey: ['homepage-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .single();

      if (error) throw error;
      return data as HomepageContent;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateHomepageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<HomepageContent>) => {
      const { data: existing } = await supabase
        .from('homepage_content')
        .select('id')
        .single();

      if (!existing) throw new Error('Homepage content not found');

      const { data, error } = await supabase
        .from('homepage_content')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
    },
  });
}
