import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePrograms } from "@/hooks/usePrograms";
import { useBatches } from "@/hooks/useBatches";
import { useActivePaymentProvider } from "@/hooks/useActivePaymentProvider";
import { useCustomFormFields } from "@/hooks/useCustomFormFields";
import { DynamicFormField } from "@/components/forms/DynamicFormField";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { format } from "date-fns";
import { 
  Clock, 
  Users, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  BookOpen,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarDays,
  ChevronRight
} from "lucide-react";

const ApplyForProgram = () => {
  const { programId } = useParams<{ programId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { provider, hasActiveProvider, isLoading: providerLoading } = useActivePaymentProvider();
  
  const [selectedProgram, setSelectedProgram] = useState<string | null>(programId || null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'select' | 'batch' | 'confirm'>('select');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Fetch batches for selected program
  const { data: batches, isLoading: batchesLoading } = useBatches(selectedProgram || undefined);
  
  // Fetch custom application fields for selected program
  const { data: customFields } = useCustomFormFields('application', selectedProgram || undefined);

  // Check for existing unpaid applications
  const { data: existingApplications } = useQuery({
    queryKey: ['existing-applications', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, program_id, batch_id, application_fee_paid, status, programs(title)")
        .eq("trainee_id", user?.id)
        .eq("application_fee_paid", false);
      return data || [];
    },
    enabled: !!user,
  });

  const program = programs?.find(p => p.id === selectedProgram);
  const batch = batches?.find(b => b.id === selectedBatch);

  const handleSelectProgram = (id: string) => {
    setSelectedProgram(id);
    setSelectedBatch(null);
    setStep('batch');
  };

  const handleSelectBatch = (id: string) => {
    setSelectedBatch(id);
    setStep('confirm');
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
    setSelectedBatch(null);
    setStep('select');
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setStep('batch');
  };

  const handleSubmitApplication = async () => {
    if (!selectedProgram || !user || !program) return;
    
    setIsSubmitting(true);
    try {
      // Check if user already has an unpaid application for this program
      const existingForProgram = existingApplications?.find(a => a.program_id === selectedProgram);
      let applicationId = existingForProgram?.id;

      // Only create new application if one doesn't exist
      if (!applicationId) {
        const { data: application, error: appError } = await supabase
          .from("applications")
          .insert({
            program_id: selectedProgram,
            batch_id: selectedBatch,
            trainee_id: user.id,
            status: "pending",
          })
          .select()
          .single();

        if (appError) throw appError;
        applicationId = application.id;
      } else if (selectedBatch) {
        // Update existing application with selected batch
        await supabase
          .from("applications")
          .update({ batch_id: selectedBatch })
          .eq("id", applicationId);
      }

      if (!hasActiveProvider || !provider) {
        toast({
          title: "Payment not available",
          description: "No payment provider is currently configured. Please contact support.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      logger.debug("Initializing payment with provider:", provider, "for application:", applicationId);

      // Initialize payment - callback URL will include reference from payment provider
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "initialize-payment",
        {
          body: {
            provider,
            amount: program.application_fee,
            email: profile?.email || user.email,
            payment_type: "application_fee",
            application_id: applicationId,
            trainee_id: user.id,
            callback_url: `${window.location.origin}/dashboard/onboarding?payment=success`,
          },
        }
      );

      logger.debug("Payment initialization response:", paymentData);

      if (paymentError) {
        logger.error("Payment error:", paymentError);
        throw new Error(paymentError.message || "Payment initialization failed");
      }

      if (paymentData?.authorization_url) {
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("Failed to get payment URL from provider");
      }
    } catch (error: any) {
      logger.error("Application/payment error:", error);
      toast({
        title: "Application failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (programsLoading || providerLoading) {
    return (
      <DashboardLayout role="trainee" title="Apply for Program">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if payment provider is configured
  if (!hasActiveProvider) {
    return (
      <DashboardLayout role="trainee" title="Apply for Program">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Not Available</h3>
          <p className="text-muted-foreground">
            Payment processing is not currently configured. Please contact support.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  const publishedPrograms = programs?.filter(p => p.status === 'published') || [];
  const availableBatches = batches?.filter(b => {
    const spotsLeft = (b.max_capacity || 100) - (b.enrolled_count || 0);
    return spotsLeft > 0;
  }) || [];

  return (
    <DashboardLayout role="trainee" title="Apply for Program" subtitle="Select a program and cohort to begin your application">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            step === 'select' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
          }`}>
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs">1</span>
            Select Program
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            step === 'batch' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
          }`}>
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs">2</span>
            Choose Cohort
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            step === 'confirm' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
          }`}>
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs">3</span>
            Confirm & Pay
          </div>
        </div>
      </div>

      {/* Step 1: Select Program */}
      {step === 'select' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedPrograms.map((prog) => {
              const spotsLeft = (prog.max_capacity || 100) - prog.enrolled_count;
              const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;
              
              return (
                <Card 
                  key={prog.id} 
                  className={`cursor-pointer transition-all hover:border-accent hover:shadow-lg ${
                    selectedProgram === prog.id ? 'border-accent ring-2 ring-accent/20' : ''
                  }`}
                  onClick={() => handleSelectProgram(prog.id)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/80 to-primary rounded-t-lg relative overflow-hidden">
                    {prog.image_url && (
                      <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-semibold text-white truncate">{prog.title}</h3>
                    </div>
                    {isAlmostFull && (
                      <Badge className="absolute top-3 right-3" variant="pending">
                        {spotsLeft} spots left
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {prog.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {prog.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {prog.enrolled_count}/{prog.max_capacity || '∞'}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        ₦{prog.application_fee.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {publishedPrograms.length === 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Programs Available</h3>
              <p className="text-muted-foreground">
                There are no programs open for enrollment at this time. Check back later!
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Select Batch/Cohort */}
      {step === 'batch' && program && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={handleBackToPrograms}>
              ← Back to Programs
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <CardDescription>{program.duration} • ₦{program.application_fee.toLocaleString()} Application Fee</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold">Select Your Preferred Cohort</h3>
            </div>

            {batchesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : availableBatches.length > 0 ? (
              <div className="grid gap-4">
                {availableBatches.map((b) => {
                  const spotsLeft = (b.max_capacity || 100) - (b.enrolled_count || 0);
                  const startDate = new Date(b.start_date);
                  const endDate = b.end_date ? new Date(b.end_date) : null;
                  const isSelected = selectedBatch === b.id;

                  return (
                    <Card 
                      key={b.id}
                      className={`cursor-pointer transition-all hover:border-accent hover:shadow-md ${
                        isSelected ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : ''
                      }`}
                      onClick={() => handleSelectBatch(b.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex flex-col items-center justify-center border border-accent/20">
                              <span className="text-xs text-accent font-medium">{format(startDate, 'MMM')}</span>
                              <span className="text-lg font-bold text-accent">{format(startDate, 'd')}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{b.batch_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(startDate, 'MMMM d, yyyy')}
                                {endDate && ` - ${format(endDate, 'MMMM d, yyyy')}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={spotsLeft <= 5 ? "pending" : "outline"} className="mb-1">
                              {spotsLeft} spots left
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {b.enrolled_count || 0}/{b.max_capacity || '∞'} enrolled
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-accent">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Selected</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cohorts Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are no open cohorts for this program at the moment.
                </p>
                <Button variant="outline" onClick={handleBackToPrograms}>
                  Choose Another Program
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Pay */}
      {step === 'confirm' && program && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Confirm Application
              </CardTitle>
              <CardDescription>
                Review your selection before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Program Details */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{program.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{program.duration}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Enrolled:</span>
                    <span className="ml-2 font-medium">{program.enrolled_count}/{program.max_capacity || '∞'}</span>
                  </div>
                </div>
              </div>

              {/* Batch Details */}
              {batch && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Selected Cohort</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cohort Name:</span>
                      <span className="ml-2 font-medium">{batch.batch_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="ml-2 font-medium">{format(new Date(batch.start_date), 'MMMM d, yyyy')}</span>
                    </div>
                    {batch.end_date && (
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="ml-2 font-medium">{format(new Date(batch.end_date), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Available Spots:</span>
                      <span className="ml-2 font-medium">
                        {(batch.max_capacity || 100) - (batch.enrolled_count || 0)} remaining
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-accent" />
                  Payment Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-foreground">Application Fee</span>
                      <p className="text-xs text-muted-foreground">Pay now to submit your application</p>
                    </div>
                    <span className="font-semibold text-accent">₦{program.application_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-start text-muted-foreground">
                    <div>
                      <span className="font-medium">Registration Fee</span>
                      <p className="text-xs">Pay after approval to complete enrollment</p>
                    </div>
                    <span className="font-medium">₦{program.registration_fee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Due Now (Application Fee)</span>
                      <span className="text-accent">₦{program.application_fee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Application Fields */}
              {customFields && customFields.length > 0 && (
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium">Additional Information</h4>
                  <div className="grid gap-4">
                    {customFields.map((field) => (
                      <DynamicFormField
                        key={field.id}
                        field={field}
                        value={customFieldValues[field.field_name]}
                        onChange={(value) => setCustomFieldValues(prev => ({
                          ...prev,
                          [field.field_name]: value
                        }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info Note */}
              <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Two-Step Payment Process</p>
                  <ul className="text-muted-foreground mt-1 space-y-1">
                    <li>• <strong>Step 1 (Now):</strong> Pay the Application Fee to submit your application</li>
                    <li>• <strong>Step 2 (After Approval):</strong> Pay the Registration Fee to complete enrollment</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBackToBatches} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmitApplication} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Application Fee - ₦{program.application_fee.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApplyForProgram;
