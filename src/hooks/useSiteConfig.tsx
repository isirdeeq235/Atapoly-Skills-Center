import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteConfig {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  certificate_signature_url: string | null;
  maintenance_mode: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
}

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .single();

      if (error) throw error;
      return data as SiteConfig;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<SiteConfig>) => {
      const { data: existing } = await supabase
        .from('site_config')
        .select('id')
        .single();

      if (!existing) throw new Error('Site config not found');

      const { data, error } = await supabase
        .from('site_config')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
  });
}
