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
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    title: "Total Trainees",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Pending Applications",
    value: "28",
    change: "-5%",
    trend: "down",
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Revenue This Month",
    value: "₦2.4M",
    change: "+18%",
    trend: "up",
    icon: CreditCard,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Active Programs",
    value: "15",
    change: "+2",
    trend: "up",
    icon: BookOpen,
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

const recentApplications = [
  {
    id: "APP-001",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    program: "Full Stack Development",
    status: "pending",
    date: "Jan 15, 2026",
  },
  {
    id: "APP-002",
    name: "Michael Chen",
    email: "michael@example.com",
    program: "Data Science",
    status: "approved",
    date: "Jan 14, 2026",
  },
  {
    id: "APP-003",
    name: "Emily Davis",
    email: "emily@example.com",
    program: "Project Management",
    status: "pending",
    date: "Jan 14, 2026",
  },
  {
    id: "APP-004",
    name: "James Wilson",
    email: "james@example.com",
    program: "UI/UX Design",
    status: "rejected",
    date: "Jan 13, 2026",
  },
  {
    id: "APP-005",
    name: "Lisa Brown",
    email: "lisa@example.com",
    program: "Digital Marketing",
    status: "approved",
    date: "Jan 12, 2026",
  },
];

const recentPayments = [
  {
    id: "PAY-001",
    trainee: "Sarah Johnson",
    amount: "₦75,000",
    type: "Registration Fee",
    status: "completed",
    date: "Jan 15, 2026",
  },
  {
    id: "PAY-002",
    trainee: "Michael Chen",
    amount: "₦25,000",
    type: "Application Fee",
    status: "completed",
    date: "Jan 14, 2026",
  },
  {
    id: "PAY-003",
    trainee: "Emily Davis",
    amount: "₦75,000",
    type: "Registration Fee",
    status: "pending",
    date: "Jan 14, 2026",
  },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout 
      role="admin" 
      title="Admin Dashboard" 
      subtitle="Overview of platform activity"
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
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-xs ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
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
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
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
                  {recentApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{app.name}</p>
                          <p className="text-sm text-muted-foreground">{app.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{app.program}</TableCell>
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
                      <TableCell className="text-muted-foreground">{app.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Link to="/dashboard/payments">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-start justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">{payment.trainee}</p>
                    <p className="text-sm text-muted-foreground">{payment.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{payment.amount}</p>
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
            <Link to="/dashboard/applications">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <FileText className="w-6 h-6 text-accent" />
                <span>Review Applications</span>
              </Button>
            </Link>
            <Link to="/dashboard/programs/new">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <BookOpen className="w-6 h-6 text-accent" />
                <span>Create Program</span>
              </Button>
            </Link>
            <Link to="/dashboard/users">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Users className="w-6 h-6 text-accent" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link to="/dashboard/reports">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <TrendingUp className="w-6 h-6 text-accent" />
                <span>View Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;
