import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Award, 
  Loader2, 
  Search,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ApplicationWithDetails {
  id: string;
  status: string;
  registration_number: string | null;
  completion_status: string | null;
  completed_at: string | null;
  trainee: {
    id: string;
    full_name: string;
    email: string;
  };
  program: {
    id: string;
    title: string;
  };
  batch?: {
    id: string;
    batch_name: string;
  };
  certificate?: {
    id: string;
    certificate_number: string;
  }[];
}

const AdminCertificates = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          registration_number,
          completion_status,
          completed_at,
          trainee:profiles!applications_trainee_id_fkey (
            id,
            full_name,
            email
          ),
          program:programs!applications_program_id_fkey (
            id,
            title
          ),
          batch:batches!applications_batch_id_fkey (
            id,
            batch_name
          ),
          certificate:certificates!certificates_application_id_fkey (
            id,
            certificate_number
          )
        `)
        .eq('status', 'approved')
        .eq('registration_fee_paid', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ApplicationWithDetails[];
    },
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('applications')
        .update({
          completion_status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      toast.success("Trainee marked as completed!");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      setIsIssuing(true);
      const { data, error } = await supabase
        .rpc('issue_certificate', { p_application_id: applicationId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      setSelectedApplication(null);
      toast.success("Certificate issued successfully!");
    },
    onError: (error) => {
      toast.error("Failed to issue certificate: " + error.message);
    },
    onSettled: () => {
      setIsIssuing(false);
    },
  });

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = 
      app.trainee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trainee?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registration_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "completed") return matchesSearch && app.completion_status === 'completed';
    if (statusFilter === "enrolled") return matchesSearch && app.completion_status === 'enrolled';
    if (statusFilter === "certified") return matchesSearch && app.certificate && app.certificate.length > 0;
    return matchesSearch;
  });

  const getCompletionBadge = (app: ApplicationWithDetails) => {
    if (app.certificate && app.certificate.length > 0) {
      return <Badge variant="approved">Certified</Badge>;
    }
    if (app.completion_status === 'completed') {
      return <Badge variant="active">Completed</Badge>;
    }
    return <Badge variant="pending">Enrolled</Badge>;
  };

  return (
    <DashboardLayout role="admin" title="Certificate Management" subtitle="Track progress and issue certificates">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificate Management</h1>
          <p className="text-muted-foreground mt-1">
            Track trainee progress and issue completion certificates
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Enrolled", value: applications?.length || 0, icon: FileText },
            { label: "Completed", value: applications?.filter(a => a.completion_status === 'completed').length || 0, icon: CheckCircle },
            { label: "Certified", value: applications?.filter(a => a.certificate && a.certificate.length > 0).length || 0, icon: Award },
            { label: "In Progress", value: applications?.filter(a => a.completion_status === 'enrolled').length || 0, icon: Loader2 },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, program..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trainees</SelectItem>
                  <SelectItem value="enrolled">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Trainees</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : filteredApplications && filteredApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainee</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Reg. Number</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.trainee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{app.trainee?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.program?.title}</TableCell>
                      <TableCell>{app.registration_number || '-'}</TableCell>
                      <TableCell>{app.batch?.batch_name || '-'}</TableCell>
                      <TableCell>{getCompletionBadge(app)}</TableCell>
                      <TableCell>
                        {app.certificate && app.certificate.length > 0 ? (
                          <span className="text-sm font-mono">{app.certificate[0].certificate_number}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {app.completion_status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markCompletedMutation.mutate(app.id)}
                              disabled={markCompletedMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          {app.completion_status === 'completed' && (!app.certificate || app.certificate.length === 0) && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <Award className="w-4 h-4 mr-1" />
                              Issue Certificate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No enrolled trainees found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Certificate Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>
              Confirm issuing a completion certificate for this trainee
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trainee:</span>
                  <span className="font-medium">{selectedApplication.trainee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program:</span>
                  <span className="font-medium">{selectedApplication.program?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration:</span>
                  <span className="font-medium">{selectedApplication.registration_number}</span>
                </div>
                {selectedApplication.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium">
                      {format(new Date(selectedApplication.completed_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => issueCertificateMutation.mutate(selectedApplication.id)}
                  disabled={isIssuing}
                >
                  {isIssuing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminCertificates;
