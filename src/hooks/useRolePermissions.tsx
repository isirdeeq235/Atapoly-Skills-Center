import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";

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
      const qs = role ? `?role=${role}` : '';
      const res: any = await apiFetch(`/api/role-permissions${qs}`);
      return res.perms as RolePermission[];
    },
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const res: any = await apiFetch(`/api/role-permissions/${id}`, { method: 'PUT', body: JSON.stringify({ is_enabled, updated_at: new Date().toISOString() }) });
      return res.perm;
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
      const res: any = await apiFetch(`/api/role-permissions/bulk/${role}`, { method: 'PUT', body: JSON.stringify({ is_enabled }) });
      return res;
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
