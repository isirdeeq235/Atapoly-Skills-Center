-- Create role permissions table
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instructor')),
  permission_key TEXT NOT NULL,
  permission_label TEXT NOT NULL,
  permission_category TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage permissions
CREATE POLICY "Super admins can view permissions" 
ON public.role_permissions 
FOR SELECT 
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update permissions" 
ON public.role_permissions 
FOR UPDATE 
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert permissions" 
ON public.role_permissions 
FOR INSERT 
WITH CHECK (public.is_super_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default permissions for Admin role
INSERT INTO public.role_permissions (role, permission_key, permission_label, permission_category) VALUES
-- Admin permissions
('admin', 'view_applications', 'View Applications', 'Applications'),
('admin', 'approve_applications', 'Approve/Reject Applications', 'Applications'),
('admin', 'view_programs', 'View Programs', 'Programs'),
('admin', 'create_programs', 'Create Programs', 'Programs'),
('admin', 'edit_programs', 'Edit Programs', 'Programs'),
('admin', 'delete_programs', 'Delete Programs', 'Programs'),
('admin', 'view_batches', 'View Batches', 'Batches'),
('admin', 'manage_batches', 'Manage Batches', 'Batches'),
('admin', 'view_users', 'View Users', 'Users'),
('admin', 'edit_users', 'Edit User Roles', 'Users'),
('admin', 'view_payments', 'View Payments', 'Payments'),
('admin', 'manage_payments', 'Manage Payments', 'Payments'),
('admin', 'view_certificates', 'View Certificates', 'Certificates'),
('admin', 'issue_certificates', 'Issue Certificates', 'Certificates'),
('admin', 'view_reports', 'View Reports', 'Reports'),
('admin', 'export_data', 'Export Data', 'Reports'),

-- Instructor permissions
('instructor', 'view_assigned_programs', 'View Assigned Programs', 'Programs'),
('instructor', 'edit_assigned_programs', 'Edit Assigned Programs', 'Programs'),
('instructor', 'view_program_trainees', 'View Program Trainees', 'Trainees'),
('instructor', 'mark_attendance', 'Mark Attendance', 'Trainees'),
('instructor', 'view_reports', 'View Reports', 'Reports'),
('instructor', 'view_notifications', 'View Notifications', 'General'),
('instructor', 'update_profile', 'Update Profile', 'General');

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  has_perm BOOLEAN;
BEGIN
  -- Super admins always have all permissions
  IF public.is_super_admin(user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's role
  SELECT role INTO user_role FROM public.user_roles WHERE user_roles.user_id = $1;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if permission is enabled for this role
  SELECT is_enabled INTO has_perm 
  FROM public.role_permissions 
  WHERE role = user_role AND permission_key = permission;
  
  RETURN COALESCE(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;