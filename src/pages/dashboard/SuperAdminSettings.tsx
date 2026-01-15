import { useState, useEffect } from "react";
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
  FileSignature
} from "lucide-react";

const SuperAdminSettings = () => {
  const { toast } = useToast();
  const { data: siteConfig, isLoading: siteLoading, refetch: refetchSiteConfig } = useSiteConfig();
  const { data: paymentSettings, isLoading: paymentLoading, refetch: refetchPaymentSettings } = usePaymentSettings();

  // Site config state
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

  // Payment settings state
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [flutterwaveEnabled, setFlutterwaveEnabled] = useState(false);
  const [flutterwavePublicKey, setFlutterwavePublicKey] = useState("");

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
      setPaystackPublicKey(paymentSettings.paystack_public_key || "");
      setFlutterwaveEnabled(paymentSettings.flutterwave_enabled || false);
      setFlutterwavePublicKey(paymentSettings.flutterwave_public_key || "");
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
          paystack_public_key: paystackPublicKey,
          flutterwave_enabled: flutterwaveEnabled,
          flutterwave_public_key: flutterwavePublicKey,
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
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
        </TabsList>

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
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="paystackPublicKey">Public Key</Label>
                    <Input
                      id="paystackPublicKey"
                      value={paystackPublicKey}
                      onChange={(e) => setPaystackPublicKey(e.target.value)}
                      placeholder="pk_live_xxxxxxxxxxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Secret key is stored securely. Contact support to update.
                    </p>
                  </div>
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
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="flutterwavePublicKey">Public Key</Label>
                    <Input
                      id="flutterwavePublicKey"
                      value={flutterwavePublicKey}
                      onChange={(e) => setFlutterwavePublicKey(e.target.value)}
                      placeholder="FLWPUBK-xxxxxxxxxxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Secret key is stored securely. Contact support to update.
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={handleSavePaymentSettings} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SuperAdminSettings;