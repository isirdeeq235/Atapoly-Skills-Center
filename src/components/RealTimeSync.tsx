import { usePaymentSync } from "@/hooks/usePaymentSync";
import { useAuth } from "@/hooks/useAuth";

/**
 * Component that initializes real-time synchronization for payments and applications.
 * This should be placed inside AuthProvider to have access to the current user.
 */
export function RealTimeSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Only initialize sync when user is logged in
  if (user) {
    usePaymentSync();
  }
  
  return <>{children}</>;
}
