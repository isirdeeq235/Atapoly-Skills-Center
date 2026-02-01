import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

interface SiteConfig {
  site_name?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  certificate_signature_url?: string | null;
  maintenance_mode?: boolean;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
}

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/site_config');
      return data as SiteConfig;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<SiteConfig>) => {
      const data = await apiFetch('/api/site-config/site_config', { method: 'PUT', body: JSON.stringify(updates) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
  });
}
