/**
 * Reusable route wrapper components to reduce duplication in App.tsx
 */

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import {
  TraineeOnboardingGuard,
  RequireFullEnrollment,
  ApplicationFormGuard,
} from '@/components/auth/TraineeOnboardingGuard';

interface TraineeRouteWrapperProps {
  children: ReactNode;
  requireFullEnrollment?: boolean;
  allowedOnboardingSteps?: string[];
  useApplicationFormGuard?: boolean;
}

/**
 * Wrapper for trainee-specific routes with common guard configurations
 */
export const TraineeRouteWrapper = ({
  children,
  requireFullEnrollment = false,
  allowedOnboardingSteps,
  useApplicationFormGuard = false,
}: TraineeRouteWrapperProps) => {
  return (
    <ProtectedRoute allowedRoles={['trainee']}>
      {useApplicationFormGuard ? (
        <ApplicationFormGuard>{children}</ApplicationFormGuard>
      ) : allowedOnboardingSteps ? (
        <TraineeOnboardingGuard allowedSteps={allowedOnboardingSteps}>
          {requireFullEnrollment ? (
            <RequireFullEnrollment>{children}</RequireFullEnrollment>
          ) : (
            children
          )}
        </TraineeOnboardingGuard>
      ) : requireFullEnrollment ? (
        <RequireFullEnrollment>{children}</RequireFullEnrollment>
      ) : (
        children
      )}
    </ProtectedRoute>
  );
};

interface AdminRouteWrapperProps {
  children: ReactNode;
  permission?: string;
  allowedRoles?: string[];
}

/**
 * Wrapper for admin routes with optional permission checking
 */
export const AdminRouteWrapper = ({
  children,
  permission,
  allowedRoles = ['admin', 'super_admin'],
}: AdminRouteWrapperProps) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {permission ? (
        <PermissionGuard requiredPermission={permission}>{children}</PermissionGuard>
      ) : (
        children
      )}
    </ProtectedRoute>
  );
};

interface ProtectedRouteWrapperProps {
  children: ReactNode;
  allowedRoles?: string[];
  permission?: string;
}

/**
 * Generic protected route wrapper
 */
export const ProtectedRouteWrapper = ({
  children,
  allowedRoles = ['admin', 'super_admin'],
  permission,
}: ProtectedRouteWrapperProps) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {permission ? (
        <PermissionGuard requiredPermission={permission}>{children}</PermissionGuard>
      ) : (
        children
      )}
    </ProtectedRoute>
  );
};
