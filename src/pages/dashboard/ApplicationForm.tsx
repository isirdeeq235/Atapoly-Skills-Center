import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCustomFormFields } from "@/hooks/useCustomFormFields";
import { DynamicFormField } from "@/components/forms/DynamicFormField";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { 
  FileText, 
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Send
} from "lucide-react";

const ApplicationForm = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Fetch the application details
  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application-form', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          programs(id, title, description, application_fee, registration_fee),
          profiles!applications_trainee_id_fkey(full_name, email, phone, date_of_birth, gender, address, state, avatar_url)
        `)
        .eq('id', applicationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!applicationId,
  });

  // Fetch custom application fields for this program
  const { data: customFields } = useCustomFormFields('application', application?.program_id);

  // Load existing custom field values
  useEffect(() => {
    if (application?.custom_field_values) {
      const values = typeof application.custom_field_values === 'string' 
        ? JSON.parse(application.custom_field_values) 
        : application.custom_field_values;
      setCustomFieldValues(values as Record<string, any>);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !application) return;

    // Validate required custom fields
    const missingRequired = customFields?.filter(f => 
      f.is_required && !customFieldValues[f.field_name]
    );
    
    if (missingRequired && missingRequired.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingRequired.map(f => f.field_label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update application with custom field values and mark as submitted
      const { error } = await supabase
        .from('applications')
        .update({
          custom_field_values: customFieldValues,
          submitted: true,
          submitted_at: new Date().toISOString(),
          status: 'pending', // Ensure status is set to pending when submitted
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Notify admins about the new application
      try {
        const programTitle = application.programs?.title || 'Unknown Program';
        const traineeName = application.profiles?.full_name || profile?.full_name || 'Trainee';
        
        await supabase.rpc('notify_admins_new_application', {
          p_trainee_name: traineeName,
          p_program_title: programTitle,
          p_application_id: applicationId
        });
      } catch (notifyError) {
        logger.error('Error notifying admins:', notifyError);
      }

      toast({
        title: "Application Submitted! 🎉",
        description: "Your application has been submitted for review. You'll be notified once a decision is made.",
      });

      navigate('/dashboard/onboarding');
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (appLoading) {
    return (
      <DashboardLayout role="trainee" title="Application Form">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout role="trainee" title="Application Form">
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Application Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The application you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/dashboard/onboarding')}>
            Go to Dashboard
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const profileData = application.profiles;
  const programData = application.programs;

  return (
    <DashboardLayout 
      role="trainee" 
      title="Application Form" 
      subtitle={`Complete your application for ${programData?.title}`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator - 6 Step Flow */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success text-white flex items-center justify-center text-xs sm:text-sm font-semibold">✓</div>
              <span className="font-medium text-success hidden sm:inline">App Fee</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success text-white flex items-center justify-center text-xs sm:text-sm font-semibold">✓</div>
              <span className="font-medium text-success hidden sm:inline">Profile</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs sm:text-sm font-semibold">3</div>
              <span className="font-medium">Application</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-semibold">4</div>
              <span className="hidden sm:inline">Review</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-semibold">5</div>
              <span className="hidden sm:inline">Reg Fee</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-semibold">6</div>
              <span className="hidden sm:inline">Enrolled</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent w-[42%] transition-all" />
          </div>
        </div>

        {/* Program Info Card */}
        <Card className="mb-6 border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{programData?.title}</h3>
                <p className="text-sm text-muted-foreground">{programData?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-filled Profile Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Applicant Information
                <span className="text-xs font-normal text-muted-foreground ml-2">(from your profile)</span>
              </CardTitle>
            <CardDescription>
              This information is pulled from your profile. <Link to="/dashboard/complete-profile" className="text-accent underline">Edit your profile</Link> to make changes.
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {profileData?.avatar_url && (
                  <div className="md:col-span-2 flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <img 
                      src={profileData.avatar_url} 
                      alt="Passport" 
                      className="w-20 h-24 object-cover rounded-lg border-2 border-white shadow"
                    />
                    <div>
                      <p className="font-semibold text-lg">{profileData.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profileData.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData?.full_name || '-'}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData?.email || '-'}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData?.phone || '-'}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Date of Birth</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData?.date_of_birth || '-'}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Gender</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{profileData?.gender || '-'}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">State</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData?.state || '-'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Application Fields */}
          {customFields && customFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Program-Specific Questions
                </CardTitle>
                <CardDescription>
                  Please answer the following questions for your {programData?.title} application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* No custom fields message */}
          {(!customFields || customFields.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
                <h3 className="font-semibold mb-2">Profile Information Complete</h3>
                <p className="text-muted-foreground">
                  No additional information is required for this program. Click submit to send your application for review.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/onboarding')}
            >
              Save & Continue Later
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationForm;
