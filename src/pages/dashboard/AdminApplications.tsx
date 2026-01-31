import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createNotification } from "@/hooks/useNotifications";
import { logger } from "@/lib/logger";
import { invokeFunction } from "@/lib/functionsClient";
import { 
  FileText, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAdminPaymentSync } from "@/hooks/usePaymentSync";

interface Application {
  id: string;
  status: string;
  application_fee_paid: boolean;
  registration_fee_paid: boolean;
  registration_number: string | null;
  created_at: string;
  submitted_at: string | null;
  admin_notes: string | null;
  submitted: boolean;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    state: string | null;
  };
  programs: {
    id: string;
    title: string;
    application_fee: number;
    registration_fee: number;
  };
}

const AdminApplications = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  // Enable real-time sync for applications
  useAdminPaymentSync();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      // Fetch ALL applications to show the full pipeline
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          profiles!applications_trainee_id_fkey(id, full_name, email, phone, avatar_url, date_of_birth, gender, address, state),
          programs(id, title, application_fee, registration_fee)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status, notes, application }: { id: string; status: string; notes?: string; application: Application }) => {
      const updateData: Record<string, unknown> = { status };
      let regNumber = '';
      
      if (notes) {
        updateData.admin_notes = notes;
      }
      
      // Generate registration number using database function for approved applications
      if (status === 'approved') {
        const { data: regData, error: regError } = await supabase
          .rpc('generate_registration_number', { program_title: application.programs?.title || 'PRG' });
        
        if (regError) {
          logger.error('Error generating registration number:', regError);
          regNumber = `REG-${Date.now().toString(36).toUpperCase()}`;
        } else {
          regNumber = regData;
        }
        updateData.registration_number = regNumber;
      }

      const { error } = await supabase
        .from("applications")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Create in-app notification for trainee
      try {
        const notificationType = status === 'approved' ? 'application_approved' : 'application_rejected';
        const notificationTitle = status === 'approved' 
          ? 'Application Approved! 🎉' 
          : 'Application Update';
        const notificationMessage = status === 'approved'
          ? `Your application for ${application.programs?.title} has been approved! Please proceed to pay the registration fee of ₦${application.programs?.registration_fee?.toLocaleString() || '0'}.`
          : `Your application for ${application.programs?.title} has been reviewed. ${notes ? `Admin notes: ${notes}` : 'Please contact support for more information.'}`;

        await createNotification(
          application.profiles?.id,
          notificationType,
          notificationTitle,
          notificationMessage,
          {
            application_id: id,
            program_id: application.programs?.id,
            program_title: application.programs?.title,
            registration_number: regNumber || null,
          }
        );
        logger.debug("In-app notification created successfully");
      } catch (notifError) {
        logger.error("Failed to create in-app notification:", notifError);
      }

      // Send email notification to trainee about status change
      try {
        const dashboardUrl = `${window.location.origin}/dashboard/applications`;
        
        await invokeFunction("send-email", {
          to: application.profiles?.email,
          template: status === 'approved' ? 'application_approved' : 'application_rejected',
          data: {
            name: application.profiles?.full_name,
            program: application.programs?.title,
            registration_number: regNumber,
            registration_fee: application.programs?.registration_fee?.toLocaleString() || '0',
            admin_notes: notes || '',
            dashboard_url: dashboardUrl,
          },
        });
        logger.debug("Email notification sent successfully");
      } catch (emailError) {
        logger.error("Failed to send email notification:", emailError);
        // Don't throw - email failure shouldn't block the approval
      }

      return { status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success(`Application ${data.status} successfully. Email notification sent.`);
      setIsReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewNotes("");
    },
    onError: (error) => {
      toast.error("Failed to update application");
      logger.error(error);
    },
  });

  // Mutation to manually mark payment as complete (for admin verification)
  const markPaymentCompleteMutation = useMutation({
    mutationFn: async ({ applicationId, paymentType, traineeId }: { 
      applicationId: string; 
      paymentType: 'application_fee' | 'registration_fee';
      traineeId: string;
    }) => {
      // Update application fee status
      const updateField = paymentType === 'application_fee' 
        ? { application_fee_paid: true } 
        : { registration_fee_paid: true };
      
      const { error } = await supabase
        .from("applications")
        .update({ ...updateField, updated_at: new Date().toISOString() })
        .eq("id", applicationId);

      if (error) throw error;

      // If marking registration fee as paid, also increment enrolled count and generate reg number if needed
      if (paymentType === 'registration_fee') {
        const { data: appData } = await supabase
          .from("applications")
          .select("registration_number, program_id, programs(title)")
          .eq("id", applicationId)
          .single();
        
        if (appData && !appData.registration_number) {
          const { data: regNum } = await supabase.rpc("generate_registration_number", {
            program_title: (appData.programs as any)?.title || "PROG"
          });
          
          await supabase
            .from("applications")
            .update({ registration_number: regNum })
            .eq("id", applicationId);
            
          // Increment enrolled count
          await supabase.rpc("increment_enrolled_count", { program_id: appData.program_id });
        }

        // Notify trainee
        await createNotification(
          traineeId,
          'registration_complete',
          'Registration Complete! 🎓',
          'Your registration fee has been verified. You now have full access to your dashboard and ID card.',
          { application_id: applicationId }
        );
      } else {
        // Notify trainee for application fee
        await createNotification(
          traineeId,
          'payment_verified',
          'Payment Verified ✓',
          'Your application fee has been verified by admin. Please complete your profile to continue.',
          { application_id: applicationId }
        );
      }

      return { paymentType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success(`${data.paymentType === 'application_fee' ? 'Application' : 'Registration'} fee marked as paid`);
    },
    onError: (error) => {
      toast.error("Failed to update payment status");
      logger.error(error);
    },
  });

  const handleReviewApplication = (application: Application) => {
    setSelectedApplication(application);
    setReviewNotes(application.admin_notes || "");
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedApplication) return;
    updateApplicationMutation.mutate({
      id: selectedApplication.id,
      status: 'approved',
      notes: reviewNotes,
      application: selectedApplication,
    });
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    updateApplicationMutation.mutate({
      id: selectedApplication.id,
      status: 'rejected',
      notes: reviewNotes,
      application: selectedApplication,
    });
  };

  const handleMarkPaymentComplete = (paymentType: 'application_fee' | 'registration_fee') => {
    if (!selectedApplication) return;
    markPaymentCompleteMutation.mutate({
      applicationId: selectedApplication.id,
      paymentType,
      traineeId: selectedApplication.profiles?.id,
    });
  };

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = 
      app.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.programs?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    // Pipeline filter matching
    let matchesPipeline = pipelineFilter === "all";
    if (pipelineFilter === "fee_pending") matchesPipeline = !app.application_fee_paid;
    else if (pipelineFilter === "draft") matchesPipeline = app.application_fee_paid && !app.submitted;
    else if (pipelineFilter === "under_review") matchesPipeline = app.submitted && app.status === 'pending';
    else if (pipelineFilter === "awaiting_reg") matchesPipeline = app.status === 'approved' && !app.registration_fee_paid;
    else if (pipelineFilter === "enrolled") matchesPipeline = app.status === 'approved' && app.registration_fee_paid;
    else if (pipelineFilter === "rejected") matchesPipeline = app.status === 'rejected';
    
    return matchesSearch && matchesStatus && matchesPipeline;
  });

  // Get pipeline status for each application
  const getPipelineStatus = (app: Application) => {
    if (!app.application_fee_paid) return { label: 'Fee Pending', key: 'fee_pending', color: 'bg-orange-500/10 text-orange-600 border-orange-200' };
    if (!app.submitted) return { label: 'Draft', key: 'draft', color: 'bg-slate-500/10 text-slate-600 border-slate-200' };
    if (app.status === 'pending') return { label: 'Under Review', key: 'under_review', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' };
    if (app.status === 'rejected') return { label: 'Rejected', key: 'rejected', color: 'bg-red-500/10 text-red-600 border-red-200' };
    if (app.status === 'approved' && !app.registration_fee_paid) return { label: 'Awaiting Reg Fee', key: 'awaiting_reg', color: 'bg-blue-500/10 text-blue-600 border-blue-200' };
    if (app.status === 'approved' && app.registration_fee_paid) return { label: 'Enrolled', key: 'enrolled', color: 'bg-green-500/10 text-green-600 border-green-200' };
    return { label: app.status, key: 'other', color: 'bg-gray-500/10 text-gray-600 border-gray-200' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="approved">Approved</Badge>;
      case 'pending': return <Badge variant="pending">Pending</Badge>;
      case 'rejected': return <Badge variant="rejected">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: applications?.length || 0,
    feePending: applications?.filter(a => !a.application_fee_paid).length || 0,
    draft: applications?.filter(a => a.application_fee_paid && !a.submitted).length || 0,
    underReview: applications?.filter(a => a.submitted && a.status === 'pending').length || 0,
    approved: applications?.filter(a => a.status === 'approved' && !a.registration_fee_paid).length || 0,
    enrolled: applications?.filter(a => a.status === 'approved' && a.registration_fee_paid).length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0,
  };

  // Count pending applications awaiting review
  const pendingReviewCount = stats.underReview;

  const dashboardRole = role === 'super_admin' ? 'super-admin' : (role as 'admin' | 'instructor');

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Applications">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole}
      title="Application Review" 
      subtitle="Review and manage trainee applications"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.feePending}</p>
                <p className="text-xs text-muted-foreground">Fee Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.underReview}</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Awaiting Reg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.enrolled}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Pipeline Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pipeline</SelectItem>
                <SelectItem value="fee_pending">Fee Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="awaiting_reg">Awaiting Reg Fee</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredApplications || filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || pipelineFilter !== "all"
                  ? "Try adjusting your search or filters" 
                  : "Applications will appear here once trainees complete the payment and submission process."}
              </p>
              {!searchQuery && statusFilter === "all" && pipelineFilter === "all" && (
                <div className="max-w-md mx-auto text-left bg-secondary/50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-2">Application Flow:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Trainee pays application fee</li>
                    <li>Trainee completes profile</li>
                    <li>Trainee fills & submits application form</li>
                    <li><strong className="text-foreground">Application appears here for review</strong></li>
                    <li>Admin approves/rejects</li>
                    <li>If approved, trainee pays registration fee</li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Pipeline Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {application.profiles?.avatar_url ? (
                            <img 
                              src={application.profiles.avatar_url} 
                              alt=""
                              className="w-10 h-12 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-10 h-12 bg-muted rounded-md flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{application.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{application.profiles?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{application.programs?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          ₦{application.programs?.registration_fee?.toLocaleString()} reg fee
                        </p>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const pipeline = getPipelineStatus(application);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${pipeline.color}`}>
                              {pipeline.label}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {application.submitted 
                          ? (application.submitted_at 
                              ? format(new Date(application.submitted_at), 'MMM d, yyyy')
                              : 'Submitted')
                          : <span className="text-orange-500 text-xs">Not submitted</span>
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReviewApplication(application)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review the applicant details and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Profile Header */}
              <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                {selectedApplication.profiles?.avatar_url ? (
                  <img 
                    src={selectedApplication.profiles.avatar_url} 
                    alt={selectedApplication.profiles.full_name}
                    className="w-20 h-24 object-cover rounded-lg border-2 border-background shadow-md"
                  />
                ) : (
                  <div className="w-20 h-24 bg-muted rounded-lg border-2 border-background shadow-md flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedApplication.profiles?.full_name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedApplication.profiles?.email}
                    </span>
                    {selectedApplication.profiles?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedApplication.profiles.phone}
                      </span>
                    )}
                  </div>
                  {selectedApplication.submitted_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted: {format(new Date(selectedApplication.submitted_at), 'PPP, p')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedApplication.status)}
                  {selectedApplication.registration_number && (
                    <p className="text-xs font-mono mt-2 text-muted-foreground">
                      #{selectedApplication.registration_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedApplication.profiles?.date_of_birth && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <span>{format(new Date(selectedApplication.profiles.date_of_birth), 'PPP')}</span>
                      </div>
                    )}
                    {selectedApplication.profiles?.gender && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="capitalize">{selectedApplication.profiles.gender}</span>
                      </div>
                    )}
                    {selectedApplication.profiles?.address && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Address:</span>
                        <span className="text-right">{selectedApplication.profiles.address}</span>
                      </div>
                    )}
                    {selectedApplication.profiles?.state && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State:</span>
                        <span>{selectedApplication.profiles.state}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applied:</span>
                      <span>{format(new Date(selectedApplication.created_at), 'PPP')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Program & Fees</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedApplication.programs?.title}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          App Fee: ₦{selectedApplication.programs?.application_fee?.toLocaleString()}
                        </span>
                        {selectedApplication.application_fee_paid ? (
                          <Badge variant="approved">Paid</Badge>
                        ) : (
                          <Badge variant="pending">Unpaid</Badge>
                        )}
                      </div>
                      {!selectedApplication.application_fee_paid && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkPaymentComplete('application_fee')}
                          disabled={markPaymentCompleteMutation.isPending}
                        >
                          {markPaymentCompleteMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          Verify
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Reg Fee: ₦{selectedApplication.programs?.registration_fee?.toLocaleString()}
                        </span>
                        {selectedApplication.registration_fee_paid ? (
                          <Badge variant="approved">Paid</Badge>
                        ) : (
                          <Badge variant="pending">Unpaid</Badge>
                        )}
                      </div>
                      {selectedApplication.status === 'approved' && !selectedApplication.registration_fee_paid && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkPaymentComplete('registration_fee')}
                          disabled={markPaymentCompleteMutation.isPending}
                        >
                          {markPaymentCompleteMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          Verify
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Review Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this application (optional)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateApplicationMutation.isPending || selectedApplication?.status === 'rejected'}
            >
              <UserX className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateApplicationMutation.isPending || selectedApplication?.status === 'approved'}
            >
              {updateApplicationMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4 mr-1" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminApplications;
