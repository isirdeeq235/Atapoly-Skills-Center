import { useEffect } from 'react';
import { useThemeConfig } from '@/hooks/useThemeConfig';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: theme, isLoading } = useThemeConfig();

  useEffect(() => {
    if (!theme || isLoading) return;

    const root = document.documentElement;
    
    // Apply all theme colors as CSS variables
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
  }, [theme, isLoading]);

  return <>{children}</>;
}
