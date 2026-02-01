import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
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
      const qs = new URLSearchParams();
      qs.set('order', 'created_at.desc');
      qs.set('limit', '50');

      if (applicationId) qs.set('application_id', String(applicationId));

      const res: any = await apiFetch(`/api/status-history?${qs.toString()}`);
      return (res || []) as StatusHistoryEntry[];
    },
    enabled: !!(applicationId || user?.id),
  });
}

export function useApplicationTimeline(applicationId: string) {
  return useQuery({
    queryKey: ['application-timeline', applicationId],
    queryFn: async () => {
      const res: any = await apiFetch(`/api/status-history/${applicationId}/timeline`);
      return (res || []) as StatusHistoryEntry[];
    },
    enabled: !!applicationId,
  });
}