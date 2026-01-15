import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CreditCard, 
  FileText, 
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Enrolled Programs",
    value: "3",
    change: "+1 this month",
    icon: BookOpen,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Pending Applications",
    value: "1",
    change: "Awaiting review",
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Total Payments",
    value: "₦125,000",
    change: "All fees paid",
    icon: CreditCard,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Certificates",
    value: "2",
    change: "Download available",
    icon: GraduationCap,
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

const enrolledPrograms = [
  {
    id: 1,
    title: "Full Stack Web Development",
    progress: 65,
    nextSession: "Jan 20, 2026",
    status: "in-progress",
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    progress: 30,
    nextSession: "Jan 18, 2026",
    status: "in-progress",
  },
  {
    id: 3,
    title: "Project Management Essentials",
    progress: 100,
    nextSession: "Completed",
    status: "completed",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "payment",
    message: "Payment received for Web Development course",
    time: "2 hours ago",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  {
    id: 2,
    type: "application",
    message: "Application submitted for AI & Machine Learning",
    time: "1 day ago",
    icon: FileText,
    iconColor: "text-info",
  },
  {
    id: 3,
    type: "reminder",
    message: "Upcoming session: Full Stack Web Development",
    time: "2 days ago",
    icon: Clock,
    iconColor: "text-warning",
  },
];

const TraineeDashboard = () => {
  return (
    <DashboardLayout 
      role="trainee" 
      title="Dashboard" 
      subtitle="Welcome back, John!"
    >
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
        {/* Enrolled Programs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Programs</CardTitle>
              <Link to="/dashboard/programs">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledPrograms.map((program) => (
                <div 
                  key={program.id} 
                  className="p-4 rounded-lg border border-border hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{program.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {program.nextSession}
                      </p>
                    </div>
                    <Badge variant={program.status === "completed" ? "completed" : "active"}>
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
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
            <Link to="/dashboard/applications/new">
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
            <Link to="/dashboard/programs">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <BookOpen className="w-6 h-6 text-accent" />
                <span>Browse Programs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
