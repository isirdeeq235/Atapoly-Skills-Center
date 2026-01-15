import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useActivePaymentProvider } from "@/hooks/useActivePaymentProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  ArrowRight,
  Plus
} from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  status: string;
  application_fee_paid: boolean;
  registration_fee_paid: boolean;
  registration_number: string | null;
  created_at: string;
  programs: {
    id: string;
    title: string;
    registration_fee: number;
  };
}

const MyApplications = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { provider, hasActiveProvider } = useActivePaymentProvider();
  const [payingFor, setPayingFor] = useState<string | null>(null);

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          programs(id, title, registration_fee)
        `)
        .eq("trainee_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
    enabled: !!user,
  });

  // Handle payment success query params
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your application fee has been paid. Your application is now under review.",
      });
      // Clear the query param
      setSearchParams({});
      // Refetch applications
      refetch();
    } else if (payment === 'registration_success') {
      toast({
        title: "Registration Complete!",
        description: "Congratulations! You are now fully enrolled. Check your email for your ID card.",
      });
      // Clear the query param
      setSearchParams({});
      // Refetch applications
      refetch();
    }
  }, [searchParams, toast, setSearchParams, refetch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'pending': return <Clock className="w-5 h-5 text-warning" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-destructive" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="approved">Approved</Badge>;
      case 'pending': return <Badge variant="pending">Pending Review</Badge>;
      case 'rejected': return <Badge variant="rejected">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handlePayRegistrationFee = async (application: Application) => {
    if (!user || !profile) return;

    setPayingFor(application.id);
    try {
      if (!hasActiveProvider || !provider) {
        toast({
          title: "Payment not available",
          description: "No payment provider is currently configured. Please contact support.",
          variant: "destructive",
        });
        setPayingFor(null);
        return;
      }

      // Initialize payment for registration fee
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "initialize-payment",
        {
          body: {
            provider,
            amount: application.programs?.registration_fee || 0,
            email: profile?.email || user.email,
            payment_type: "registration_fee",
            application_id: application.id,
            trainee_id: user.id,
            callback_url: `${window.location.origin}/dashboard/applications?payment=registration_success`,
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
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
      setPayingFor(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="trainee" title="My Applications">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="trainee" 
      title="My Applications" 
      subtitle="Track your program applications"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-muted-foreground">
            {applications?.length || 0} application(s) submitted
          </p>
        </div>
        <Link to="/dashboard/apply">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start your learning journey by applying for a training program
          </p>
          <Link to="/dashboard/apply">
            <Button>
              Browse Programs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(application.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{application.programs?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Applied on {format(new Date(application.created_at), 'PPP')}
                      </p>
                      {application.registration_number && (
                        <p className="text-sm text-accent mt-1">
                          Reg. No: {application.registration_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      {/* Application Fee Status */}
                      <div className="flex items-center gap-2">
                        {application.application_fee_paid ? (
                          <Badge variant="approved" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            App Fee Paid
                          </Badge>
                        ) : (
                          <Badge variant="pending" className="gap-1">
                            <Clock className="w-3 h-3" />
                            App Fee Pending
                          </Badge>
                        )}
                      </div>

                      {/* Registration Fee Status (only show if approved) */}
                      {application.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          {application.registration_fee_paid ? (
                            <Badge variant="approved" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Registered
                            </Badge>
                          ) : (
                            <Badge variant="pending" className="gap-1">
                              <CreditCard className="w-3 h-3" />
                              Pay Reg. Fee
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(application.status)}
                      
                      {/* Pay Registration Fee Button */}
                      {application.status === 'approved' && 
                       !application.registration_fee_paid && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePayRegistrationFee(application)}
                          disabled={payingFor === application.id}
                        >
                          {payingFor === application.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-1" />
                          )}
                          Pay ₦{application.programs?.registration_fee?.toLocaleString()}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {application.status === 'pending' && (
                  <div className="mt-4 p-3 bg-warning/10 rounded-lg text-sm">
                    <p className="text-warning-foreground">
                      Your application is being reviewed. You'll receive an email once a decision is made.
                    </p>
                  </div>
                )}
                {application.status === 'approved' && !application.registration_fee_paid && (
                  <div className="mt-4 p-3 bg-success/10 rounded-lg text-sm">
                    <p className="text-success">
                      Congratulations! Your application has been approved. Please pay the registration fee to complete enrollment.
                    </p>
                  </div>
                )}
                {application.status === 'rejected' && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm">
                    <p className="text-destructive">
                      Unfortunately, your application was not approved. Please contact support for more information.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyApplications;
