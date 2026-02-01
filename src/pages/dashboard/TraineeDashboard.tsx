import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  CreditCard, 
  FileText, 
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  User,
  Users,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, addDays, isAfter, isBefore } from "date-fns";

const TraineeDashboard = () => {
  const { user, profile } = useAuth();

  // Fetch user's applications with program and batch details
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['trainee-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res: any = await apiFetch('/api/applications');
      return res;
    },
    enabled: !!user,
  });

  // Fetch user's payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['trainee-payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res: any = await apiFetch('/api/payments');
      return res;
    },
    enabled: !!user,
  });

  const isLoading = applicationsLoading || paymentsLoading;

  // Calculate stats
  const enrolledApplications = applications?.filter(a => a.status === 'approved' && a.registration_fee_paid) || [];
  const pendingApplications = applications?.filter(a => a.status === 'pending') || [];
  const approvedAwaitingPayment = applications?.filter(a => a.status === 'approved' && !a.registration_fee_paid) || [];
  const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const stats = [
    {
      title: "Enrolled Programs",
      value: enrolledApplications.length.toString(),
      change: enrolledApplications.length > 0 ? "Active enrollments" : "No enrollments yet",
      icon: BookOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Pending Applications",
      value: pendingApplications.length.toString(),
      change: pendingApplications.length > 0 ? "Awaiting review" : "All processed",
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Payments",
      value: `₦${totalPayments.toLocaleString()}`,
      change: payments?.length ? `${payments.length} transactions` : "No payments yet",
      icon: CreditCard,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Certificates",
      value: enrolledApplications.length.toString(),
      change: enrolledApplications.length > 0 ? "Eligible for certificate" : "Complete a program",
      icon: GraduationCap,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  // Generate upcoming schedule (mock training sessions based on enrolled programs)
  const upcomingSessions = enrolledApplications.slice(0, 3).map((app, index) => ({
    id: app.id,
    programTitle: app.programs?.title || "Training Session",
    date: format(addDays(new Date(), index * 3 + 1), "EEE, MMM d"),
    time: index % 2 === 0 ? "9:00 AM - 12:00 PM" : "2:00 PM - 5:00 PM",
    type: index % 2 === 0 ? "Practical" : "Theory",
  }));

  // Get progress for enrolled programs (simulated based on enrollment date)
  const programProgress = enrolledApplications.map((app: any) => {
    const createdDate = new Date(app.created_at);
    const daysSinceEnrollment = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.floor((daysSinceEnrollment / 90) * 100), 100); // Assuming 90 day programs
    return {
      id: app.id,
      title: app.programs?.title || "Program",
      progress,
      registrationNumber: app.registration_number,
      batchName: app.batches?.batch_name || null,
      batchStartDate: app.batches?.start_date || null,
      batchEndDate: app.batches?.end_date || null,
      status: progress >= 100 ? 'completed' : 'in-progress',
      nextSession: format(addDays(new Date(), Math.floor(Math.random() * 7) + 1), "MMM d, yyyy"),
    };
  });

  if (isLoading) {
    return (
      <DashboardLayout role="trainee" title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="trainee" 
      title="Dashboard" 
      subtitle={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Trainee'}!`}
    >
      {/* Pending Registration Fee Alert */}
      {approvedAwaitingPayment.length > 0 && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Action Required</h4>
            <p className="text-sm text-muted-foreground">
              You have {approvedAwaitingPayment.length} approved application(s) awaiting registration fee payment. 
              <Link to="/dashboard/applications" className="text-accent ml-1 hover:underline">
                Complete payment now →
              </Link>
            </p>
          </div>
        </div>
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
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
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
        {/* Enrolled Programs with Progress */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Enrollment Status</CardTitle>
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {programProgress.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Active Enrollments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Apply for a program to start your training journey.
                  </p>
                  <Link to="/dashboard/apply">
                    <Button>Browse Programs</Button>
                  </Link>
                </div>
              ) : (
                programProgress.map((program) => (
                  <div 
                    key={program.id} 
                    className="p-4 rounded-lg border border-border hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{program.title}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" />
                          {program.registrationNumber || "Pending"}
                        </p>
                        {program.batchName && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3" />
                            Cohort: {program.batchName}
                          </p>
                        )}
                        {program.batchStartDate && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(program.batchStartDate), "MMM d, yyyy")} 
                            {program.batchEndDate && ` - ${format(new Date(program.batchEndDate), "MMM d, yyyy")}`}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Next: {program.nextSession}
                        </p>
                      </div>
                      <Badge variant={program.status === "completed" ? "approved" : "pending"}>
                        {program.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} className="h-2" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No upcoming sessions. Enroll in a program to see your schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{session.programTitle}</h4>
                      <Badge variant="outline" className="text-xs">
                        {session.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {session.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {session.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications?.slice(0, 4).map((app) => (
                <div key={app.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    app.status === 'approved' ? 'bg-success/10' : 
                    app.status === 'rejected' ? 'bg-destructive/10' : 'bg-warning/10'
                  }`}>
                    {app.status === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : app.status === 'rejected' ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      Application for {app.programs?.title} - 
                      <span className={`ml-1 font-medium ${
                        app.status === 'approved' ? 'text-success' : 
                        app.status === 'rejected' ? 'text-destructive' : 'text-warning'
                      }`}>
                        {app.status}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
              {(!applications || applications.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/dashboard/apply">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <FileText className="w-6 h-6 text-accent" />
                  <span>New Application</span>
                </Button>
              </Link>
              <Link to="/dashboard/payments">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <CreditCard className="w-6 h-6 text-accent" />
                  <span>View Payments</span>
                </Button>
              </Link>
              <Link to="/dashboard/id-card">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  <span>My ID Card</span>
                </Button>
              </Link>
              <Link to="/dashboard/certificates">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <Award className="w-6 h-6 text-accent" />
                  <span>Certificates</span>
                </Button>
              </Link>
              <Link to="/dashboard/profile">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <User className="w-6 h-6 text-accent" />
                  <span>My Profile</span>
                </Button>
              </Link>
              <Link to="/dashboard/notifications">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <AlertCircle className="w-6 h-6 text-accent" />
                  <span>Notifications</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
