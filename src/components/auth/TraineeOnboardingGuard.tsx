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
  complete_profile: '/dashboard/complete-profile',
  apply_program: '/dashboard/apply',
  pay_application_fee: '/dashboard/apply',
  pending_approval: '/dashboard/applications',
  pay_registration_fee: '/dashboard/applications',
  fully_enrolled: '/dashboard',
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

// Helper component for profile completion page
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

  // If profile is already complete, redirect to appropriate step
  if (status?.profile.isComplete) {
    const targetRoute = stepRoutes[status.currentStep];
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
}
