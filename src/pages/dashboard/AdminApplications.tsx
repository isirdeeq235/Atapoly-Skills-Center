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

interface Application {
  id: string;
  status: string;
  application_fee_paid: boolean;
  registration_fee_paid: boolean;
  registration_number: string | null;
  created_at: string;
  admin_notes: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          profiles!applications_trainee_id_fkey(id, full_name, email, phone),
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
          console.error('Error generating registration number:', regError);
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
        console.log("In-app notification created successfully");
      } catch (notifError) {
        console.error("Failed to create in-app notification:", notifError);
      }

      // Send email notification to trainee about status change
      try {
        const dashboardUrl = `${window.location.origin}/dashboard/applications`;
        
        await supabase.functions.invoke("send-email", {
          body: {
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
          },
        });
        console.log("Email notification sent successfully");
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
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
      console.error(error);
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
      console.error(error);
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
    
    return matchesSearch && matchesStatus;
  });

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
    pending: applications?.filter(a => a.status === 'pending').length || 0,
    approved: applications?.filter(a => a.status === 'approved').length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0,
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
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
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "No applications have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>App Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{application.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{application.programs?.title}</p>
                      </TableCell>
                      <TableCell>
                        {application.application_fee_paid ? (
                          <Badge variant="approved" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="pending" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Unpaid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(application.created_at), 'MMM d, yyyy')}
                      </TableCell>
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
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Applicant Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedApplication.profiles?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedApplication.profiles?.email}</span>
                    </div>
                    {selectedApplication.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedApplication.profiles?.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Applied: {format(new Date(selectedApplication.created_at), 'PPP')}</span>
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
                          Application Fee: ₦{selectedApplication.programs?.application_fee?.toLocaleString()}
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
                          Registration Fee: ₦{selectedApplication.programs?.registration_fee?.toLocaleString()}
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Current Status:</span>
                      {getStatusBadge(selectedApplication.status)}
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

              {/* Warning for unpaid applications */}
              {!selectedApplication.application_fee_paid && selectedApplication.status === 'pending' && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    ⚠️ The applicant has not paid the application fee yet. You may want to wait for payment before approving.
                  </p>
                </div>
              )}
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
