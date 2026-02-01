import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  History, 
  Loader2, 
  Search,
  Download,
  ArrowRight,
  Clock,
  User,
  FileText,
  CreditCard,
  RefreshCw
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
import { toast } from "sonner";

interface StatusHistoryEntry {
  id: string;
  application_id: string;
  trainee_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  change_type: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  applications: {
    programs: {
      title: string;
    };
  } | null;
}

const AdminStatusHistory = () => {
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: history, isLoading } = useQuery({
    queryKey: ['status-history-admin'],
    queryFn: async () => {
      const res: any = await apiFetch('/api/status-history/admin?limit=500');
      return res as StatusHistoryEntry[];
    },
  });

  const filteredHistory = history?.filter(entry => {
    const matchesSearch = 
      entry.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.applications?.programs?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || entry.change_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <FileText className="w-4 h-4" />;
      case 'payment_update': return <CreditCard className="w-4 h-4" />;
      case 'submission': return <FileText className="w-4 h-4" />;
      case 'resubmission': return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      status_change: "bg-blue-500/10 text-blue-600 border-blue-200",
      payment_update: "bg-green-500/10 text-green-600 border-green-200",
      submission: "bg-purple-500/10 text-purple-600 border-purple-200",
      resubmission: "bg-orange-500/10 text-orange-600 border-orange-200",
    };
    
    const labels: Record<string, string> = {
      status_change: "Status Change",
      payment_update: "Payment",
      submission: "Submission",
      resubmission: "Resubmission",
    };
    
    return (
      <Badge variant="outline" className={styles[type] || "bg-gray-500/10 text-gray-600"}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      approved: "bg-green-500/10 text-green-600 border-green-200",
      rejected: "bg-red-500/10 text-red-600 border-red-200",
      submitted: "bg-blue-500/10 text-blue-600 border-blue-200",
      application_fee_paid: "bg-green-500/10 text-green-600 border-green-200",
      registration_fee_paid: "bg-green-500/10 text-green-600 border-green-200",
    };
    
    return (
      <Badge variant="outline" className={styles[status] || ""}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!filteredHistory?.length) {
      toast.error("No history to export");
      return;
    }

    const headers = ['Date', 'Trainee', 'Email', 'Program', 'Change Type', 'Previous Status', 'New Status', 'Notes'];
    const rows = filteredHistory.map(h => [
      format(new Date(h.created_at), 'yyyy-MM-dd HH:mm'),
      h.profiles?.full_name || '',
      h.profiles?.email || '',
      h.applications?.programs?.title || '',
      h.change_type,
      h.previous_status || '',
      h.new_status,
      h.notes || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `status_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success("History exported successfully");
  };

  const dashboardRole = role === 'super_admin' ? 'super-admin' : (role as 'admin' | 'instructor');

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Status History">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole}
      title="Audit Trail" 
      subtitle="Complete history of all application status changes"
    >
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
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="status_change">Status Changes</SelectItem>
                <SelectItem value="payment_update">Payment Updates</SelectItem>
                <SelectItem value="submission">Submissions</SelectItem>
                <SelectItem value="resubmission">Resubmissions</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Activity Log ({filteredHistory?.length || 0} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status Change</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{format(new Date(entry.created_at), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "h:mm a")}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entry.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{entry.profiles?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.applications?.programs?.title || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getChangeTypeIcon(entry.change_type)}
                        {getChangeTypeBadge(entry.change_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.previous_status && getStatusBadge(entry.previous_status)}
                        {entry.previous_status && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                        {getStatusBadge(entry.new_status)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.notes || '-'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredHistory || filteredHistory.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No history records found
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

export default AdminStatusHistory;