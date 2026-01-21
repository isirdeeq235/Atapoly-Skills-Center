import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  CreditCard, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Shield,
  Settings,
  Palette,
  Layout
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAdminPaymentSync } from "@/hooks/usePaymentSync";

const AdminDashboard = () => {
  const { role, profile } = useAuth();
  const location = useLocation();
  const isSuperAdmin = role === 'super_admin';
  
  // Enable real-time sync for admin dashboard
  useAdminPaymentSync();

  // Show access denied toast if redirected from a restricted page
  useEffect(() => {
    if (location.state?.accessDenied) {
      toast.error("Access Denied", {
        description: "You don't have permission to access that feature. Contact your Super Admin.",
      });
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch real stats from database
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get total trainees
      const { count: traineesCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'trainee');

      // Get pending applications (only submitted ones awaiting review)
      const { count: pendingCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('submitted', true)
        .eq('application_fee_paid', true);

      // Get total revenue (completed payments)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Get active programs
      const { count: activePrograms } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      return {
        trainees: traineesCount || 0,
        pending: pendingCount || 0,
        revenue: totalRevenue,
        programs: activePrograms || 0
      };
    }
  });

  // Fetch recent applications (only submitted ones)
  const { data: recentApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['admin-recent-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          submitted_at,
          submitted,
          profiles!applications_trainee_id_fkey(full_name, email),
          programs(title)
        `)
        .eq('submitted', true)
        .eq('application_fee_paid', true)
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  // Fetch recent payments
  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-recent-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_type,
          status,
          created_at,
          profiles!payments_trainee_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const stats = [
    {
      title: "Total Trainees",
      value: statsData?.trainees?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Pending Applications",
      value: statsData?.pending?.toString() || "0",
      change: statsData?.pending ? `${statsData.pending} awaiting` : "None",
      trend: "neutral",
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(statsData?.revenue || 0),
      change: "+18%",
      trend: "up",
      icon: CreditCard,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Active Programs",
      value: statsData?.programs?.toString() || "0",
      change: `${statsData?.programs || 0} published`,
      trend: "up",
      icon: BookOpen,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const isLoading = statsLoading || applicationsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <DashboardLayout 
        role={isSuperAdmin ? "super-admin" : "admin"} 
        title="Admin Dashboard"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={isSuperAdmin ? "super-admin" : "admin"} 
      title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Admin'}`}
      subtitle={isSuperAdmin ? "Super Admin - Full platform control" : "Overview of platform activity"}
    >
      {/* Super Admin God Mode Banner */}
      {isSuperAdmin && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">God Mode Active</h3>
                  <p className="text-sm text-muted-foreground">Full administrative control over all platform features</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/admin/theme">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Palette className="w-4 h-4" />
                    Theme
                  </Button>
                </Link>
                <Link to="/admin/homepage">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Layout className="w-4 h-4" />
                    Homepage
                  </Button>
                </Link>
                <Link to="/admin/settings">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : stat.trend === "down" ? (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    ) : null}
                    <span className={`text-xs ${stat.trend === "up" ? "text-success" : stat.trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link to="/admin/applications">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!recentApplications || recentApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No applications yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentApplications.map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{app.profiles?.full_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{app.profiles?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{app.programs?.title || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              app.status === "approved" ? "approved" : 
                              app.status === "rejected" ? "rejected" : "pending"
                            }
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {app.submitted_at 
                            ? format(new Date(app.submitted_at), 'MMM d, yyyy')
                            : format(new Date(app.created_at), 'MMM d, yyyy')
                          }
                        </TableCell>
                        <TableCell>
                          <Link to="/admin/applications">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Link to="/admin/payments">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!recentPayments || recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-start justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{payment.profiles?.full_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_type === 'application_fee' ? 'Application Fee' : 'Registration Fee'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(payment.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₦{Number(payment.amount).toLocaleString()}</p>
                      <Badge 
                        variant={payment.status === "completed" ? "approved" : "pending"}
                        className="mt-1"
                      >
                        {payment.status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/applications">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <FileText className="w-6 h-6 text-accent" />
                <span>Review Applications</span>
              </Button>
            </Link>
            <Link to="/admin/programs">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <BookOpen className="w-6 h-6 text-accent" />
                <span>Manage Programs</span>
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Users className="w-6 h-6 text-accent" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <TrendingUp className="w-6 h-6 text-accent" />
                <span>View Reports</span>
              </Button>
            </Link>
          </div>

          {/* Super Admin Only Actions */}
          {isSuperAdmin && (
            <>
              <div className="border-t border-border mt-6 pt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Super Admin Tools</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Link to="/admin/theme">
                    <Button variant="outline" className="w-full h-20 flex-col gap-1.5 text-sm">
                      <Palette className="w-5 h-5 text-primary" />
                      <span>Theme</span>
                    </Button>
                  </Link>
                  <Link to="/admin/homepage">
                    <Button variant="outline" className="w-full h-20 flex-col gap-1.5 text-sm">
                      <Layout className="w-5 h-5 text-primary" />
                      <span>Homepage</span>
                    </Button>
                  </Link>
                  <Link to="/admin/templates">
                    <Button variant="outline" className="w-full h-20 flex-col gap-1.5 text-sm">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Templates</span>
                    </Button>
                  </Link>
                  <Link to="/admin/form-builder">
                    <Button variant="outline" className="w-full h-20 flex-col gap-1.5 text-sm">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span>Form Builder</span>
                    </Button>
                  </Link>
                  <Link to="/admin/email-templates">
                    <Button variant="outline" className="w-full h-20 flex-col gap-1.5 text-sm">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Emails</span>
                    </Button>
                  </Link>
                  <Link to="/admin/settings">
                    <Button variant="outline" className="w-full h-20 flex-col gap-1.5 text-sm">
                      <Settings className="w-5 h-5 text-primary" />
                      <span>Settings</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;
