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
import { useToast } from "@/hooks/use-toast";
import { useNotificationTemplates, useUpdateNotificationTemplate, NotificationTemplate } from "@/hooks/useTemplates";
import { 
  Bell, 
  Mail, 
  Save, 
  X, 
  Pencil, 
  Info, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  FileText, 
  Award,
  Loader2
} from "lucide-react";

// Template key metadata for display
const TEMPLATE_META: Record<string, { label: string; description: string; icon: React.ComponentType<any>; placeholders: string[] }> = {
  application_submitted: {
    label: "Application Submitted",
    description: "Sent when a trainee submits a new application",
    icon: FileText,
    placeholders: ["{{program_title}}", "{{trainee_name}}"],
  },
  application_approved: {
    label: "Application Approved",
    description: "Sent when an admin approves an application",
    icon: CheckCircle2,
    placeholders: ["{{program_title}}", "{{trainee_name}}", "{{registration_fee}}", "{{admin_notes}}"],
  },
  application_rejected: {
    label: "Application Rejected",
    description: "Sent when an admin rejects an application",
    icon: XCircle,
    placeholders: ["{{program_title}}", "{{trainee_name}}", "{{reason}}", "{{admin_notes}}"],
  },
  payment_received: {
    label: "Payment Received",
    description: "Sent when a payment is successfully processed",
    icon: CreditCard,
    placeholders: ["{{amount}}", "{{payment_type}}", "{{program_title}}", "{{reference}}"],
  },
  registration_complete: {
    label: "Registration Complete",
    description: "Sent when trainee completes full registration",
    icon: Award,
    placeholders: ["{{program_title}}", "{{trainee_name}}", "{{registration_number}}"],
  },
  certificate_issued: {
    label: "Certificate Issued",
    description: "Sent when a certificate is issued to a trainee",
    icon: Award,
    placeholders: ["{{program_title}}", "{{trainee_name}}", "{{certificate_number}}"],
  },
};

export default function AdminNotificationTemplates() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useNotificationTemplates();
  const updateTemplate = useUpdateNotificationTemplate();

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedMessage, setEditedMessage] = useState("");

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setEditedTitle(template.title_template);
    setEditedMessage(template.message_template);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        updates: {
          title_template: editedTitle,
          message_template: editedMessage,
        },
      });
      toast({ title: "Template updated successfully" });
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleEnabled = async (template: NotificationTemplate) => {
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: { is_enabled: !template.is_enabled },
      });
      toast({
        title: template.is_enabled ? "Notification disabled" : "Notification enabled",
      });
    } catch (error: any) {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMeta = (key: string) => TEMPLATE_META[key] || {
    label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    description: "Custom notification template",
    icon: Bell,
    placeholders: [],
  };

  if (isLoading) {
    return (
      <DashboardLayout role="super-admin" title="Notification Templates">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin" title="Notification Templates" subtitle="Customize in-app notifications and email content">
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            In-App Notifications
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Customize the title and message content for in-app notifications. Use placeholders like {"{{program_title}}"} to insert dynamic content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates?.map((template) => {
                const meta = getMeta(template.template_key);
                const Icon = meta.icon;

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
                            <h4 className="font-medium">{meta.label}</h4>
                            {!template.is_enabled && (
                              <Badge variant="secondary" className="text-xs">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{meta.description}</p>
                          
                          <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
                            <div>
                              <span className="text-xs text-muted-foreground">Title:</span>
                              <p className="text-sm font-medium">{template.title_template}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Message:</span>
                              <p className="text-sm">{template.message_template}</p>
                            </div>
                          </div>

                          {meta.placeholders.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {meta.placeholders.map((placeholder) => (
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
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Email templates are currently managed in the backend. Contact your developer to customize email designs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Email Template Configuration</p>
                  <p className="text-muted-foreground mt-1">
                    Email templates include rich HTML formatting and are configured in the backend edge functions.
                    The following email types are available:
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• <strong>Welcome Email</strong> - Sent on new user registration</li>
                    <li>• <strong>Application Approved</strong> - Sent when application is approved</li>
                    <li>• <strong>Application Rejected</strong> - Sent when application is rejected</li>
                    <li>• <strong>Payment Receipt</strong> - Sent after successful payment</li>
                    <li>• <strong>Registration Complete</strong> - Sent with trainee ID after full enrollment</li>
                  </ul>
                  <p className="mt-2 text-muted-foreground">
                    To customize email templates, edit the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">supabase/functions/send-email/index.ts</code> file.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notification Template</DialogTitle>
            <DialogDescription>
              Customize the notification title and message. Use placeholders for dynamic content.
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Key</Label>
                <Input value={editingTemplate.template_key} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter notification title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Notification Message</Label>
                <Textarea
                  id="message"
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={4}
                />
              </div>

              {getMeta(editingTemplate.template_key).placeholders.length > 0 && (
                <div className="space-y-2">
                  <Label>Available Placeholders</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {getMeta(editingTemplate.template_key).placeholders.map((placeholder) => (
                      <Badge
                        key={placeholder}
                        variant="outline"
                        className="text-xs font-mono cursor-pointer hover:bg-secondary"
                        onClick={() => {
                          setEditedMessage(prev => prev + " " + placeholder);
                        }}
                      >
                        {placeholder}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Click a placeholder to add it to the message</p>
                </div>
              )}

              <div className="bg-secondary/50 p-3 rounded-lg">
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-sm">{editedTitle || "Notification Title"}</p>
                  <p className="text-sm text-muted-foreground">{editedMessage || "Notification message..."}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
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
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
