import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useEmailTemplates, useUpdateEmailTemplate, EmailTemplate } from "@/hooks/useEmailTemplates";
import { 
  Mail, 
  Save, 
  X, 
  Pencil, 
  Eye,
  Code,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  UserPlus,
  Award,
  Send
} from "lucide-react";

// Icon mapping for templates
const TEMPLATE_ICONS: Record<string, React.ComponentType<any>> = {
  welcome: UserPlus,
  application_approved: CheckCircle2,
  application_rejected: XCircle,
  payment_receipt: CreditCard,
  registration_complete: Award,
};

export default function AdminEmailTemplates() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useEmailTemplates();
  const updateTemplate = useUpdateEmailTemplate();

  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedHtml, setEditedHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');
  
  // Test email state
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditedSubject(template.subject_template);
    setEditedHtml(template.html_template);
    setShowPreview(false);
    setActiveView('code');
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        updates: {
          subject_template: editedSubject,
          html_template: editedHtml,
        },
      });
      toast({ title: "Email template updated successfully" });
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleEnabled = async (template: EmailTemplate) => {
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: { is_enabled: !template.is_enabled },
      });
      toast({
        title: template.is_enabled ? "Email template disabled" : "Email template enabled",
      });
    } catch (error: any) {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setEditedHtml(prev => prev + placeholder);
  };

  // Send test email with current template content
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !editingTemplate) return;

    setSendingTestEmail(true);
    try {
      const previewHtml = getPreviewHtml();
      const previewSubject = editedSubject
        .replace(/\{\{name\}\}/g, "John Doe")
        .replace(/\{\{program\}\}/g, "Web Development Bootcamp")
        .replace(/\{\{site_name\}\}/g, "Training Academy");

      const { data, error } = await invokeFunction('send-email', {
        to: testEmailAddress,
        subject: `[TEST] ${previewSubject}`,
        html: previewHtml,
      });

      if (error) throw error;

      toast({
        title: "Test email sent!",
        description: `Check your inbox at ${testEmailAddress}`,
      });
      setShowTestEmailDialog(false);
      setTestEmailAddress("");
    } catch (error: any) {
      toast({
        title: "Failed to send test email",
        description: error.message || "Please check SMTP configuration",
        variant: "destructive",
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Replace placeholders with sample data for preview
  const getPreviewHtml = () => {
    let html = editedHtml;
    const sampleData: Record<string, string> = {
      "{{name}}": "John Doe",
      "{{site_name}}": "Training Academy",
      "{{dashboard_url}}": "#",
      "{{year}}": new Date().getFullYear().toString(),
      "{{program}}": "Web Development Bootcamp",
      "{{registration_number}}": "TRN-2026-00123",
      "{{registration_fee}}": "50,000",
      "{{admin_notes}}": "Looking forward to seeing you!",
      "{{reference}}": "PAY-ABC123XYZ",
      "{{payment_type}}": "Registration Fee",
      "{{amount}}": "50,000",
      "{{date}}": new Date().toLocaleDateString(),
      "{{provider}}": "Paystack",
      "{{receipt_url}}": "#",
      "{{id_card_url}}": "#",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      html = html.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Remove mustache conditionals for preview
    html = html.replace(/\{\{#\w+\}\}/g, '');
    html = html.replace(/\{\{\/\w+\}\}/g, '');

    return html;
  };

  if (isLoading) {
    return (
      <DashboardLayout role="super-admin" title="Email Templates">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin" title="Email Templates" subtitle="Customize transactional email content and design">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Customize the HTML content and subject lines for system emails. Use placeholders like {"{{name}}"} for dynamic content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates?.map((template) => {
              const Icon = TEMPLATE_ICONS[template.template_key] || Mail;

              return (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    template.is_enabled ? "bg-card" : "bg-muted/50 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${template.is_enabled ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`w-5 h-5 ${template.is_enabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{template.template_name}</h4>
                          {!template.is_enabled && (
                            <Badge variant="secondary" className="text-xs">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        
                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <span className="text-xs text-muted-foreground">Subject:</span>
                          <p className="text-sm font-medium">{template.subject_template}</p>
                        </div>

                        {template.available_placeholders && template.available_placeholders.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(template.available_placeholders as string[]).map((placeholder) => (
                              <Badge key={placeholder} variant="outline" className="text-xs font-mono">
                                {placeholder}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_enabled}
                        onCheckedChange={() => handleToggleEnabled(template)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Email Template: {editingTemplate?.template_name}</DialogTitle>
            <DialogDescription>
              Customize the email subject and HTML content. Use placeholders for dynamic content.
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Label>Available Placeholders:</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(editingTemplate.available_placeholders as string[])?.map((placeholder) => (
                    <Badge
                      key={placeholder}
                      variant="outline"
                      className="text-xs font-mono cursor-pointer hover:bg-secondary"
                      onClick={() => insertPlaceholder(placeholder)}
                    >
                      {placeholder}
                    </Badge>
                  ))}
                </div>
              </div>

              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'code' | 'preview')} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-fit">
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    HTML Code
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="flex-1 overflow-hidden mt-2">
                  <Textarea
                    value={editedHtml}
                    onChange={(e) => setEditedHtml(e.target.value)}
                    placeholder="Enter HTML template..."
                    className="h-[350px] font-mono text-sm resize-none"
                  />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 overflow-hidden mt-2">
                  <div className="border rounded-lg overflow-hidden h-[350px]">
                    <iframe
                      srcDoc={getPreviewHtml()}
                      className="w-full h-full bg-white"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="secondary" 
              onClick={() => setShowTestEmailDialog(true)}
              disabled={!editedHtml}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={updateTemplate.isPending}>
                {updateTemplate.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Template
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Test Email
            </DialogTitle>
            <DialogDescription>
              Send a preview of this template to your email address. Placeholders will be replaced with sample data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Recipient Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your@email.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Sample data will be used:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Name: John Doe</li>
                <li>Program: Web Development Bootcamp</li>
                <li>Registration Number: TRN-2026-00123</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmailDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={!testEmailAddress || sendingTestEmail}
            >
              {sendingTestEmail ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
