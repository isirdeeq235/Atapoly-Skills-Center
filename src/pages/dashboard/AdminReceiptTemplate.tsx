import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invokeFunction } from "@/lib/functionsClient";
import { 
  Receipt, 
  Save, 
  Loader2, 
  Mail, 
  FileText, 
  Palette,
  Eye,
  Code,
  Send
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ReceiptTemplate {
  id: string;
  header_text: string;
  organization_name: string;
  footer_text: string;
  show_logo: boolean;
  primary_color: string;
  secondary_color: string;
  include_qr_code: boolean;
  email_subject_template: string;
  email_body_template: string;
  send_email_on_verification: boolean;
}

const PLACEHOLDERS = [
  { key: "{{name}}", description: "Trainee's full name" },
  { key: "{{email}}", description: "Trainee's email" },
  { key: "{{payment_type}}", description: "Application Fee / Registration Fee" },
  { key: "{{amount}}", description: "Payment amount" },
  { key: "{{receipt_number}}", description: "Receipt number" },
  { key: "{{program}}", description: "Program title" },
  { key: "{{provider}}", description: "Payment provider (Paystack/Flutterwave)" },
  { key: "{{reference}}", description: "Payment reference" },
  { key: "{{date}}", description: "Payment date" },
  { key: "{{dashboard_url}}", description: "Link to payment history" },
  { key: "{{site_name}}", description: "Organization name" },
  { key: "{{year}}", description: "Current year" },
];

const AdminReceiptTemplate = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<ReceiptTemplate>>({});
  const [previewHtml, setPreviewHtml] = useState("");

  const { data: template, isLoading } = useQuery({
    queryKey: ['receipt-template'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipt_template')
        .select('*')
        .single();
      if (error) throw error;
      return data as ReceiptTemplate;
    },
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
      updatePreview(template.email_body_template);
    }
  }, [template]);

  const updatePreview = (html: string) => {
    const sampleData: Record<string, string> = {
      name: "John Doe",
      email: "john@example.com",
      payment_type: "Registration Fee",
      amount: "25,000",
      receipt_number: "RCP-2026-ABC123",
      program: "GSM Repair & Maintenance",
      provider: "Paystack",
      reference: "PAY-123456789",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      dashboard_url: "#",
      site_name: formData.organization_name || "Training Center",
      year: new Date().getFullYear().toString(),
    };

    let preview = html;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    setPreviewHtml(preview);
  };

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<ReceiptTemplate>) => {
      const { data, error } = await supabase
        .from('receipt_template')
        .update(updates)
        .eq('id', template?.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt-template'] });
      toast.success("Receipt template saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save template: " + error.message);
    },
  });

  const sendTestEmail = async () => {
    if (!profile?.email) {
      toast.error("No email address found for your profile");
      return;
    }

    try {
      toast.loading("Sending test email...", { id: "test-email" });
      
      
      const { data, error } = await invokeFunction("send-email", {
        to: profile.email,
        subject: formData.email_subject_template?.replace("{{payment_type}}", "Registration Fee") || "Test Receipt",
        html: previewHtml,
      });

      if (error) throw error;

      if (error) throw error;
      toast.success("Test email sent to " + profile.email, { id: "test-email" });
    } catch (error: any) {
      toast.error("Failed to send test email: " + error.message, { id: "test-email" });
    }
  };

  const handleSave = () => {
    if (!formData) return;
    updateMutation.mutate(formData);
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.email_body_template || "";
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData(prev => ({ ...prev, email_body_template: newText }));
      updatePreview(newText);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="super-admin" title="Receipt Template">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="super-admin" 
      title="Receipt Template" 
      subtitle="Customize payment receipt emails and PDF appearance"
    >
      <div className="space-y-6">
        {/* Settings Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Payment Receipt Configuration</CardTitle>
                  <CardDescription>Configure receipt appearance and email notifications</CardDescription>
                </div>
              </div>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={formData.organization_name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                    placeholder="Training Center"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Receipt Header</Label>
                  <Input
                    value={formData.header_text || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, header_text: e.target.value }))}
                    placeholder="PAYMENT RECEIPT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input
                    value={formData.footer_text || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
                    placeholder="Thank you for your payment!"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Logo</Label>
                  <Switch
                    checked={formData.show_logo || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_logo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Include QR Code</Label>
                  <Switch
                    checked={formData.include_qr_code || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_qr_code: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Email on Verification</Label>
                    <p className="text-xs text-muted-foreground">Auto-send receipt when payment is verified</p>
                  </div>
                  <Switch
                    checked={formData.send_email_on_verification || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_email_on_verification: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    value={formData.email_subject_template || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, email_subject_template: e.target.value }))}
                    placeholder="Payment Receipt - {{payment_type}}"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={sendTestEmail}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Colors (PDF)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color (HSL)</Label>
                  <Input
                    value={formData.primary_color || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="24 96% 45%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color (HSL)</Label>
                  <Input
                    value={formData.secondary_color || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="160 84% 39%"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Template Editor */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
                <CardDescription>
                  Customize the HTML email sent to trainees after payment verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Placeholders */}
                <div className="flex flex-wrap gap-2">
                  {PLACEHOLDERS.map((p) => (
                    <Badge 
                      key={p.key}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => insertPlaceholder(p.key)}
                      title={p.description}
                    >
                      {p.key}
                    </Badge>
                  ))}
                </div>

                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code">
                      <Code className="w-4 h-4 mr-2" />
                      HTML Code
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="code" className="mt-4">
                    <Textarea
                      id="email-body"
                      value={formData.email_body_template || ""}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, email_body_template: e.target.value }));
                        updatePreview(e.target.value);
                      }}
                      className="font-mono text-sm min-h-[500px]"
                      placeholder="Enter HTML template..."
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-lg bg-muted/30 min-h-[500px] overflow-auto">
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full h-[500px] border-0"
                        title="Email Preview"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReceiptTemplate;
