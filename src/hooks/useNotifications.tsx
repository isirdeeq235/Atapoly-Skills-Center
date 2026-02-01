import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'application_submitted' 
  | 'application_approved' 
  | 'application_rejected' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'payment_verified'
  | 'registration_complete' 
  | 'system_announcement' 
  | 'program_update'
  | 'new_application_for_review';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const data = await apiFetch('/api/notifications');
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Set up SSE subscription
  const eventSourceRef = useRef<EventSource | null>(null);
  useEffect(() => {
    if (!user) return;

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const token = localStorage.getItem('token');
    const url = token ? `/api/notifications/stream?token=${encodeURIComponent(token)}` : '/api/notifications/stream';
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('notification', (e: any) => {
      try {
        const newNotification = JSON.parse(e.data) as Notification;
        toast.info(newNotification.title, { description: newNotification.message });
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });

        if ([ 'application_approved', 'application_rejected', 'registration_complete', 'payment_success', 'payment_verified' ].includes(newNotification.type)) {
          queryClient.invalidateQueries({ queryKey: ['trainee-applications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
          queryClient.invalidateQueries({ queryKey: ['existing-applications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
      } catch (err) {
        logger.error('Error parsing notification event', err);
      }
    });

    es.addEventListener('message', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
    });

    es.onerror = (err) => {
      logger.error('Notification stream error', err);
      try { es.close(); } catch (e) {}
      // reconnect with backoff
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          eventSourceRef.current = null;
          // trigger re-run of effect
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      }, 3000);
    };

    return () => {
      try { es.close(); } catch (e) {}
      eventSourceRef.current = null;
    };
  }, [user?.id, queryClient]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiFetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const notes = await apiFetch('/api/notifications');
      await Promise.all((notes || []).filter((n: any) => !n.read).map((n: any) => apiFetch(`/api/notifications/${n.id}/read`, { method: 'PUT' })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiFetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiFetch('/api/notifications', { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return {
    notifications: notifications || [],
    isLoading,
    unreadCount,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearAll: clearAllMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}

// Helper function to create notifications (admin-only)
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata: Json = {}
) {
  const data = await apiFetch('/api/notifications/create', { method: 'POST', body: JSON.stringify({ user_id: userId, type, title, message, metadata }) });
  return data;
}

// Helper to broadcast announcement to all users of a role (admin-only)
export async function broadcastAnnouncement(
  role: 'trainee' | 'instructor' | 'admin' | 'super_admin' | 'all',
  title: string,
  message: string,
  metadata: Json = {}
) {
  const data = await apiFetch('/api/notifications/broadcast', { method: 'POST', body: JSON.stringify({ role, title, message, metadata }) });
  return data;

  if (error) {
    logger.error('Failed to broadcast announcement:', error);
    throw error;
  }

  return data;
}
