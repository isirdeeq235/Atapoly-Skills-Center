import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export type OnboardingStep = 
  | 'complete_profile'      // Need to complete profile with passport photo
  | 'apply_program'         // Need to apply for a program
  | 'pay_application_fee'   // Need to pay application fee
  | 'pending_approval'      // Waiting for admin approval
  | 'pay_registration_fee'  // Approved - need to pay registration fee
  | 'fully_enrolled'        // Fully enrolled with ID card
  | 'rejected';             // Application was rejected

export interface OnboardingStatus {
  currentStep: OnboardingStep;
  profile: {
    isComplete: boolean;
    hasPhoto: boolean;
  };
  application: {
    exists: boolean;
    status: string | null;
    applicationFeePaid: boolean;
    registrationFeePaid: boolean;
    applicationId: string | null;
    programId: string | null;
    programTitle: string | null;
    registrationFee: number | null;
    registrationNumber: string | null;
  };
  canAccessDashboard: boolean;
  canAccessIdCard: boolean;
}

export function useOnboardingStatus() {
  const { user, profile, role } = useAuth();

  return useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user || !profile) {
        return {
          currentStep: 'complete_profile',
          profile: { isComplete: false, hasPhoto: false },
          application: {
            exists: false,
            status: null,
            applicationFeePaid: false,
            registrationFeePaid: false,
            applicationId: null,
            programId: null,
            programTitle: null,
            registrationFee: null,
            registrationNumber: null,
          },
          canAccessDashboard: false,
          canAccessIdCard: false,
        };
      }

      // Check profile completion
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const hasPhoto = !!profileData?.avatar_url;
      const isProfileComplete = !!(
        profileData?.full_name &&
        profileData?.phone &&
        profileData?.avatar_url &&
        profileData?.date_of_birth &&
        profileData?.gender &&
        profileData?.address &&
        profileData?.onboarding_completed
      );

      // Get the latest application
      const { data: applicationData } = await supabase
        .from('applications')
        .select(`
          *,
          programs(id, title, registration_fee)
        `)
        .eq('trainee_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const application = {
        exists: !!applicationData,
        status: applicationData?.status || null,
        applicationFeePaid: applicationData?.application_fee_paid || false,
        registrationFeePaid: applicationData?.registration_fee_paid || false,
        applicationId: applicationData?.id || null,
        programId: applicationData?.program_id || null,
        programTitle: applicationData?.programs?.title || null,
        registrationFee: applicationData?.programs?.registration_fee || null,
        registrationNumber: applicationData?.registration_number || null,
      };

      // Determine current step
      let currentStep: OnboardingStep = 'complete_profile';

      if (!isProfileComplete) {
        currentStep = 'complete_profile';
      } else if (!application.exists) {
        currentStep = 'apply_program';
      } else if (!application.applicationFeePaid) {
        currentStep = 'pay_application_fee';
      } else if (application.status === 'pending') {
        currentStep = 'pending_approval';
      } else if (application.status === 'rejected') {
        currentStep = 'rejected';
      } else if (application.status === 'approved' && !application.registrationFeePaid) {
        currentStep = 'pay_registration_fee';
      } else if (application.status === 'approved' && application.registrationFeePaid) {
        currentStep = 'fully_enrolled';
      }

      // Determine access rights
      const canAccessDashboard = currentStep === 'fully_enrolled';
      const canAccessIdCard = currentStep === 'fully_enrolled' && !!application.registrationNumber;

      return {
        currentStep,
        profile: { isComplete: isProfileComplete, hasPhoto },
        application,
        canAccessDashboard,
        canAccessIdCard,
      };
    },
    enabled: !!user && role === 'trainee',
    refetchOnWindowFocus: true,
  });
}
