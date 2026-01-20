import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Permission {
  permission_key: string;
  is_enabled: boolean;
}

interface PermissionsContextType {
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (permissionKey: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Map routes to required permissions
const routePermissions: Record<string, string> = {
  '/admin/applications': 'view_applications',
  '/admin/programs': 'view_programs',
  '/admin/batches': 'view_batches',
  '/admin/users': 'view_users',
  '/admin/payments': 'view_payments',
  '/admin/certificates': 'view_certificates',
  '/admin/reports': 'view_reports',
};

// Map permissions to sidebar items (for hiding)
export const permissionSidebarMap: Record<string, string> = {
  'view_applications': '/admin/applications',
  'view_programs': '/admin/programs',
  'view_batches': '/admin/batches',
  'view_users': '/admin/users',
  'view_payments': '/admin/payments',
  'view_certificates': '/admin/certificates',
  'view_reports': '/admin/reports',
};

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id, role],
    queryFn: async () => {
      // Super admin has all permissions
      if (role === 'super_admin') {
        return [];
      }

      // Trainee doesn't need these permissions
      if (role === 'trainee') {
        return [];
      }

      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key, is_enabled')
        .eq('role', role as string);

      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      return data as Permission[];
    },
    enabled: !!user && !!role && role !== 'super_admin' && role !== 'trainee',
    staleTime: 30000, // Cache for 30 seconds
  });

  const hasPermission = (permissionKey: string): boolean => {
    // Super admin always has permission
    if (role === 'super_admin') return true;
    
    // Trainee doesn't use this permission system
    if (role === 'trainee') return true;

    // If no permissions loaded yet, default to allow (will be checked on route)
    if (permissions.length === 0) return true;

    const permission = permissions.find(p => p.permission_key === permissionKey);
    return permission?.is_enabled ?? false;
  };

  const canAccessRoute = (route: string): boolean => {
    // Super admin can access everything
    if (role === 'super_admin') return true;
    
    // Trainee uses different routes
    if (role === 'trainee') return true;

    const requiredPermission = routePermissions[route];
    if (!requiredPermission) return true; // No permission required for this route

    return hasPermission(requiredPermission);
  };

  return (
    <PermissionsContext.Provider value={{ permissions, isLoading, hasPermission, canAccessRoute }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}
