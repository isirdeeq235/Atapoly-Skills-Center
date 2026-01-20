import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type AppRole = 'super_admin' | 'admin' | 'instructor' | 'trainee';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login based on intended role
    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/instructor');
    return <Navigate to={isAdminRoute ? "/admin-login" : "/login"} state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    let dashboardPath = '/dashboard/onboarding';
    if (role === 'super_admin' || role === 'admin') {
      dashboardPath = '/admin';
    } else if (role === 'instructor') {
      dashboardPath = '/instructor';
    }
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}
