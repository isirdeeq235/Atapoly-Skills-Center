import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'application_submitted' 
  | 'application_approved' 
  | 'application_rejected' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'registration_complete' 
  | 'system_announcement' 
  | 'program_update';

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
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user || realtimeEnabled) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show toast for new notification
          toast.info(newNotification.title, {
            description: newNotification.message,
          });

          // Invalidate and refetch notifications
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          
          // If notification is about application status change, also refetch applications
          if (newNotification.type === 'application_approved' || 
              newNotification.type === 'application_rejected' ||
              newNotification.type === 'registration_complete') {
            queryClient.invalidateQueries({ queryKey: ['trainee-applications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
            queryClient.invalidateQueries({ queryKey: ['existing-applications', user.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();

    setRealtimeEnabled(true);

    return () => {
      supabase.removeChannel(channel);
      setRealtimeEnabled(false);
    };
  }, [user, queryClient, realtimeEnabled]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user?.id);

      if (error) throw error;
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

// Helper function to create notifications (to be used in components)
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata: Json = {}
) {
  const { data, error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_message: message,
    p_metadata: metadata,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }

  return data;
}

// Helper to broadcast announcement to all users of a role
export async function broadcastAnnouncement(
  role: 'trainee' | 'instructor' | 'admin' | 'super_admin' | 'all',
  title: string,
  message: string,
  metadata: Json = {}
) {
  const { data, error } = await supabase.rpc('broadcast_announcement', {
    p_role: role,
    p_title: title,
    p_message: message,
    p_metadata: metadata,
  });

  if (error) {
    console.error('Failed to broadcast announcement:', error);
    throw error;
  }

  return data;
}
