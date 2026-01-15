import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  CreditCard, 
  Download, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  Loader2,
  Calendar
} from "lucide-react";
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
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  provider: string;
  provider_reference: string | null;
  created_at: string;
  applications: {
    programs: {
      title: string;
    };
  };
  receipts: {
    id: string;
    receipt_number: string;
  }[];
}

const PaymentHistory = () => {
  const { user, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', user?.id, role],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select(`
          *,
          applications!inner(
            programs(title)
          ),
          receipts(id, receipt_number)
        `)
        .order("created_at", { ascending: false });

      // If trainee, only show their own payments
      if (role === 'trainee') {
        query = query.eq("trainee_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = payment.applications?.programs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.provider_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesType = typeFilter === "all" || payment.payment_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="approved">Completed</Badge>;
      case 'pending': return <Badge variant="pending">Pending</Badge>;
      case 'failed': return <Badge variant="rejected">Failed</Badge>;
      case 'refunded': return <Badge variant="outline">Refunded</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleDownloadReceipt = async (receiptNumber: string) => {
    // For now, generate a simple receipt - in production this would fetch a PDF
    const receipt = filteredPayments.find(p => p.receipts?.[0]?.receipt_number === receiptNumber);
    if (!receipt) return;

    const receiptContent = `
PAYMENT RECEIPT
================
Receipt Number: ${receiptNumber}
Date: ${format(new Date(receipt.created_at), 'PPP')}

Program: ${receipt.applications?.programs?.title}
Payment Type: ${receipt.payment_type === 'application_fee' ? 'Application Fee' : 'Registration Fee'}
Amount: ₦${receipt.amount.toLocaleString()}
Status: ${receipt.status.toUpperCase()}
Provider: ${receipt.provider.toUpperCase()}
Reference: ${receipt.provider_reference || 'N/A'}

Thank you for your payment!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const dashboardRole = role === 'trainee' ? 'trainee' : 
                        role === 'super_admin' ? 'super-admin' : 
                        role === 'instructor' ? 'instructor' : 'admin';

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Payment History">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole} 
      title="Payment History" 
      subtitle="View all your transactions and download receipts"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{totalPayments}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receipts Available</p>
                <p className="text-2xl font-bold">
                  {filteredPayments.filter(p => p.receipts?.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by program or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="application_fee">Application Fee</SelectItem>
                <SelectItem value="registration_fee">Registration Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "You haven't made any payments yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(payment.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.applications?.programs?.title || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.payment_type === 'application_fee' ? 'Application' : 'Registration'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₦{Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{payment.provider}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.receipts?.[0] ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.receipts[0].receipt_number)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PaymentHistory;
