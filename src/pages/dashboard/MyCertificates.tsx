import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { 
  Award, 
  Download, 
  Loader2, 
  GraduationCap,
  Calendar,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  application: {
    id: string;
    registration_number: string;
    completed_at: string;
  };
  program: {
    id: string;
    title: string;
    duration: string;
  };
  batch?: {
    id: string;
    batch_name: string;
    start_date: string;
    end_date: string;
  };
}

const MyCertificates = () => {
  const { user } = useAuth();
  const { data: siteConfig } = useSiteConfig();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          issued_at,
          application:applications!certificates_application_id_fkey (
            id,
            registration_number,
            completed_at
          ),
          program:programs!certificates_program_id_fkey (
            id,
            title,
            duration
          ),
          batch:batches!certificates_batch_id_fkey (
            id,
            batch_name,
            start_date,
            end_date
          )
        `)
        .eq('trainee_id', user?.id)
        .order('issued_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Certificate[];
    },
    enabled: !!user?.id,
  });

  const handleDownload = async (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setDownloadingId(certificate.id);
    
    // Wait for the certificate to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      if (!certificateRef.current) return;
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${certificate.certificate_number}.pdf`);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to download certificate");
    } finally {
      setDownloadingId(null);
      setSelectedCertificate(null);
    }
  };

  return (
    <DashboardLayout role="trainee" title="My Certificates" subtitle="View and download your completion certificates">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View and download your program completion certificates
          </p>
        </div>

        {/* Certificates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{cert.program?.title}</h3>
                        <p className="text-white/70 text-sm">{cert.certificate_number}</p>
                      </div>
                    </div>
                    <Badge variant="approved" className="bg-accent text-accent-foreground">
                      Certified
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Issued Date</p>
                      <p className="font-medium">{format(new Date(cert.issued_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{cert.program?.duration || 'N/A'}</p>
                    </div>
                    {cert.batch && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Batch</p>
                          <p className="font-medium">{cert.batch.batch_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completion</p>
                          <p className="font-medium">
                            {cert.batch.end_date ? format(new Date(cert.batch.end_date), 'MMM yyyy') : 'N/A'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleDownload(cert)}
                    disabled={downloadingId === cert.id}
                  >
                    {downloadingId === cert.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You'll receive certificates here once you complete your enrolled programs.
                Keep learning and achieve your goals!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden Certificate Template for PDF Generation */}
      {selectedCertificate && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <div 
            ref={certificateRef}
            className="w-[1122px] h-[794px] bg-white relative overflow-hidden"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {/* Decorative Border */}
            <div className="absolute inset-4 border-4 border-primary/30 rounded-lg" />
            <div className="absolute inset-6 border-2 border-accent/40 rounded-lg" />
            
            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-20 h-20 border-t-4 border-l-4 border-accent rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-20 h-20 border-t-4 border-r-4 border-accent rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-20 h-20 border-b-4 border-l-4 border-accent rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-b-4 border-r-4 border-accent rounded-br-lg" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-16">
              {/* Logo */}
              <div className="mb-4">
                {siteConfig?.logo_url ? (
                  <img src={siteConfig.logo_url} alt="Logo" className="h-20 w-auto" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              
              {/* Organization Name */}
              <h1 className="text-3xl font-bold text-primary mb-2">
                {siteConfig?.site_name || 'Training Academy'}
              </h1>
              
              {/* Certificate Title */}
              <div className="mb-6">
                <h2 className="text-5xl font-bold text-primary tracking-wide">
                  CERTIFICATE
                </h2>
                <p className="text-center text-xl text-muted-foreground mt-1">OF COMPLETION</p>
              </div>
              
              {/* Decorative Line */}
              <div className="w-48 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-6" />
              
              {/* Presented To */}
              <p className="text-lg text-muted-foreground mb-2">This is to certify that</p>
              
              {/* Trainee Name */}
              <h3 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {profile?.full_name || 'Trainee Name'}
              </h3>
              
              {/* Decorative Line */}
              <div className="w-80 h-0.5 bg-primary/30 mb-4" />
              
              {/* Program Details */}
              <p className="text-lg text-muted-foreground mb-1">has successfully completed the</p>
              <h4 className="text-2xl font-bold text-primary mb-4">
                {selectedCertificate.program?.title}
              </h4>
              
              {/* Batch Info */}
              {selectedCertificate.batch && (
                <p className="text-muted-foreground mb-4">
                  Batch: {selectedCertificate.batch.batch_name} 
                  {selectedCertificate.batch.end_date && ` (${format(new Date(selectedCertificate.batch.end_date), 'MMMM yyyy')})`}
                </p>
              )}
              
              {/* Certificate Details */}
              <div className="flex items-center gap-8 mt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Certificate No.</p>
                  <p className="font-bold text-foreground">{selectedCertificate.certificate_number}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-bold text-foreground">
                    {format(new Date(selectedCertificate.issued_at), 'MMMM dd, yyyy')}
                  </p>
                </div>
                {selectedCertificate.application?.registration_number && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Registration No.</p>
                    <p className="font-bold text-foreground">{selectedCertificate.application.registration_number}</p>
                  </div>
                )}
              </div>
              
              {/* Signature Section */}
              <div className="mt-12 flex items-end gap-24">
                <div className="text-center">
                  {siteConfig?.certificate_signature_url ? (
                    <img 
                      src={siteConfig.certificate_signature_url} 
                      alt="Signature" 
                      className="h-16 mb-2 mx-auto"
                    />
                  ) : (
                    <div className="h-16 w-32 border-b-2 border-foreground mb-2" />
                  )}
                  <p className="text-sm font-medium text-foreground">Authorized Signature</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-accent/50 flex items-center justify-center mb-2 mx-auto">
                    <Award className="w-10 h-10 text-accent" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Official Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyCertificates;
