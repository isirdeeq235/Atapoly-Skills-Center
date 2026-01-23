import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
      // Use raw SQL query for newly created table
      let sql = `SELECT * FROM status_history`;
      const params: Record<string, string> = {};
      
      if (applicationId) {
        sql += ` WHERE application_id = $1`;
        params['$1'] = applicationId;
      } else if (user?.id) {
        sql += ` WHERE trainee_id = $1`;
        params['$1'] = user.id;
      }
      
      sql += ` ORDER BY created_at DESC LIMIT 50`;

      // Direct fetch using REST API
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/status_history?${
          applicationId ? `application_id=eq.${applicationId}` : `trainee_id=eq.${user?.id}`
        }&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch status history');
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/status_history?application_id=eq.${applicationId}&order=created_at.asc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch application timeline');
      }

      const data = await response.json();
      return (data || []) as StatusHistoryEntry[];
    },
    enabled: !!applicationId,
  });
}