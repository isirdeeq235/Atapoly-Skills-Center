import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['#0d9488', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

const AdminReports = () => {
  const { role } = useAuth();

  // Fetch all data for reports
  const { data: applications, isLoading: loadingApps } = useQuery({
    queryKey: ['report-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, programs(title)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['report-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: programs, isLoading: loadingPrograms } = useQuery({
    queryKey: ['report-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingApps || loadingPayments || loadingPrograms;

  // Process data for charts
  const getMonthlyApplicationData = () => {
    if (!applications) return [];
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    });

    applications.forEach(app => {
      const appDate = new Date(app.created_at);
      const monthData = last6Months.find(
        m => appDate >= m.start && appDate <= m.end
      );
      if (monthData) {
        if (app.status === 'pending') monthData.pending++;
        else if (app.status === 'approved') monthData.approved++;
        else if (app.status === 'rejected') monthData.rejected++;
      }
    });

    return last6Months.map(({ month, pending, approved, rejected }) => ({
      month,
      pending,
      approved,
      rejected,
    }));
  };

  const getMonthlyRevenueData = () => {
    if (!payments) return [];
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
        application: 0,
        registration: 0,
      };
    });

    payments.forEach(payment => {
      const payDate = new Date(payment.created_at);
      const monthData = last6Months.find(
        m => payDate >= m.start && payDate <= m.end
      );
      if (monthData) {
        if (payment.payment_type === 'application_fee') {
          monthData.application += payment.amount;
        } else if (payment.payment_type === 'registration_fee') {
          monthData.registration += payment.amount;
        }
      }
    });

    return last6Months.map(({ month, application, registration }) => ({
      month,
      application,
      registration,
      total: application + registration,
    }));
  };

  const getProgramEnrollmentData = () => {
    if (!programs) return [];
    
    return programs
      .filter(p => p.enrolled_count > 0)
      .slice(0, 6)
      .map(p => ({
        name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
        value: p.enrolled_count,
      }));
  };

  const getApplicationStatusData = () => {
    if (!applications) return [];
    
    const counts = {
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return [
      { name: 'Pending', value: counts.pending, color: '#f59e0b' },
      { name: 'Approved', value: counts.approved, color: '#10b981' },
      { name: 'Rejected', value: counts.rejected, color: '#ef4444' },
    ].filter(d => d.value > 0);
  };

  // Calculate summary stats
  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalApplications = applications?.length || 0;
  const totalEnrolled = programs?.reduce((sum, p) => sum + p.enrolled_count, 0) || 0;
  const pendingApplications = applications?.filter(a => a.status === 'pending').length || 0;

  const dashboardRole = role === 'super_admin' ? 'super-admin' : (role as 'admin' | 'instructor');

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Reports">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const monthlyAppData = getMonthlyApplicationData();
  const monthlyRevenueData = getMonthlyRevenueData();
  const programEnrollmentData = getProgramEnrollmentData();
  const applicationStatusData = getApplicationStatusData();

  return (
    <DashboardLayout 
      role={dashboardRole}
      title="Reports & Analytics" 
      subtitle="Insights into platform performance"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold">{totalEnrolled}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Application Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAppData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₦${(v/1000)}k`} />
                  <Tooltip 
                    formatter={(value: number) => `₦${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="application" 
                    name="Application Fees"
                    stackId="1"
                    stroke="#0d9488" 
                    fill="#0d9488" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="registration" 
                    name="Registration Fees"
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {applicationStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No application data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program Enrollment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {programEnrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programEnrollmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" name="Enrolled" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No enrollment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
