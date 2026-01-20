import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Loader2, 
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useRolePermissions, useUpdateRolePermission, useBulkUpdateRolePermissions, RolePermission } from "@/hooks/useRolePermissions";
import { toast } from "sonner";

const AdminRolePermissions = () => {
  const [activeRole, setActiveRole] = useState<'admin' | 'instructor'>('admin');
  
  const { data: permissions, isLoading, refetch } = useRolePermissions();
  const updatePermission = useUpdateRolePermission();
  const bulkUpdate = useBulkUpdateRolePermissions();

  const rolePermissions = permissions?.filter(p => p.role === activeRole) || [];
  
  // Group permissions by category
  const groupedPermissions = rolePermissions.reduce((acc, permission) => {
    if (!acc[permission.permission_category]) {
      acc[permission.permission_category] = [];
    }
    acc[permission.permission_category].push(permission);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  const enabledCount = rolePermissions.filter(p => p.is_enabled).length;
  const totalCount = rolePermissions.length;

  const handleTogglePermission = async (id: string, currentValue: boolean) => {
    try {
      await updatePermission.mutateAsync({ id, is_enabled: !currentValue });
      toast.success("Permission updated");
    } catch (error) {
      toast.error("Failed to update permission");
    }
  };

  const handleEnableAll = async () => {
    try {
      await bulkUpdate.mutateAsync({ role: activeRole, is_enabled: true });
      toast.success(`All ${activeRole} permissions enabled`);
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  const handleDisableAll = async () => {
    try {
      await bulkUpdate.mutateAsync({ role: activeRole, is_enabled: false });
      toast.success(`All ${activeRole} permissions disabled`);
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="super-admin" title="Role Permissions">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="super-admin" 
      title="Role Permissions" 
      subtitle="Configure what each role can access"
    >
      {/* Header Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Access Control</h2>
                <p className="text-muted-foreground">
                  Super Admin has full access. Configure permissions for Admin and Instructor roles below.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Tabs */}
      <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as 'admin' | 'instructor')}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-80 grid-cols-2">
            <TabsTrigger value="admin" className="gap-2">
              <Users className="w-4 h-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="instructor" className="gap-2">
              <Users className="w-4 h-4" />
              Instructor
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              {enabledCount} / {totalCount} enabled
            </Badge>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEnableAll}
                disabled={bulkUpdate.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Enable All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisableAll}
                disabled={bulkUpdate.isPending}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Disable All
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="admin" className="mt-0">
          <PermissionsGrid 
            groupedPermissions={groupedPermissions} 
            onToggle={handleTogglePermission}
            isUpdating={updatePermission.isPending}
          />
        </TabsContent>

        <TabsContent value="instructor" className="mt-0">
          <PermissionsGrid 
            groupedPermissions={groupedPermissions} 
            onToggle={handleTogglePermission}
            isUpdating={updatePermission.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Permission Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Super Admin
              </h4>
              <p className="text-sm text-muted-foreground">
                Full access to all features including God Mode tools, settings, and this permissions page.
                Cannot be restricted.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Admin
              </h4>
              <p className="text-sm text-muted-foreground">
                Manages applications, programs, users, payments, and certificates. 
                Access can be customized above.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Instructor
              </h4>
              <p className="text-sm text-muted-foreground">
                Limited access to assigned programs and trainees only.
                Access can be customized above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

interface PermissionsGridProps {
  groupedPermissions: Record<string, RolePermission[]>;
  onToggle: (id: string, currentValue: boolean) => void;
  isUpdating: boolean;
}

const PermissionsGrid = ({ groupedPermissions, onToggle, isUpdating }: PermissionsGridProps) => {
  const categories = Object.keys(groupedPermissions).sort();

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No permissions configured for this role.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{category}</CardTitle>
            <CardDescription>
              {groupedPermissions[category].filter(p => p.is_enabled).length} of {groupedPermissions[category].length} enabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedPermissions[category].map((permission) => (
              <div 
                key={permission.id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <label 
                  htmlFor={permission.id} 
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {permission.permission_label}
                </label>
                <Switch
                  id={permission.id}
                  checked={permission.is_enabled}
                  onCheckedChange={() => onToggle(permission.id, permission.is_enabled)}
                  disabled={isUpdating}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminRolePermissions;
