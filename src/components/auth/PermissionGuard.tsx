import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function PermissionGuard({ children, requiredPermission }: PermissionGuardProps) {
  const { role } = useAuth();
  const { hasPermission, isLoading } = usePermissions();
  const location = useLocation();

  // Super admin bypasses all permission checks
  if (role === 'super_admin') {
    return <>{children}</>;
  }

  // Show loader while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Check if user has the required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect to dashboard with access denied message
    const dashboardPath = role === 'instructor' ? '/instructor' : '/admin';
    return <Navigate to={dashboardPath} state={{ accessDenied: true, from: location }} replace />;
  }

  return <>{children}</>;
}
