import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { useEffect } from 'react';

export interface ThemeConfig {
  primary_color: string;
  primary_foreground: string;
  secondary_color: string;
  secondary_foreground: string;
  accent_color: string;
  accent_foreground: string;
  background_color: string;
  foreground_color: string;
  muted_color: string;
  muted_foreground: string;
  border_color: string;
  card_color: string;
  card_foreground: string;
  destructive_color: string;
  destructive_foreground: string;
  sidebar_background: string;
  sidebar_foreground: string;
  sidebar_primary: string;
  sidebar_accent: string;
}

export function useThemeConfig() {
  return useQuery({
    queryKey: ['theme-config'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/theme_config');
      return data as ThemeConfig;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateThemeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<ThemeConfig>) => {
      const data = await apiFetch('/api/site-config/theme_config', { method: 'PUT', body: JSON.stringify(updates) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-config'] });
    },
  });
}

// Hook to apply theme to document
export function useApplyTheme() {
  const { data: theme } = useThemeConfig();

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    
    root.style.setProperty('--primary', theme.primary_color);
    root.style.setProperty('--primary-foreground', theme.primary_foreground);
    root.style.setProperty('--secondary', theme.secondary_color);
    root.style.setProperty('--secondary-foreground', theme.secondary_foreground);
    root.style.setProperty('--accent', theme.accent_color);
    root.style.setProperty('--accent-foreground', theme.accent_foreground);
    root.style.setProperty('--background', theme.background_color);
    root.style.setProperty('--foreground', theme.foreground_color);
    root.style.setProperty('--muted', theme.muted_color);
    root.style.setProperty('--muted-foreground', theme.muted_foreground);
    root.style.setProperty('--border', theme.border_color);
    root.style.setProperty('--input', theme.border_color);
    root.style.setProperty('--ring', theme.primary_color);
    root.style.setProperty('--card', theme.card_color);
    root.style.setProperty('--card-foreground', theme.card_foreground);
    root.style.setProperty('--popover', theme.card_color);
    root.style.setProperty('--popover-foreground', theme.card_foreground);
    root.style.setProperty('--destructive', theme.destructive_color);
    root.style.setProperty('--destructive-foreground', theme.destructive_foreground);
    root.style.setProperty('--sidebar-background', theme.sidebar_background);
    root.style.setProperty('--sidebar-foreground', theme.sidebar_foreground);
    root.style.setProperty('--sidebar-primary', theme.sidebar_primary);
    root.style.setProperty('--sidebar-primary-foreground', theme.primary_foreground);
    root.style.setProperty('--sidebar-accent', theme.sidebar_accent);
    root.style.setProperty('--sidebar-accent-foreground', theme.primary_foreground);
    root.style.setProperty('--sidebar-border', theme.sidebar_accent);
    root.style.setProperty('--sidebar-ring', theme.sidebar_primary);
  }, [theme]);

  return theme;
}
