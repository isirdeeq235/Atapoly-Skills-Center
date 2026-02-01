import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

// Replace Supabase realtime with server-sent events (notifications stream) and polling fallback.

/**
 * Hook that provides real-time synchronization for payment and application status
 * across all roles in the application.
 * 
 * This hook listens to changes in:
 * - payments table: For payment status updates
 * - applications table: For application status updates
 * - status_history table: For audit trail updates
 * 
 * And automatically invalidates relevant queries to keep UI in sync.
 */
export function usePaymentSync() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Use notifications SSE stream to learn about payment/application events
    const token = localStorage.getItem('token');
    const url = token ? `/api/notifications/stream?token=${encodeURIComponent(token)}` : '/api/notifications/stream';
    const es = new EventSource(url);

    const onEvent = (e: any) => {
      try {
        const newNotification = JSON.parse(e.data);
        // Invalidate queries based on notification type
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

        if (newNotification.type === 'payment_verified' || newNotification.type === 'payment_success') {
          if (newNotification.metadata?.application_id) {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['trainee-applications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
            queryClient.invalidateQueries({ queryKey: ['existing-applications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['status-history'] });
            queryClient.invalidateQueries({ queryKey: ['status-history-admin'] });
          }

          if (newNotification.user_id === user.id) {
            toast.success("Payment Verified", { description: newNotification.message });
          }
        }

        if (newNotification.type === 'application_submitted') {
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-recent-applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }

      } catch (err) {
        logger.error('Error parsing notification event', err);
      }
    };

    es.addEventListener('notification', onEvent as any);
    es.addEventListener('message', () => queryClient.invalidateQueries({ queryKey: ['notifications', user.id] }));
    es.onerror = (err) => {
      logger.error('Payment sync stream error', err);
      try { es.close(); } catch (e) {}
      setTimeout(() => {
        // attempt to re-establish by invalidating notifications (which will cause SSE to reconnect in other hooks)
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      }, 3000);
    };

    // Polling fallback to ensure eventual consistency
    const poll = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    }, 15000);

    return () => {
      try { es.close(); } catch (e) {}
      clearInterval(poll);
    };
  }, [user?.id, queryClient, role]);
}

/**
 * Hook to use in admin dashboards for watching all payment/application changes
 */
export function useAdminPaymentSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const url = token ? `/api/notifications/stream?token=${encodeURIComponent(token)}` : '/api/notifications/stream';
    const es = new EventSource(url);

    const onEvent = (e: any) => {
      try {
        const newNotification = JSON.parse(e.data);

        // Invalidate relevant admin queries when certain event types occur
        if ([ 'payment_verified', 'payment_success' ].includes(newNotification.type)) {
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-recent-payments'] });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }

        if ([ 'application_submitted', 'application_approved', 'application_rejected' ].includes(newNotification.type)) {
          queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-recent-applications'] });
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['programs'] });
          queryClient.invalidateQueries({ queryKey: ['status-history-admin'] });
        }

        if (newNotification.type === 'status_change' || newNotification.type === 'resubmission') {
          queryClient.invalidateQueries({ queryKey: ['status-history-admin'] });
          queryClient.invalidateQueries({ queryKey: ['status-history'] });
        }

      } catch (err) {
        logger.error('Error parsing admin notification event', err);
      }
    };

    es.addEventListener('notification', onEvent as any);
    es.onerror = (err) => {
      logger.error('Admin payment sync stream error', err);
      try { es.close(); } catch (e) {}
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
        queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      }, 3000);
    };

    // Fallback polling to ensure eventual consistency
    const poll = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    }, 15000);

    return () => {
      try { es.close(); } catch (e) {}
      clearInterval(poll);
    };
  }, [queryClient]);
}
