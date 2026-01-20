import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIdCardTemplate, useUpdateIdCardTemplate, useCertificateTemplate, useUpdateCertificateTemplate } from "@/hooks/useTemplates";
import { Loader2, Save, CreditCard, Award } from "lucide-react";

const AdminTemplateEditor = () => {
  const { toast } = useToast();
  const { data: idCard, isLoading: idLoading } = useIdCardTemplate();
  const { data: certificate, isLoading: certLoading } = useCertificateTemplate();
  const updateIdCard = useUpdateIdCardTemplate();
  const updateCertificate = useUpdateCertificateTemplate();

  const [localIdCard, setLocalIdCard] = useState<any>({});
  const [localCert, setLocalCert] = useState<any>({});

  useEffect(() => { if (idCard) setLocalIdCard(idCard); }, [idCard]);
  useEffect(() => { if (certificate) setLocalCert(certificate); }, [certificate]);

  const handleSaveIdCard = async () => {
    try {
      await updateIdCard.mutateAsync(localIdCard);
      toast({ title: "ID Card template saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveCert = async () => {
    try {
      await updateCertificate.mutateAsync(localCert);
      toast({ title: "Certificate template saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (idLoading || certLoading) {
    return (
      <DashboardLayout role="super-admin" title="Template Editor" subtitle="Customize ID cards and certificates">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin" title="Template Editor" subtitle="Customize ID cards and certificates">
      <Tabs defaultValue="idcard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="idcard" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> ID Card
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-2">
            <Award className="w-4 h-4" /> Certificate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="idcard">
          <Card>
            <CardHeader>
              <CardTitle>ID Card Template</CardTitle>
              <CardDescription>Configure student ID card design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Header Text</Label>
                  <Input value={localIdCard.header_text || ''} onChange={(e) => setLocalIdCard({...localIdCard, header_text: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input value={localIdCard.footer_text || ''} onChange={(e) => setLocalIdCard({...localIdCard, footer_text: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {['show_logo', 'show_photo', 'show_qr_code', 'show_registration_number', 'show_program', 'show_batch'].map(field => (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="capitalize">{field.replace(/_/g, ' ')}</Label>
                    <Switch checked={localIdCard[field] || false} onCheckedChange={(v) => setLocalIdCard({...localIdCard, [field]: v})} />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveIdCard} disabled={updateIdCard.isPending}>
                {updateIdCard.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save ID Card Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Template</CardTitle>
              <CardDescription>Configure completion certificate design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Header Text</Label>
                  <Input value={localCert.header_text || ''} onChange={(e) => setLocalCert({...localCert, header_text: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Subheader Text</Label>
                  <Input value={localCert.subheader_text || ''} onChange={(e) => setLocalCert({...localCert, subheader_text: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Body Template</Label>
                <Textarea value={localCert.body_template || ''} onChange={(e) => setLocalCert({...localCert, body_template: e.target.value})} rows={3} placeholder="Use {{trainee_name}}, {{program_title}}, {{completion_date}}" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Signature Title</Label>
                  <Input value={localCert.signature_title || ''} onChange={(e) => setLocalCert({...localCert, signature_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={localCert.orientation} onValueChange={(v) => setLocalCert({...localCert, orientation: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscape">Landscape</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveCert} disabled={updateCertificate.isPending}>
                {updateCertificate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Certificate Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminTemplateEditor;
