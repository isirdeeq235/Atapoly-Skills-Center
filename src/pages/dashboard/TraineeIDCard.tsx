import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, User, Award, Calendar, Hash, Building } from "lucide-react";
import { format } from "date-fns";
import { useRef } from "react";

interface EnrolledProgram {
  id: string;
  registration_number: string;
  created_at: string;
  programs: {
    id: string;
    title: string;
    duration: string;
  };
}

const TraineeIDCard = () => {
  const { user, profile } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: enrolledPrograms, isLoading } = useQuery({
    queryKey: ['enrolled-programs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          registration_number,
          created_at,
          programs(id, title, duration)
        `)
        .eq("trainee_id", user?.id)
        .eq("status", "approved")
        .eq("registration_fee_paid", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EnrolledProgram[];
    },
    enabled: !!user,
  });

  const handleDownloadPDF = async () => {
    // Use html2canvas and jspdf for PDF generation
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98], // ID card size
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
    pdf.save(`ID-Card-${profile?.full_name?.replace(/\s+/g, '-')}.pdf`);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="trainee" title="My ID Card">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const activeEnrollment = enrolledPrograms?.[0];

  if (!activeEnrollment) {
    return (
      <DashboardLayout role="trainee" title="My ID Card" subtitle="Your trainee identification card">
        <Card className="p-12 text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Enrollment</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your ID card will be available once you complete your registration and payment for a program.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainee" title="My ID Card" subtitle="Your trainee identification card">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ID Card Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div 
              ref={cardRef}
              className="relative bg-gradient-to-br from-primary via-primary to-accent rounded-2xl p-6 text-white shadow-2xl aspect-[1.586/1] max-w-md mx-auto"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />

              {/* Header */}
              <div className="relative flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider">Training Platform</p>
                  <h2 className="text-lg font-bold">TRAINEE ID CARD</h2>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Photo and Details */}
              <div className="relative flex gap-4">
                {/* Photo */}
                <div className="w-20 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{profile?.full_name}</h3>
                  <div className="space-y-1 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-white/70" />
                      <span className="font-mono">{activeEnrollment.registration_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-white/70" />
                      <span className="truncate text-xs">{activeEnrollment.programs?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-white/70" />
                      <span className="text-xs">Enrolled: {format(new Date(activeEnrollment.created_at), 'MMM yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs">
                <span className="text-white/70">Valid for program duration</span>
                <span className="font-mono text-white/70">{activeEnrollment.programs?.duration}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Button */}
        <div className="flex justify-center">
          <Button size="lg" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5 mr-2" />
            Download ID Card as PDF
          </Button>
        </div>

        {/* All Enrolled Programs */}
        {enrolledPrograms && enrolledPrograms.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">All Enrolled Programs</h3>
              <div className="space-y-3">
                {enrolledPrograms.map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div>
                      <p className="font-medium">{enrollment.programs?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Reg: {enrollment.registration_number}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(enrollment.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TraineeIDCard;
