import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/functionsClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  CreditCard, 
  Loader2, 
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign,
  TrendingUp
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAdminPaymentSync } from "@/hooks/usePaymentSync";

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  provider: string;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
  trainee_id: string;
  application_id: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  applications: {
    programs: {
      title: string;
    };
  };
}

const AdminPayments = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  useAdminPaymentSync();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles!payments_trainee_id_fkey(full_name, email, phone),
          applications!payments_application_id_fkey(programs(title))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });

  // Manual verification mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, reference, provider }: { paymentId: string; reference: string; provider: string }) => {
      const { data, error } = await invokeFunction("verify-payment", { reference, provider, payment_id: paymentId });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Payment verified successfully");
        queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
        queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      } else {
        toast.error(data?.error || "Payment verification failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Verification failed");
    }
  });

  // Mark payment as completed manually
  const markCompleteMutation = useMutation({
    mutationFn: async ({ paymentId, applicationId, paymentType }: { 
      paymentId: string; 
      applicationId: string; 
      paymentType: string;
    }) => {
      // Update payment status
      await supabase
        .from("payments")
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq("id", paymentId);
      
      // Update application
      const updateField = paymentType === 'application_fee' 
        ? { application_fee_paid: true } 
        : { registration_fee_paid: true };
      
      await supabase
        .from("applications")
        .update({ ...updateField, updated_at: new Date().toISOString() })
        .eq("id", applicationId);
      
      return { paymentType };
    },
    onSuccess: (data) => {
      toast.success(`${data.paymentType === 'application_fee' ? 'Application' : 'Registration'} fee marked as completed`);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    },
    onError: () => {
      toast.error("Failed to update payment status");
    }
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.provider_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesType = typeFilter === "all" || payment.payment_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const stats = {
    total: payments?.length || 0,
    completed: payments?.filter(p => p.status === 'completed').length || 0,
    pending: payments?.filter(p => p.status === 'pending').length || 0,
    failed: payments?.filter(p => p.status === 'failed').length || 0,
    totalAmount: payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
    todayAmount: payments?.filter(p => 
      p.status === 'completed' && 
      new Date(p.created_at).toDateString() === new Date().toDateString()
    ).reduce((sum, p) => sum + Number(p.amount), 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="approved">Completed</Badge>;
      case 'pending': return <Badge variant="pending">Pending</Badge>;
      case 'failed': return <Badge variant="rejected">Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    return type === 'application_fee' 
      ? <Badge variant="outline" className="text-blue-600 border-blue-200">App Fee</Badge>
      : <Badge variant="outline" className="text-green-600 border-green-200">Reg Fee</Badge>;
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredPayments?.length) {
      toast.error("No payments to export");
      return;
    }

    const headers = ['Date', 'Trainee', 'Email', 'Program', 'Type', 'Amount', 'Status', 'Provider', 'Reference'];
    const rows = filteredPayments.map(p => [
      format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
      p.profiles?.full_name || '',
      p.profiles?.email || '',
      p.applications?.programs?.title || '',
      p.payment_type,
      p.amount,
      p.status,
      p.provider,
      p.provider_reference || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success("Payments exported successfully");
  };

  const dashboardRole = role === 'super_admin' ? 'super-admin' : (role as 'admin' | 'instructor');

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Payments">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole}
      title="Payment Management" 
      subtitle="View and manage all payment transactions"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
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
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
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
                <p className="text-xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
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
                <p className="text-xl font-bold">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold">₦{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-xl font-bold">₦{stats.todayAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Today</p>
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
                placeholder="Search by name, email, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="application_fee">Application Fee</SelectItem>
                <SelectItem value="registration_fee">Registration Fee</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(payment.created_at), "h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{payment.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.applications?.programs?.title || '-'}</TableCell>
                    <TableCell>{getPaymentTypeBadge(payment.payment_type)}</TableCell>
                    <TableCell className="font-semibold">₦{Number(payment.amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.provider}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          {payment.provider_reference && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyPaymentMutation.mutate({
                                paymentId: payment.id,
                                reference: payment.provider_reference!,
                                provider: payment.provider
                              })}
                              disabled={verifyPaymentMutation.isPending}
                            >
                              <RefreshCw className={`w-3 h-3 mr-1 ${verifyPaymentMutation.isPending ? 'animate-spin' : ''}`} />
                              Verify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => markCompleteMutation.mutate({
                              paymentId: payment.id,
                              applicationId: payment.application_id,
                              paymentType: payment.payment_type
                            })}
                            disabled={markCompleteMutation.isPending}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                      {payment.status === 'completed' && (
                        <span className="text-xs text-muted-foreground">
                          Ref: {payment.provider_reference?.slice(0, 12)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredPayments || filteredPayments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminPayments;