import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useThemeConfig, useUpdateThemeConfig, ThemeConfig } from "@/hooks/useThemeConfig";
import { Loader2, Palette, RotateCcw, Check } from "lucide-react";

// HSL to Hex conversion
function hslToHex(hsl: string): string {
  const parts = hsl.split(' ').map(p => parseFloat(p));
  if (parts.length !== 3) return '#000000';
  
  const h = parts[0];
  const s = parts[1] / 100;
  const l = parts[2] / 100;
  
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Hex to HSL conversion
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const hexValue = hslToHex(value);
  
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
        style={{ backgroundColor: `hsl(${value})` }}
      />
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          type="color"
          value={hexValue}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-8 p-1 cursor-pointer"
        />
      </div>
    </div>
  );
}

const defaultTheme: Partial<ThemeConfig> = {
  primary_color: '24 96% 45%',
  primary_foreground: '0 0% 100%',
  secondary_color: '30 100% 96%',
  secondary_foreground: '24 96% 30%',
  accent_color: '180 60% 35%',
  accent_foreground: '0 0% 100%',
  background_color: '30 40% 98%',
  foreground_color: '24 30% 15%',
  muted_color: '30 30% 94%',
  muted_foreground: '24 20% 47%',
  border_color: '30 30% 88%',
  card_color: '0 0% 100%',
  card_foreground: '24 30% 15%',
  destructive_color: '0 84% 60%',
  destructive_foreground: '0 0% 100%',
  sidebar_background: '24 40% 12%',
  sidebar_foreground: '30 40% 90%',
  sidebar_primary: '24 96% 50%',
  sidebar_accent: '24 40% 20%',
};

const AdminThemeManager = () => {
  const { toast } = useToast();
  const { data: theme, isLoading } = useThemeConfig();
  const updateTheme = useUpdateThemeConfig();
  
  const [localTheme, setLocalTheme] = useState<Partial<ThemeConfig>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  const updateField = (field: keyof ThemeConfig, value: string) => {
    setLocalTheme(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateTheme.mutateAsync(localTheme);
      setHasChanges(false);
      toast({
        title: "Theme saved",
        description: "Your color changes have been applied site-wide.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving theme",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setLocalTheme({ ...localTheme, ...defaultTheme });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="super-admin" title="Theme Manager" subtitle="Customize site colors">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin" title="Theme Manager" subtitle="Customize site colors and branding">
      <div className="space-y-6">
        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Live Preview
            </CardTitle>
            <CardDescription>See how your color changes look in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: `hsl(${localTheme.background_color})`,
                borderColor: `hsl(${localTheme.border_color})`
              }}
            >
              <div className="flex gap-4 mb-4">
                <button 
                  className="px-4 py-2 rounded-md font-medium"
                  style={{ 
                    backgroundColor: `hsl(${localTheme.primary_color})`,
                    color: `hsl(${localTheme.primary_foreground})`
                  }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-md font-medium"
                  style={{ 
                    backgroundColor: `hsl(${localTheme.secondary_color})`,
                    color: `hsl(${localTheme.secondary_foreground})`
                  }}
                >
                  Secondary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-md font-medium"
                  style={{ 
                    backgroundColor: `hsl(${localTheme.accent_color})`,
                    color: `hsl(${localTheme.accent_foreground})`
                  }}
                >
                  Accent Button
                </button>
              </div>
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: `hsl(${localTheme.card_color})`,
                  color: `hsl(${localTheme.card_foreground})`
                }}
              >
                <h3 className="font-semibold mb-2">Sample Card</h3>
                <p style={{ color: `hsl(${localTheme.muted_foreground})` }}>
                  This is how your content cards will appear with the selected color scheme.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors</CardTitle>
              <CardDescription>Main brand colors used throughout the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorField 
                label="Primary" 
                value={localTheme.primary_color || ''} 
                onChange={(v) => updateField('primary_color', v)} 
              />
              <ColorField 
                label="Primary Text" 
                value={localTheme.primary_foreground || ''} 
                onChange={(v) => updateField('primary_foreground', v)} 
              />
              <ColorField 
                label="Secondary" 
                value={localTheme.secondary_color || ''} 
                onChange={(v) => updateField('secondary_color', v)} 
              />
              <ColorField 
                label="Secondary Text" 
                value={localTheme.secondary_foreground || ''} 
                onChange={(v) => updateField('secondary_foreground', v)} 
              />
              <ColorField 
                label="Accent" 
                value={localTheme.accent_color || ''} 
                onChange={(v) => updateField('accent_color', v)} 
              />
            </CardContent>
          </Card>

          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors</CardTitle>
              <CardDescription>Page and card backgrounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorField 
                label="Background" 
                value={localTheme.background_color || ''} 
                onChange={(v) => updateField('background_color', v)} 
              />
              <ColorField 
                label="Foreground Text" 
                value={localTheme.foreground_color || ''} 
                onChange={(v) => updateField('foreground_color', v)} 
              />
              <ColorField 
                label="Card Background" 
                value={localTheme.card_color || ''} 
                onChange={(v) => updateField('card_color', v)} 
              />
              <ColorField 
                label="Muted" 
                value={localTheme.muted_color || ''} 
                onChange={(v) => updateField('muted_color', v)} 
              />
              <ColorField 
                label="Border" 
                value={localTheme.border_color || ''} 
                onChange={(v) => updateField('border_color', v)} 
              />
            </CardContent>
          </Card>

          {/* Sidebar Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Colors</CardTitle>
              <CardDescription>Dashboard navigation styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorField 
                label="Sidebar Background" 
                value={localTheme.sidebar_background || ''} 
                onChange={(v) => updateField('sidebar_background', v)} 
              />
              <ColorField 
                label="Sidebar Text" 
                value={localTheme.sidebar_foreground || ''} 
                onChange={(v) => updateField('sidebar_foreground', v)} 
              />
              <ColorField 
                label="Sidebar Primary" 
                value={localTheme.sidebar_primary || ''} 
                onChange={(v) => updateField('sidebar_primary', v)} 
              />
              <ColorField 
                label="Sidebar Accent" 
                value={localTheme.sidebar_accent || ''} 
                onChange={(v) => updateField('sidebar_accent', v)} 
              />
            </CardContent>
          </Card>

          {/* Status Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Status Colors</CardTitle>
              <CardDescription>Error and alert styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorField 
                label="Destructive (Error)" 
                value={localTheme.destructive_color || ''} 
                onChange={(v) => updateField('destructive_color', v)} 
              />
              <ColorField 
                label="Destructive Text" 
                value={localTheme.destructive_foreground || ''} 
                onChange={(v) => updateField('destructive_foreground', v)} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={updateTheme.isPending || !hasChanges}>
            {updateTheme.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save Theme
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminThemeManager;
