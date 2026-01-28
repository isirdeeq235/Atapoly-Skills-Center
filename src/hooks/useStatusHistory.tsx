import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { logger } from "@/lib/logger";

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  trainee_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  change_type: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useStatusHistory(applicationId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['status-history', applicationId || user?.id],
    queryFn: async () => {
      // Use REST API for the status_history table
      const session = await supabase.auth.getSession();
      let url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/status_history?order=created_at.desc&limit=50`;
      
      if (applicationId) {
        url += `&application_id=eq.${applicationId}`;
      } else if (user?.id) {
        url += `&trainee_id=eq.${user.id}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        logger.error('Failed to fetch status history:', response.statusText);
        return [];
      }

      const data = await response.json();
      return (data || []) as StatusHistoryEntry[];
    },
    enabled: !!(applicationId || user?.id),
  });
}

export function useApplicationTimeline(applicationId: string) {
  return useQuery({
    queryKey: ['application-timeline', applicationId],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/status_history?application_id=eq.${applicationId}&order=created_at.asc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        logger.error('Failed to fetch application timeline:', response.statusText);
        return [];
      }}

      const data = await response.json();
      return (data || []) as StatusHistoryEntry[];
    },
    enabled: !!applicationId,
  });
}