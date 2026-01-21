import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/**
 * Hook that provides real-time synchronization for payment and application status
 * across all roles in the application.
 * 
 * This hook listens to changes in:
 * - payments table: For payment status updates
 * - applications table: For application status updates
 * 
 * And automatically invalidates relevant queries to keep UI in sync.
 */
export function usePaymentSync() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Channel for syncing payments and applications across all roles
    const syncChannel = supabase
      .channel(`payment-sync-${user.id}`)
      // Listen for payment status changes
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          const updatedPayment = payload.new as Record<string, unknown>;
          console.log("Payment updated:", updatedPayment);
          
          // Invalidate payment-related queries
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          queryClient.invalidateQueries({ queryKey: ['payment-history'] });
          
          // If payment is completed, also refresh applications and onboarding
          if (updatedPayment.status === 'completed') {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
            queryClient.invalidateQueries({ queryKey: ['trainee-applications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
            queryClient.invalidateQueries({ queryKey: ['existing-applications', user.id] });
            
            // Show toast for the user
            if (updatedPayment.trainee_id === user.id) {
              toast.success("Payment Verified", {
                description: "Your payment has been verified and your status has been updated.",
              });
            }
          }
        }
      )
      // Listen for application status changes  
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
        },
        (payload) => {
          const updatedApplication = payload.new as Record<string, unknown>;
          console.log("Application updated:", updatedApplication);
          
          // Invalidate application-related queries
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
          
          // If it's the current user's application, sync their specific data
          if (updatedApplication.trainee_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['trainee-applications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
            queryClient.invalidateQueries({ queryKey: ['existing-applications', user.id] });
          }
          
          // Sync program enrollment counts
          if (updatedApplication.registration_fee_paid) {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
          }
        }
      )
      // Listen for new applications (for admin dashboard)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      // Listen for new payments
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          queryClient.invalidateQueries({ queryKey: ['payment-history'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Payment sync channel connected");
        }
      });

    return () => {
      supabase.removeChannel(syncChannel);
    };
  }, [user?.id, queryClient, role]);
}

/**
 * Hook to use in admin dashboards for watching all payment/application changes
 */
export function useAdminPaymentSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const adminChannel = supabase
      .channel('admin-payment-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log("Admin: Payment change detected:", payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
        },
        (payload) => {
          console.log("Admin: Application change detected:", payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['programs'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Admin payment sync channel connected");
        }
      });

    return () => {
      supabase.removeChannel(adminChannel);
    };
  }, [queryClient]);
}
