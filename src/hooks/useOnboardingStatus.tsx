import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export type OnboardingStep = 
  | 'select_program'        // Step 1: Select program and pay application fee
  | 'complete_profile'      // Step 2: Complete profile after application fee paid
  | 'pending_approval'      // Step 3: Waiting for admin approval
  | 'pay_registration_fee'  // Step 4: Approved - need to pay registration fee
  | 'fully_enrolled'        // Step 5: Fully enrolled with ID card
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

      // Determine current step - NEW FLOW:
      // 1. Select program & pay application fee FIRST
      // 2. Complete profile form
      // 3. Admin approval
      // 4. Pay registration fee
      // 5. Fully enrolled
      let currentStep: OnboardingStep = 'select_program';

      if (!application.exists || !application.applicationFeePaid) {
        // Step 1: Must select program and pay application fee first
        currentStep = 'select_program';
      } else if (!isProfileComplete) {
        // Step 2: After application fee paid, complete profile
        currentStep = 'complete_profile';
      } else if (application.status === 'pending') {
        // Step 3: Waiting for admin approval
        currentStep = 'pending_approval';
      } else if (application.status === 'rejected') {
        currentStep = 'rejected';
      } else if (application.status === 'approved' && !application.registrationFeePaid) {
        // Step 4: Pay registration fee
        currentStep = 'pay_registration_fee';
      } else if (application.status === 'approved' && application.registrationFeePaid) {
        // Step 5: Fully enrolled
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
