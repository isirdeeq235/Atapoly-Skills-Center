import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePrograms } from "@/hooks/usePrograms";
import { useActivePaymentProvider } from "@/hooks/useActivePaymentProvider";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  Users, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  BookOpen,
  ArrowRight,
  AlertCircle
} from "lucide-react";

const ApplyForProgram = () => {
  const { programId } = useParams<{ programId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { provider, hasActiveProvider } = useActivePaymentProvider();
  
  const [selectedProgram, setSelectedProgram] = useState<string | null>(programId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'payment'>('select');

  const program = programs?.find(p => p.id === selectedProgram);

  const handleSelectProgram = (id: string) => {
    setSelectedProgram(id);
    setStep('confirm');
  };

  const handleSubmitApplication = async () => {
    if (!selectedProgram || !user) return;
    
    setIsSubmitting(true);
    try {
      // Create application
      const { data: application, error: appError } = await supabase
        .from("applications")
        .insert({
          program_id: selectedProgram,
          trainee_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (appError) throw appError;

      if (!hasActiveProvider || !provider) {
        toast({
          title: "Payment not available",
          description: "No payment provider is currently configured. Please contact support.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Initialize payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "initialize-payment",
        {
          body: {
            provider,
            amount: program?.application_fee || 0,
            email: profile?.email || user.email,
            payment_type: "application_fee",
            application_id: application.id,
            trainee_id: user.id,
            callback_url: `${window.location.origin}/dashboard/applications?payment=success`,
          },
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.authorization_url) {
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (programsLoading) {
    return (
      <DashboardLayout role="trainee" title="Apply for Program">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const publishedPrograms = programs?.filter(p => p.status === 'published') || [];

  return (
    <DashboardLayout role="trainee" title="Apply for Program" subtitle="Select a program to begin your application">
      {step === 'select' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedPrograms.map((prog) => {
              const spotsLeft = (prog.max_capacity || 100) - prog.enrolled_count;
              const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;
              
              return (
                <Card 
                  key={prog.id} 
                  className={`cursor-pointer transition-all hover:border-accent ${
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

      {step === 'confirm' && program && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Confirm Application
              </CardTitle>
              <CardDescription>
                Review the program details before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{program.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{program.duration}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="ml-2 font-medium">{program.enrolled_count}/{program.max_capacity || '∞'}</span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Application Fee</span>
                    <span className="font-semibold">₦{program.application_fee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-accent">₦{program.application_fee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Important Note</p>
                  <p className="text-muted-foreground">
                    After paying the application fee, your application will be reviewed by an admin. 
                    You'll receive an email notification once it's approved.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
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
                      Pay ₦{program.application_fee.toLocaleString()}
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
