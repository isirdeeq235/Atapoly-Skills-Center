import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { jsPDF } from "jspdf";
import { 
  CreditCard, 
  Download, 
  Search, 
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  Loader2,
  Calendar,
  FileText
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
  const { user, role, profile } = useAuth();
  const { data: siteConfig } = useSiteConfig();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);

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
    const payment = filteredPayments.find(p => p.receipts?.[0]?.receipt_number === receiptNumber);
    if (!payment) return;

    setDownloadingReceipt(receiptNumber);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const siteName = siteConfig?.site_name || "Training Center";
      const contactEmail = siteConfig?.contact_email || "";
      const contactPhone = siteConfig?.contact_phone || "";
      const address = siteConfig?.address || "";
      
      // Header background
      doc.setFillColor(234, 88, 12); // Primary orange color
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(siteName, pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("PAYMENT RECEIPT", pageWidth / 2, 35, { align: "center" });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Receipt details box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, 55, pageWidth - 30, 25, 3, 3, 'F');
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Receipt Number:", 20, 65);
      doc.text("Date:", 20, 73);
      
      doc.setFont("helvetica", "normal");
      doc.text(receiptNumber, 60, 65);
      doc.text(format(new Date(payment.created_at), 'MMMM d, yyyy'), 60, 73);
      
      doc.setFont("helvetica", "bold");
      doc.text("Status:", pageWidth - 70, 65);
      
      // Status badge
      if (payment.status === 'completed') {
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(pageWidth - 50, 59, 35, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("COMPLETED", pageWidth - 48, 65);
      } else {
        doc.setFillColor(234, 179, 8);
        doc.roundedRect(pageWidth - 50, 59, 35, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(payment.status.toUpperCase(), pageWidth - 48, 65);
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      // Customer info section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Customer Information", 15, 95);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 98, pageWidth - 15, 98);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${profile?.full_name || 'N/A'}`, 15, 108);
      doc.text(`Email: ${profile?.email || 'N/A'}`, 15, 116);
      
      // Payment details section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Payment Details", 15, 135);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 138, pageWidth - 15, 138);
      
      // Payment table
      const tableTop = 148;
      doc.setFillColor(249, 250, 251);
      doc.rect(15, tableTop - 6, pageWidth - 30, 10, 'F');
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 20, tableTop);
      doc.text("Amount", pageWidth - 50, tableTop);
      
      doc.setFont("helvetica", "normal");
      const programTitle = payment.applications?.programs?.title || 'Program';
      const paymentType = payment.payment_type === 'application_fee' ? 'Application Fee' : 'Registration Fee';
      
      doc.text(`${programTitle} - ${paymentType}`, 20, tableTop + 12);
      doc.text(`₦${Number(payment.amount).toLocaleString()}`, pageWidth - 50, tableTop + 12);
      
      // Total line
      doc.setDrawColor(229, 231, 235);
      doc.line(15, tableTop + 20, pageWidth - 15, tableTop + 20);
      
      doc.setFont("helvetica", "bold");
      doc.text("Total Paid:", 20, tableTop + 30);
      doc.setFontSize(12);
      doc.text(`₦${Number(payment.amount).toLocaleString()}`, pageWidth - 50, tableTop + 30);
      
      // Payment method
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Payment Method: ${payment.provider.charAt(0).toUpperCase() + payment.provider.slice(1)}`, 15, tableTop + 45);
      if (payment.provider_reference) {
        doc.text(`Reference: ${payment.provider_reference}`, 15, tableTop + 53);
      }
      
      // Footer
      doc.setFillColor(249, 250, 251);
      doc.rect(0, 260, pageWidth, 37, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text("Thank you for your payment!", pageWidth / 2, 270, { align: "center" });
      
      if (contactEmail || contactPhone) {
        doc.text(`Contact: ${contactEmail}${contactEmail && contactPhone ? ' | ' : ''}${contactPhone}`, pageWidth / 2, 278, { align: "center" });
      }
      if (address) {
        doc.text(address, pageWidth / 2, 286, { align: "center" });
      }
      
      // Save PDF
      doc.save(`Receipt-${receiptNumber}.pdf`);
    } catch (error) {
      console.error("Error generating receipt:", error);
    } finally {
      setDownloadingReceipt(null);
    }
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
                          disabled={downloadingReceipt === payment.receipts[0].receipt_number}
                        >
                          {downloadingReceipt === payment.receipts[0].receipt_number ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4 mr-1" />
                          )}
                          PDF
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
