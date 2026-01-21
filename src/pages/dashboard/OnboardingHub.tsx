import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useActivePaymentProvider } from "@/hooks/useActivePaymentProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  ArrowRight, 
  CreditCard,
  FileText, 
  Clock,
  XCircle,
  User,
  GraduationCap,
  Loader2,
  Sparkles,
  Shield,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const RETRY_INTERVAL = 10000; // 10 seconds
const MAX_RETRY_DURATION = 120000; // 2 minutes

const OnboardingHub = () => {
  const { user, profile } = useAuth();
  const { data: status, isLoading, refetch } = useOnboardingStatus();
  const { provider, hasActiveProvider } = useActivePaymentProvider();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const queryClient = useQueryClient();
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryStartTimeRef = useRef<number | null>(null);

  // Verify payment with the backend
  const verifyPayment = useCallback(async (reference: string, paymentType: 'application' | 'registration') => {
    if (!provider) return;
    
    setIsVerifying(true);
    try {
      console.log("Verifying payment:", { reference, provider, paymentType });
      
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { reference, provider }
      });
      
      console.log("Verification response:", data);
      
      if (error) {
        console.error("Verification error:", error);
        throw error;
      }
      
      if (data?.success) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['onboarding-status', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['trainee-applications', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['existing-applications', user?.id] });
        
        await refetch();
        
        if (paymentType === 'application') {
          toast({
            title: "Application Fee Paid! 🎉",
            description: "Proceed to complete your profile information.",
          });
        } else {
          toast({
            title: "Registration Complete! 🎓",
            description: "Welcome! You now have full access to your dashboard.",
          });
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else {
        toast({
          title: "Payment Verification",
          description: data?.error || "Unable to verify payment. Please contact support if payment was deducted.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment verification failed:", error);
      // Still refetch in case webhook already processed it
      await refetch();
    } finally {
      setIsVerifying(false);
    }
  }, [provider, user?.id, queryClient, refetch, toast, navigate]);

  // Stop auto-retry function
  const stopAutoRetry = useCallback(() => {
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
      retryIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsAutoRetrying(false);
    setRetryCountdown(0);
    setRetryAttempt(0);
    retryStartTimeRef.current = null;
  }, []);

  // Auto-retry verification function
  const startAutoRetry = useCallback(async (paymentType: 'application' | 'registration') => {
    if (!user || !provider) return;
    
    setIsAutoRetrying(true);
    retryStartTimeRef.current = Date.now();
    setRetryCountdown(RETRY_INTERVAL / 1000);
    
    toast({
      title: "Verifying Payment",
      description: "We're checking your payment status. This will retry automatically for up to 2 minutes.",
    });

    // Countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setRetryCountdown(prev => (prev > 0 ? prev - 1 : RETRY_INTERVAL / 1000));
    }, 1000);

    // Retry interval
    const checkPayment = async () => {
      if (!retryStartTimeRef.current) return;
      
      const elapsed = Date.now() - retryStartTimeRef.current;
      if (elapsed >= MAX_RETRY_DURATION) {
        stopAutoRetry();
        toast({
          title: "Verification Timeout",
          description: "Payment verification timed out. You can try manually verifying or contact support.",
          variant: "destructive",
        });
        return;
      }

      setRetryAttempt(prev => prev + 1);
      setRetryCountdown(RETRY_INTERVAL / 1000);

      try {
        // Query latest payment
        const { data: payments } = await supabase
          .from("payments")
          .select("id, provider_reference, provider, status")
          .eq("trainee_id", user.id)
          .eq("payment_type", paymentType === 'application' ? "application_fee" : "registration_fee")
          .order("created_at", { ascending: false })
          .limit(1);

        if (payments && payments.length > 0) {
          const payment = payments[0];
          
          if (payment.status === 'completed') {
            stopAutoRetry();
            queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
            await refetch();
            toast({
              title: paymentType === 'application' ? "Application Fee Verified! 🎉" : "Registration Complete! 🎓",
              description: paymentType === 'application' 
                ? "Your payment has been confirmed. Please complete your profile."
                : "Welcome to your dashboard!",
            });
            if (paymentType === 'registration') {
              setTimeout(() => navigate('/dashboard'), 1500);
            }
            return;
          }

          // Try to verify with provider if we have a reference
          if (payment.provider_reference) {
            const { data, error } = await supabase.functions.invoke("verify-payment", {
              body: { 
                reference: payment.provider_reference, 
                provider: payment.provider || provider,
                payment_id: payment.id
              }
            });

            if (!error && data?.success) {
              stopAutoRetry();
              queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
              await refetch();
              toast({
                title: paymentType === 'application' ? "Application Fee Verified! 🎉" : "Registration Complete! 🎓",
                description: paymentType === 'application' 
                  ? "Your payment has been confirmed. Please complete your profile."
                  : "Welcome to your dashboard!",
              });
              if (paymentType === 'registration') {
                setTimeout(() => navigate('/dashboard'), 1500);
              }
              return;
            }
          }
        }
      } catch (error) {
        console.error("Auto-retry verification error:", error);
      }
    };

    // Initial check
    await checkPayment();

    // Set up interval for subsequent checks
    retryIntervalRef.current = setInterval(checkPayment, RETRY_INTERVAL);
  }, [user, provider, queryClient, refetch, toast, navigate, stopAutoRetry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRetry();
    };
  }, [stopAutoRetry]);

  // Handle payment success redirects with auto-retry
  useEffect(() => {
    const payment = searchParams.get('payment');
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (payment === 'success' && reference) {
      setSearchParams({});
      verifyPayment(reference, 'application');
      // Start auto-retry in case initial verification fails
      startAutoRetry('application');
    } else if (payment === 'registration_success' && reference) {
      setSearchParams({});
      verifyPayment(reference, 'registration');
      startAutoRetry('registration');
    } else if (payment === 'success' || payment === 'registration_success') {
      // Fallback if no reference - start auto-retry
      setSearchParams({});
      const paymentType = payment === 'success' ? 'application' : 'registration';
      startAutoRetry(paymentType);
    }
  }, [searchParams, setSearchParams, verifyPayment, startAutoRetry]);

  // Auto-redirect to dashboard when fully enrolled
  useEffect(() => {
    if (status?.currentStep === 'fully_enrolled') {
      navigate('/dashboard');
    }
  }, [status, navigate]);

  const handlePayRegistrationFee = async () => {
    if (!user || !profile || !status?.application.applicationId) return;

    setIsPaying(true);
    try {
      if (!hasActiveProvider || !provider) {
        toast({
          title: "Payment not available",
          description: "No payment provider is configured. Please contact support.",
          variant: "destructive",
        });
        setIsPaying(false);
        return;
      }

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "initialize-payment",
        {
          body: {
            provider,
            amount: status.application.registrationFee || 0,
            email: profile?.email || user.email,
            payment_type: "registration_fee",
            application_id: status.application.applicationId,
            trainee_id: user.id,
            callback_url: `${window.location.origin}/dashboard/onboarding?payment=registration_success`,
          },
        }
      );

      if (paymentError) throw new Error(paymentError.message);

      if (paymentData?.authorization_url) {
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
      setIsPaying(false);
    }
  };

  // Handle verifying existing application fee payment
  const handleVerifyApplicationPayment = async () => {
    if (!user) return;
    
    setIsVerifying(true);
    try {
      // Get the latest pending application fee payment for this user
      const { data: payments } = await supabase
        .from("payments")
        .select("id, provider_reference, provider, status, application_id")
        .eq("trainee_id", user.id)
        .eq("payment_type", "application_fee")
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (!payments || payments.length === 0) {
        toast({
          title: "No Payment Found",
          description: "We couldn't find a pending application fee payment. Please select a program and pay.",
          variant: "destructive",
        });
        setIsVerifying(false);
        return;
      }

      const payment = payments[0];
      
      if (payment.status === 'completed') {
        // Payment already completed, just refresh
        queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
        await refetch();
        toast({
          title: "Payment Already Verified",
          description: "Your application fee has been processed. Refreshing your status...",
        });
        setIsVerifying(false);
        return;
      }

      // If we have a reference, try to verify with payment provider
      if (payment.provider_reference && provider) {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { 
            reference: payment.provider_reference, 
            provider: payment.provider || provider,
            payment_id: payment.id
          }
        });
        
        if (error) throw error;
        
        if (data?.success) {
          queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
          queryClient.invalidateQueries({ queryKey: ['existing-applications', user.id] });
          await refetch();
          toast({
            title: "Application Fee Verified! 🎉",
            description: "Your payment has been confirmed. Please complete your profile to continue.",
          });
        } else {
          toast({
            title: "Payment Not Yet Confirmed",
            description: data?.error || "Your payment is still being processed. Please try again in a few minutes.",
            variant: "destructive",
          });
        }
      } else {
        // No reference - try to query by checking the most recent transaction
        toast({
          title: "Payment Processing",
          description: "Your payment may still be processing. Please wait a moment and try again, or contact support.",
        });
      }
    } catch (error: any) {
      console.error("Application payment verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle verifying existing registration fee payment (for when user has paid but status not updated)
  const handleVerifyExistingPayment = async () => {
    if (!user || !status?.application.applicationId) return;
    
    setIsVerifying(true);
    try {
      // First, get the latest pending payment for this application
      const { data: payments } = await supabase
        .from("payments")
        .select("id, provider_reference, provider, status")
        .eq("application_id", status.application.applicationId)
        .eq("payment_type", "registration_fee")
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (!payments || payments.length === 0) {
        toast({
          title: "No Payment Found",
          description: "We couldn't find a pending payment. Please initiate a new payment.",
          variant: "destructive",
        });
        setIsVerifying(false);
        return;
      }

      const payment = payments[0];
      
      if (payment.status === 'completed') {
        // Payment already completed, just refresh
        await refetch();
        toast({
          title: "Payment Already Verified",
          description: "Your payment has already been processed. Refreshing your status...",
        });
        setIsVerifying(false);
        return;
      }

      // If we have a reference, try to verify with payment provider
      if (payment.provider_reference && provider) {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { 
            reference: payment.provider_reference, 
            provider: payment.provider || provider,
            payment_id: payment.id
          }
        });
        
        if (error) throw error;
        
        if (data?.success) {
          queryClient.invalidateQueries({ queryKey: ['onboarding-status', user.id] });
          await refetch();
          toast({
            title: "Payment Verified! 🎉",
            description: "Your registration is complete. Welcome to your dashboard!",
          });
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          toast({
            title: "Payment Not Yet Confirmed",
            description: data?.error || "Your payment is still being processed. Please try again in a few minutes or contact support.",
            variant: "destructive",
          });
        }
      } else {
        // No reference - ask user to contact admin
        toast({
          title: "Manual Verification Required",
          description: "Please contact an administrator to verify your payment.",
        });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="trainee" title="Getting Started">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = status?.currentStep || 'select_program';
  
  // Calculate progress percentage
  const stepOrder = ['select_program', 'complete_profile', 'fill_application', 'pending_approval', 'pay_registration_fee', 'fully_enrolled'];
  const currentStepIndex = stepOrder.indexOf(currentStep === 'rejected' ? 'pending_approval' : currentStep);
  const progressPercent = ((currentStepIndex + 1) / stepOrder.length) * 100;

  const steps = [
    {
      id: 'select_program',
      title: 'Step 1: Pay Application Fee',
      description: 'Choose your training program and pay the non-refundable application fee',
      icon: CreditCard,
      route: '/dashboard/apply',
      feeType: 'Application Fee',
    },
    {
      id: 'complete_profile',
      title: 'Step 2: Complete Profile',
      description: 'Fill in your personal information and upload a passport photograph',
      icon: User,
      route: '/dashboard/complete-profile',
      feeType: null,
    },
    {
      id: 'fill_application',
      title: 'Step 3: Submit Application',
      description: 'Complete program-specific application questions and submit for review',
      icon: FileText,
      route: status?.application.applicationId ? `/dashboard/application-form/${status.application.applicationId}` : null,
      feeType: null,
    },
    {
      id: 'pending_approval',
      title: 'Step 4: Application Under Review',
      description: 'Your application has been submitted and is being reviewed by our admissions team. You will be notified of the decision.',
      icon: Clock,
      route: null,
      feeType: null,
    },
    {
      id: 'pay_registration_fee',
      title: 'Step 5: Pay Registration Fee',
      description: 'Congratulations! Your application has been approved. Pay the registration fee to complete your enrollment.',
      icon: CreditCard,
      route: null, // Will handle inline
      feeType: 'Registration Fee',
    },
    {
      id: 'fully_enrolled',
      title: 'Step 6: Access Full Dashboard',
      description: 'You are now fully enrolled! Access your ID card, certificates, and trainee dashboard',
      icon: GraduationCap,
      route: '/dashboard',
      feeType: null,
    },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = stepOrder.indexOf(stepId);
    const currentIndex = stepOrder.indexOf(currentStep === 'rejected' ? 'pending_approval' : currentStep);
    
    if (stepId === 'pending_approval' && currentStep === 'rejected') return 'rejected';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <DashboardLayout 
      role="trainee" 
      title="Welcome to Your Journey" 
      subtitle={`Hello, ${profile?.full_name?.split(' ')[0] || 'Trainee'}! Let's get you enrolled.`}
    >
      {/* Progress Overview */}
      <Card className="mb-8 border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Enrollment Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStep === 'fully_enrolled' 
                  ? "You're all set!" 
                  : `Step ${currentStepIndex + 1} of ${stepOrder.length}`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-accent">{Math.round(progressPercent)}%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Auto-Retry Status Indicator */}
      {isAutoRetrying && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Verifying Payment...</h3>
                  <p className="text-sm text-muted-foreground">
                    Attempt {retryAttempt} • Next check in {retryCountdown}s • Auto-stops after 2 minutes
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={stopAutoRetry}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
            <div className="mt-4">
              <Progress 
                value={Math.min(100, ((Date.now() - (retryStartTimeRef.current || Date.now())) / MAX_RETRY_DURATION) * 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Alert */}
      {currentStep === 'rejected' && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Application Not Approved</h3>
                <p className="text-muted-foreground mb-4">
                  Unfortunately, your application for {status?.application.programTitle} was not approved. 
                  Please contact our support team for more information or apply for a different program.
                </p>
                <Link to="/dashboard/apply">
                  <Button variant="outline">
                    Apply for Another Program
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Step Highlight */}
      {currentStep !== 'rejected' && currentStep !== 'fully_enrolled' && (
        <Card className="mb-8 border-accent bg-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-accent text-accent-foreground">Current Step</Badge>
            </div>
            <CardTitle className="flex items-center gap-3 mt-2">
              {steps.find(s => s.id === currentStep)?.icon && (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  {(() => {
                    const StepIcon = steps.find(s => s.id === currentStep)?.icon;
                    return StepIcon ? <StepIcon className="w-5 h-5 text-accent" /> : null;
                  })()}
                </div>
              )}
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
            <CardDescription className="text-base">
              {steps.find(s => s.id === currentStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'select_program' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/dashboard/apply">
                    <Button size="lg" className="w-full sm:w-auto">
                      Browse Programs
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleVerifyApplicationPayment}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Already Paid? Verify
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you've already paid the application fee but it's not reflected, click "Already Paid? Verify" to check your payment status with Paystack.
                </p>
              </div>
            )}
            {currentStep === 'complete_profile' && (
              <Link to="/dashboard/complete-profile">
                <Button size="lg" className="w-full sm:w-auto">
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
            {currentStep === 'fill_application' && status?.application.applicationId && (
              <Link to={`/dashboard/application-form/${status.application.applicationId}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <FileText className="w-4 h-4 mr-2" />
                  Fill Application Form
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
            {currentStep === 'pending_approval' && (
              <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-warning" />
                <div>
                  <p className="font-medium">Application Under Review</p>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you as soon as a decision is made on your application for {status?.application.programTitle}.
                  </p>
                </div>
              </div>
            )}
            {currentStep === 'pay_registration_fee' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium text-success">Application Approved! 🎉</p>
                    <p className="text-sm text-muted-foreground">
                      Congratulations! You've been accepted for {status?.application.programTitle}.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1 sm:flex-none"
                    onClick={handlePayRegistrationFee}
                    disabled={isPaying || isVerifying}
                  >
                    {isPaying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Pay Registration Fee - ₦{status?.application.registrationFee?.toLocaleString()}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleVerifyExistingPayment}
                    disabled={isPaying || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Already Paid? Verify
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you've already made a payment but it's not reflected, click "Already Paid? Verify" to check your payment status.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Steps Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Your Enrollment Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.id);
              const StepIcon = step.icon;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    stepStatus === 'current' ? 'border-accent bg-accent/5' :
                    stepStatus === 'completed' ? 'border-success/30 bg-success/5' :
                    stepStatus === 'rejected' ? 'border-destructive/30 bg-destructive/5' :
                    'border-border bg-muted/20 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stepStatus === 'completed' ? 'bg-success text-success-foreground' :
                    stepStatus === 'current' ? 'bg-accent text-accent-foreground' :
                    stepStatus === 'rejected' ? 'bg-destructive text-destructive-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : stepStatus === 'rejected' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        stepStatus === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {step.title}
                      </h4>
                      {stepStatus === 'completed' && (
                        <Badge variant="approved" className="text-xs">Completed</Badge>
                      )}
                      {stepStatus === 'current' && (
                        <Badge className="bg-accent text-accent-foreground text-xs">In Progress</Badge>
                      )}
                      {stepStatus === 'rejected' && (
                        <Badge variant="rejected" className="text-xs">Not Approved</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${
                      stepStatus === 'upcoming' ? 'text-muted-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {stepStatus === 'current' && step.route && (
                    <Link to={step.route}>
                      <Button size="sm" variant="outline">
                        Continue
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Application Details (if exists) */}
      {status?.application.exists && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Program</p>
                <p className="font-medium">{status.application.programTitle}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={
                  status.application.status === 'approved' ? 'approved' :
                  status.application.status === 'rejected' ? 'rejected' : 'pending'
                }>
                  {status.application.status?.charAt(0).toUpperCase() + status.application.status?.slice(1)}
                </Badge>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Application Fee</p>
                <Badge variant={status.application.applicationFeePaid ? 'approved' : 'pending'}>
                  {status.application.applicationFeePaid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Registration Fee</p>
                <Badge variant={status.application.registrationFeePaid ? 'approved' : 'pending'}>
                  {status.application.registrationFeePaid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              {status.application.registrationNumber && (
                <div className="p-4 bg-success/10 rounded-lg md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                  <p className="font-bold text-lg text-success">{status.application.registrationNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default OnboardingHub;
