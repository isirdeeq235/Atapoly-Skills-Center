import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RolePermission {
  id: string;
  role: 'admin' | 'instructor';
  permission_key: string;
  permission_label: string;
  permission_category: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useRolePermissions(role?: 'admin' | 'instructor') {
  return useQuery({
    queryKey: ['role-permissions', role],
    queryFn: async () => {
      let query = supabase
        .from('role_permissions')
        .select('*')
        .order('permission_category')
        .order('permission_label');

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RolePermission[];
    },
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
    },
  });
}

export function useBulkUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, is_enabled }: { role: 'admin' | 'instructor'; is_enabled: boolean }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq('role', role)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
    },
  });
}

// Hook to check if current user has a specific permission
export function useHasPermission(permissionKey: string) {
  const { data: permissions } = useRolePermissions();
  
  return permissions?.find(p => p.permission_key === permissionKey)?.is_enabled ?? true;
}
