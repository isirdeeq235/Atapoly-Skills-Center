import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  Loader2,
  GraduationCap,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface AssignedProgram {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  status: string;
  enrolled_count: number;
  max_capacity: number | null;
  created_at: string;
}

const InstructorDashboard = () => {
  const { user, profile } = useAuth();

  // Fetch programs assigned to this instructor
  const { data: assignedPrograms, isLoading } = useQuery({
    queryKey: ['instructor-programs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("instructor_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssignedProgram[];
    },
    enabled: !!user,
  });

  // Get enrolled trainees count
  const { data: traineesCount } = useQuery({
    queryKey: ['instructor-trainees-count', user?.id],
    queryFn: async () => {
      if (!assignedPrograms?.length) return 0;
      
      const programIds = assignedPrograms.map(p => p.id);
      const { count, error } = await supabase
        .from("applications")
        .select("*", { count: 'exact', head: true })
        .in("program_id", programIds)
        .eq("status", "approved")
        .eq("registration_fee_paid", true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!assignedPrograms?.length,
  });

  const stats = {
    assignedPrograms: assignedPrograms?.length || 0,
    publishedPrograms: assignedPrograms?.filter(p => p.status === 'published').length || 0,
    totalTrainees: traineesCount || 0,
    totalEnrolled: assignedPrograms?.reduce((sum, p) => sum + p.enrolled_count, 0) || 0,
  };

  if (isLoading) {
    return (
      <DashboardLayout role="instructor" title="Instructor Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="instructor" 
      title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Instructor'}`}
      subtitle="Manage your assigned programs and trainees"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned Programs</p>
                <p className="text-3xl font-bold">{stats.assignedPrograms}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-3xl font-bold">{stats.publishedPrograms}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trainees</p>
                <p className="text-3xl font-bold">{stats.totalTrainees}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-3xl font-bold">{stats.totalEnrolled}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Programs */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            My Assigned Programs
          </CardTitle>
          <Link to="/admin/programs">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!assignedPrograms || assignedPrograms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Programs Assigned</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any programs assigned yet. Contact an administrator to get programs assigned to you.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedPrograms.map((program) => (
                <Card key={program.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{program.title}</h4>
                      <Badge variant={program.status === 'published' ? 'approved' : 'pending'}>
                        {program.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {program.description || "No description available"}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration || 'Duration not set'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {program.enrolled_count} enrolled
                          {program.max_capacity && ` / ${program.max_capacity} max`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Created {format(new Date(program.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/admin/programs">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <BookOpen className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">View Programs</p>
                  <p className="text-xs text-muted-foreground">See all assigned programs</p>
                </div>
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <TrendingUp className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">View Reports</p>
                  <p className="text-xs text-muted-foreground">Analytics & insights</p>
                </div>
              </Button>
            </Link>
            <Link to="/admin/profile">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">My Profile</p>
                  <p className="text-xs text-muted-foreground">Update your information</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
