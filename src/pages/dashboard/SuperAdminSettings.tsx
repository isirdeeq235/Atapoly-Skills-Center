import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/functionsClient";
import { 
  Settings, 
  Palette, 
  CreditCard, 
  Upload, 
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image,
  FileSignature,
  CheckCircle2,
  Receipt,
  ExternalLink,
  Send,
  AlertCircle,
  Key,
  Pencil,
  Shield,
  Wifi,
  Database,
  Plus,
  HardDrive,
  RefreshCw,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, ConnectionStatusType, ConnectionStatus } from "@/hooks/useConnectionStatus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Connection Status Item Component
function ConnectionStatusItem({ connection, icon }: { connection: ConnectionStatus; icon: React.ReactNode }) {
  const getStatusIcon = (status: ConnectionStatusType) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "not_configured":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      case "checking":
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatusType) => {
    switch (status) {
      case "connected":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Connected</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Error</Badge>;
      case "not_configured":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Not Configured</Badge>;
      case "disconnected":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Disconnected</Badge>;
      case "checking":
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Checking...</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border transition-colors",
            connection.status === "connected" && "border-success/20 bg-success/5",
            connection.status === "error" && "border-destructive/20 bg-destructive/5",
            connection.status === "not_configured" && "border-warning/20 bg-warning/5",
            connection.status === "disconnected" && "border-border bg-muted/30",
            connection.status === "checking" && "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                connection.status === "connected" && "bg-success/10 text-success",
                connection.status === "error" && "bg-destructive/10 text-destructive",
                connection.status === "not_configured" && "bg-warning/10 text-warning",
                connection.status === "disconnected" && "bg-muted text-muted-foreground",
                connection.status === "checking" && "bg-muted text-muted-foreground"
              )}>
                {icon}
              </div>
              <div>
                <p className="font-medium">{connection.name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {connection.message || "No status message"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(connection.status)}
              {getStatusIcon(connection.status)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{connection.name}</p>
            <p className="text-sm text-muted-foreground">{connection.message}</p>
            {connection.lastChecked && (
              <p className="text-xs text-muted-foreground">
                Last checked: {new Date(connection.lastChecked).toLocaleTimeString()}
              </p>
            )}
            {connection.details && (
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                {Object.entries(connection.details).map(([key, value]) => (
                  <p key={key}>{key}: {JSON.stringify(value)}</p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const SuperAdminSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { connections, isLoading: connectionsLoading, refetch: refetchConnections, overallStatus, connectedCount, totalCount } = useConnectionStatus();
  const { data: siteConfig, isLoading: siteLoading, refetch: refetchSiteConfig } = useSiteConfig();
  const { data: paymentSettings, isLoading: paymentLoading, refetch: refetchPaymentSettings } = usePaymentSettings();
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Site config state
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

  // Payment settings state - only toggles, keys are in secrets
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [flutterwaveEnabled, setFlutterwaveEnabled] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteConfig) {
      setSiteName(siteConfig.site_name || "");
      setContactEmail(siteConfig.contact_email || "");
      setContactPhone(siteConfig.contact_phone || "");
      setAddress(siteConfig.address || "");
      setMaintenanceMode(siteConfig.maintenance_mode || false);
      setLogoUrl(siteConfig.logo_url || "");
      setFaviconUrl(siteConfig.favicon_url || "");
      setSignatureUrl(siteConfig.certificate_signature_url || "");
    }
  }, [siteConfig]);

  useEffect(() => {
    if (paymentSettings) {
      setPaystackEnabled(paymentSettings.paystack_enabled || false);
      setFlutterwaveEnabled(paymentSettings.flutterwave_enabled || false);
    }
  }, [paymentSettings]);

  const handleSaveSiteConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_config")
        .upsert({
          id: siteConfig?.id || undefined,
          site_name: siteName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address,
          maintenance_mode: maintenanceMode,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          certificate_signature_url: signatureUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Site configuration has been updated successfully.",
      });
      refetchSiteConfig();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("payment_settings")
        .upsert({
          id: paymentSettings?.id || undefined,
          paystack_enabled: paystackEnabled,
          flutterwave_enabled: flutterwaveEnabled,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Payment settings saved",
        description: "Payment gateway configuration has been updated.",
      });
      refetchPaymentSettings();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!profile?.email) {
      toast({
        title: "No email found",
        description: "Your profile doesn't have an email address configured.",
        variant: "destructive",
      });
      return;
    }

    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const { data, error } = await invokeFunction("send-email", {
        to: profile.email,
        subject: `SMTP Test - ${siteName || "Training Platform"}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #10b981; margin: 0;">✓ SMTP Test Successful</h1>
                </div>
                <p style="color: #333; font-size: 16px;">Hello,</p>
                <p style="color: #666; line-height: 1.6;">This is a test email to verify your SMTP configuration is working correctly.</p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 0; color: #166534;"><strong>Configuration Status:</strong> Working ✓</p>
                  <p style="margin: 5px 0 0 0; color: #166534;">Sent at: ${new Date().toLocaleString()}</p>
                </div>
                <p style="color: #666; line-height: 1.6;">Your email system is properly configured and ready to send transactional emails.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ${siteName || "Training Platform"}. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
        },
      });

      if (error) throw error;

      setSmtpTestResult({ success: true, message: `Test email sent to ${profile.email}` });
      toast({
        title: "SMTP Test Successful",
        description: `Test email sent to ${profile.email}. Check your inbox!`,
      });
    } catch (error: any) {
      setSmtpTestResult({ success: false, message: error.message || "Failed to send test email" });
      toast({
        title: "SMTP Test Failed",
        description: error.message || "Failed to send test email. Check your SMTP configuration.",
        variant: "destructive",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "signature") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      if (type === "logo") setLogoUrl(publicUrl);
      else if (type === "favicon") setFaviconUrl(publicUrl);
      else if (type === "signature") setSignatureUrl(publicUrl);

      toast({
        title: "File uploaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (siteLoading || paymentLoading) {
    return (
      <DashboardLayout role="super-admin" title="Settings" subtitle="Manage platform configuration">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin" title="Settings" subtitle="Manage platform configuration">
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-6">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Connections Status */}
        <TabsContent value="connections">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    System Connections
                  </CardTitle>
                  <CardDescription>
                    Real-time status of all backend services and integrations
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={cn(
                      "px-3 py-1",
                      overallStatus === "connected" && "bg-success/10 text-success border-success/20",
                      overallStatus === "error" && "bg-destructive/10 text-destructive border-destructive/20",
                      overallStatus === "checking" && "bg-muted text-muted-foreground",
                      (overallStatus === "disconnected" || overallStatus === "not_configured") && "bg-warning/10 text-warning border-warning/20"
                    )}
                  >
                    {overallStatus === "connected" && <><CheckCircle2 className="w-3 h-3 mr-1" />All Systems Operational</>}
                    {overallStatus === "error" && <><AlertCircle className="w-3 h-3 mr-1" />Connection Issues</>}
                    {overallStatus === "checking" && <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Checking...</>}
                    {(overallStatus === "disconnected" || overallStatus === "not_configured") && <><AlertCircle className="w-3 h-3 mr-1" />Some Services Unavailable</>}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchConnections()}
                    disabled={connectionsLoading}
                  >
                    <RefreshCw className={cn("w-4 h-4", connectionsLoading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Items */}
              <div className="grid gap-3">
                {/* Database */}
                <ConnectionStatusItem 
                  connection={connections.database}
                  icon={<Database className="w-5 h-5" />}
                />
                
                {/* Storage */}
                <ConnectionStatusItem 
                  connection={connections.storage}
                  icon={<HardDrive className="w-5 h-5" />}
                />
                
                {/* SMTP */}
                <ConnectionStatusItem 
                  connection={connections.smtp}
                  icon={<Mail className="w-5 h-5" />}
                />
                
                {/* Paystack */}
                <ConnectionStatusItem 
                  connection={connections.paystack}
                  icon={<CreditCard className="w-5 h-5" />}
                />
                
                {/* Flutterwave */}
                <ConnectionStatusItem 
                  connection={connections.flutterwave}
                  icon={<CreditCard className="w-5 h-5" />}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  {connectedCount} of {totalCount} services connected
                </p>
                <p className="text-muted-foreground">
                  Auto-refreshes every 60 seconds
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic site information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="TrainHub"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Training Street, Lagos"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to show maintenance page to visitors
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <Button onClick={handleSaveSiteConfig} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Upload your logo, favicon, and certificate signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Logo
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="max-h-20 mx-auto mb-2" />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "logo")}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Favicon
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon" className="max-h-20 mx-auto mb-2" />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "favicon")}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <Label htmlFor="favicon-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Favicon
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>

                {/* Signature Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4" />
                    Certificate Signature
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Signature" className="max-h-20 mx-auto mb-2" />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <FileSignature className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "signature")}
                      className="hidden"
                      id="signature-upload"
                    />
                    <Label htmlFor="signature-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Signature
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSiteConfig} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Test and verify your SMTP email configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-info/10 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  SMTP credentials are securely stored in environment secrets (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL). 
                  Use the test button below to verify your configuration.
                </p>
              </div>

              {/* SMTP Test Section */}
              <div className="space-y-4 p-6 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">SMTP Test</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a test email to verify your configuration
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Test email will be sent to:</span>
                    <span className="font-medium">{profile?.email || "No email configured"}</span>
                  </div>

                  {smtpTestResult && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${
                      smtpTestResult.success 
                        ? "bg-success/10 border border-success/20" 
                        : "bg-destructive/10 border border-destructive/20"
                    }`}>
                      {smtpTestResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${smtpTestResult.success ? "text-success" : "text-destructive"}`}>
                          {smtpTestResult.success ? "Test Successful" : "Test Failed"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {smtpTestResult.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTestSmtp} 
                    disabled={testingSmtp || !profile?.email}
                    className="w-full sm:w-auto"
                  >
                    {testingSmtp ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {testingSmtp ? "Sending Test Email..." : "Send Test Email"}
                  </Button>
                </div>
              </div>

              {/* Email Templates Link */}
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Templates</h3>
                      <p className="text-sm text-muted-foreground">Customize transactional email content</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/admin/email-templates")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>
                Configure Paystack and Flutterwave payment integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-info/10 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  API keys are securely stored in environment secrets. Use the toggles below to enable or disable each payment provider.
                </p>
              </div>

              {/* Paystack */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00C3F7]/10 flex items-center justify-center">
                      <span className="font-bold text-[#00C3F7]">PS</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Paystack</h3>
                      <p className="text-sm text-muted-foreground">Accept payments via Paystack</p>
                    </div>
                  </div>
                  <Switch
                    checked={paystackEnabled}
                    onCheckedChange={setPaystackEnabled}
                  />
                </div>
                {paystackEnabled && (
                  <p className="text-xs text-success flex items-center gap-1 pt-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Paystack is enabled and API keys are configured in secrets
                  </p>
                )}
              </div>

              {/* Flutterwave */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                      <span className="font-bold text-[#F5A623]">FW</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Flutterwave</h3>
                      <p className="text-sm text-muted-foreground">Accept payments via Flutterwave</p>
                    </div>
                  </div>
                  <Switch
                    checked={flutterwaveEnabled}
                    onCheckedChange={setFlutterwaveEnabled}
                  />
                </div>
                {flutterwaveEnabled && (
                  <p className="text-xs text-success flex items-center gap-1 pt-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Flutterwave is enabled and API keys are configured in secrets
                  </p>
                )}
              </div>

              <Separator />

              {/* Receipt Template Link */}
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Receipt Template</h3>
                      <p className="text-sm text-muted-foreground">Customize payment receipt emails and PDF appearance</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/admin/receipt-template")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>

              <Button onClick={handleSavePaymentSettings} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Management */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                API Keys & Secrets
              </CardTitle>
              <CardDescription>
                View and manage all API keys and secrets configured in your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Security Notice</p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      Secret values are encrypted and cannot be displayed. You can only update or add new secrets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment API Keys */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Gateway Keys
                </h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Secret Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-sm">PAYSTACK_SECRET_KEY</TableCell>
                        <TableCell className="text-muted-foreground">Paystack API secret key</TableCell>
                        <TableCell>
                          {connections.paystack.status === "connected" ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : connections.paystack.status === "error" ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          ) : connections.paystack.status === "checking" ? (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Checking...
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Not Configured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Update Secret",
                                description: "Use the Lovable secrets manager to update this secret securely.",
                              });
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">FLUTTERWAVE_SECRET_KEY</TableCell>
                        <TableCell className="text-muted-foreground">Flutterwave API secret key</TableCell>
                        <TableCell>
                          {connections.flutterwave.status === "connected" ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : connections.flutterwave.status === "error" ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          ) : connections.flutterwave.status === "checking" ? (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Checking...
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Not Configured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Update Secret",
                                description: "Use the Lovable secrets manager to update this secret securely.",
                              });
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {/* Show connection messages */}
                {(connections.paystack.status === "error" || connections.flutterwave.status === "error") && (
                  <div className="text-sm space-y-1 text-muted-foreground">
                    {connections.paystack.status === "error" && (
                      <p className="text-destructive">Paystack: {connections.paystack.message}</p>
                    )}
                    {connections.flutterwave.status === "error" && (
                      <p className="text-destructive">Flutterwave: {connections.flutterwave.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* SMTP Keys */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email (SMTP) Configuration
                </h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Secret Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-sm">SMTP_HOST</TableCell>
                        <TableCell className="text-muted-foreground">SMTP server hostname</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">SMTP_PORT</TableCell>
                        <TableCell className="text-muted-foreground">SMTP server port (e.g., 587)</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">SMTP_USER</TableCell>
                        <TableCell className="text-muted-foreground">SMTP username/email</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">SMTP_PASS</TableCell>
                        <TableCell className="text-muted-foreground">SMTP password or app password</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">SMTP_FROM_EMAIL</TableCell>
                        <TableCell className="text-muted-foreground">Default sender email address</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Quick Actions */}
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="p-4 border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Add New API Key</h4>
                        <p className="text-sm text-muted-foreground">Configure additional integrations</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      To add new secrets, contact support or use the Lovable dashboard secrets manager.
                    </p>
                  </Card>
                  
                  <Card className="p-4 border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Security Best Practices</h4>
                        <p className="text-sm text-muted-foreground">Keep your keys secure</p>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                      <li>Never share API keys publicly</li>
                      <li>Rotate keys periodically</li>
                      <li>Use separate keys for test/production</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SuperAdminSettings;