import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useHomepageContent, useUpdateHomepageContent, HomepageContent } from "@/hooks/useHomepageContent";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Save, 
  Layout, 
  Type, 
  Image, 
  Sparkles,
  Upload
} from "lucide-react";

const AdminHomepageEditor = () => {
  const { toast } = useToast();
  const { data: content, isLoading } = useHomepageContent();
  const updateContent = useUpdateHomepageContent();
  
  const [localContent, setLocalContent] = useState<Partial<HomepageContent>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (content) {
      setLocalContent(content);
    }
  }, [content]);

  const updateField = <K extends keyof HomepageContent>(field: K, value: HomepageContent[K]) => {
    setLocalContent(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync(localContent);
      setHasChanges(false);
      toast({
        title: "Homepage saved",
        description: "Your homepage content has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `homepage/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      updateField('hero_image_url', publicUrl);
      toast({
        title: "Image uploaded",
        description: "Hero image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="super-admin" title="Homepage Editor" subtitle="Manage homepage content">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin" title="Homepage Editor" subtitle="Customize your homepage content without code">
      <div className="space-y-6">
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="cta" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              CTA
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Sections
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner that visitors see first</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={localContent.hero_title || ''}
                      onChange={(e) => updateField('hero_title', e.target.value)}
                      placeholder="Transform Your Career"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Input
                      value={localContent.hero_subtitle || ''}
                      onChange={(e) => updateField('hero_subtitle', e.target.value)}
                      placeholder="Join our professional training programs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={localContent.hero_cta_text || ''}
                      onChange={(e) => updateField('hero_cta_text', e.target.value)}
                      placeholder="Apply Now"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Link</Label>
                    <Input
                      value={localContent.hero_cta_link || ''}
                      onChange={(e) => updateField('hero_cta_link', e.target.value)}
                      placeholder="/register"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hero Background Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    {localContent.hero_image_url ? (
                      <img 
                        src={localContent.hero_image_url} 
                        alt="Hero" 
                        className="max-h-40 mx-auto mb-2 rounded-lg" 
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="hero-upload"
                    />
                    <div className="flex justify-center mt-2">
                      <Label htmlFor="hero-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features Section</CardTitle>
                <CardDescription>Highlight your key benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={localContent.features_title || ''}
                      onChange={(e) => updateField('features_title', e.target.value)}
                      placeholder="Why Choose Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Input
                      value={localContent.features_subtitle || ''}
                      onChange={(e) => updateField('features_subtitle', e.target.value)}
                      placeholder="Excellence in training"
                    />
                  </div>
                </div>

                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-4 border border-border rounded-lg space-y-3">
                    <h4 className="font-medium">Feature {num}</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={(localContent as any)[`feature_${num}_title`] || ''}
                          onChange={(e) => updateField(`feature_${num}_title` as keyof HomepageContent, e.target.value)}
                          placeholder="Feature title"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={(localContent as any)[`feature_${num}_description`] || ''}
                          onChange={(e) => updateField(`feature_${num}_description` as keyof HomepageContent, e.target.value)}
                          placeholder="Feature description"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CTA Section */}
          <TabsContent value="cta">
            <Card>
              <CardHeader>
                <CardTitle>Call to Action</CardTitle>
                <CardDescription>The final conversion section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>CTA Title</Label>
                  <Input
                    value={localContent.cta_title || ''}
                    onChange={(e) => updateField('cta_title', e.target.value)}
                    placeholder="Ready to Start Your Journey?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Subtitle</Label>
                  <Input
                    value={localContent.cta_subtitle || ''}
                    onChange={(e) => updateField('cta_subtitle', e.target.value)}
                    placeholder="Join thousands of successful graduates"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={localContent.cta_button_text || ''}
                      onChange={(e) => updateField('cta_button_text', e.target.value)}
                      placeholder="Get Started Today"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input
                      value={localContent.cta_button_link || ''}
                      onChange={(e) => updateField('cta_button_link', e.target.value)}
                      placeholder="/register"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Footer About Text</Label>
                  <Textarea
                    value={localContent.footer_about || ''}
                    onChange={(e) => updateField('footer_about', e.target.value)}
                    placeholder="We are a leading training institution..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Toggle */}
          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>Section Visibility</CardTitle>
                <CardDescription>Show or hide homepage sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <h4 className="font-medium">Programs Section</h4>
                    <p className="text-sm text-muted-foreground">Display available training programs</p>
                  </div>
                  <Switch
                    checked={localContent.show_programs_section || false}
                    onCheckedChange={(checked) => updateField('show_programs_section', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <h4 className="font-medium">How It Works Section</h4>
                    <p className="text-sm text-muted-foreground">Step-by-step enrollment process</p>
                  </div>
                  <Switch
                    checked={localContent.show_how_it_works || false}
                    onCheckedChange={(checked) => updateField('show_how_it_works', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium">Testimonials Section</h4>
                    <p className="text-sm text-muted-foreground">Student success stories</p>
                  </div>
                  <Switch
                    checked={localContent.show_testimonials || false}
                    onCheckedChange={(checked) => updateField('show_testimonials', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={updateContent.isPending || !hasChanges} size="lg">
          {updateContent.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Changes
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminHomepageEditor;
