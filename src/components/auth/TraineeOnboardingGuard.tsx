import { Navigate, useLocation } from 'react-router-dom';
import { useOnboardingStatus, OnboardingStep } from '@/hooks/useOnboardingStatus';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface TraineeOnboardingGuardProps {
  children: React.ReactNode;
  allowedSteps?: OnboardingStep[];
  requireFullEnrollment?: boolean;
}

// Map steps to their allowed routes
const stepRoutes: Record<OnboardingStep, string> = {
  select_program: '/dashboard/apply',           // Step 1: Select & pay application fee
  complete_profile: '/dashboard/complete-profile', // Step 2: Complete profile after payment
  pending_approval: '/dashboard/applications',   // Step 3: Waiting for approval
  pay_registration_fee: '/dashboard/applications', // Step 4: Pay registration fee
  fully_enrolled: '/dashboard',                  // Step 5: Full access
  rejected: '/dashboard/applications',
};

export function TraineeOnboardingGuard({ 
  children, 
  allowedSteps,
  requireFullEnrollment = false 
}: TraineeOnboardingGuardProps) {
  const { role, loading: authLoading } = useAuth();
  const { data: status, isLoading } = useOnboardingStatus();
  const location = useLocation();

  // Only apply to trainees
  if (role !== 'trainee') {
    return <>{children}</>;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!status) {
    return <>{children}</>;
  }

  const currentStep = status.currentStep;

  // If full enrollment required and not fully enrolled, redirect
  if (requireFullEnrollment && currentStep !== 'fully_enrolled') {
    const targetRoute = stepRoutes[currentStep];
    if (location.pathname !== targetRoute) {
      return <Navigate to={targetRoute} replace />;
    }
  }

  // If specific steps are allowed, check if current step is in the list
  if (allowedSteps && !allowedSteps.includes(currentStep)) {
    const targetRoute = stepRoutes[currentStep];
    if (location.pathname !== targetRoute) {
      return <Navigate to={targetRoute} replace />;
    }
  }

  return <>{children}</>;
}

// Helper component for pages that require full enrollment
export function RequireFullEnrollment({ children }: { children: React.ReactNode }) {
  return (
    <TraineeOnboardingGuard requireFullEnrollment>
      {children}
    </TraineeOnboardingGuard>
  );
}

// Helper component for complete profile page - ensures user has paid application fee first
export function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading } = useOnboardingStatus();
  const { role } = useAuth();

  if (role !== 'trainee') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Redirect to apply page if application fee not paid yet
  if (status?.currentStep === 'select_program') {
    return <Navigate to="/dashboard/apply" replace />;
  }

  // If profile is already complete, redirect to appropriate step
  if (status?.profile.isComplete && status?.currentStep !== 'complete_profile') {
    const targetRoute = stepRoutes[status.currentStep];
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
}
