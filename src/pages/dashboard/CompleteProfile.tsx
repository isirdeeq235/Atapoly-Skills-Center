import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCustomFormFields } from "@/hooks/useCustomFormFields";
import { DynamicFormField } from "@/components/forms/DynamicFormField";
import { 
  User, 
  Camera, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Loader2,
  CheckCircle2,
  Upload,
  AlertCircle
} from "lucide-react";

const CompleteProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  
  // Fetch custom profile fields
  const { data: customFields } = useCustomFormFields('profile');
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    state: "",
    country: "Nigeria",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    emergency_contact: "",
    avatar_url: "",
  });

  // Handle payment success from application fee
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast({
        title: "Application Fee Paid!",
        description: "Your payment was successful. Please complete your profile to continue.",
      });
      // Clear the query param
      setSearchParams({});
    }
  }, [searchParams, toast, setSearchParams]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: "",
        gender: "",
        address: "",
        state: "",
        country: "Nigeria",
        next_of_kin_name: "",
        next_of_kin_phone: "",
        emergency_contact: "",
        avatar_url: profile.avatar_url || "",
      });
      
      // Fetch additional profile fields
      fetchFullProfile();
    }
  }, [profile]);

  const fetchFullProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        address: data.address || "",
        state: data.state || "",
        country: data.country || "Nigeria",
        next_of_kin_name: data.next_of_kin_name || "",
        next_of_kin_phone: data.next_of_kin_phone || "",
        emergency_contact: data.emergency_contact || "",
        avatar_url: data.avatar_url || "",
      });
      
      // Load custom field values
      if (data.custom_field_values) {
        const values = typeof data.custom_field_values === 'string' 
          ? JSON.parse(data.custom_field_values) 
          : data.custom_field_values;
        setCustomFieldValues(values as Record<string, any>);
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-passport.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Photo uploaded",
        description: "Your passport photo has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate required fields
    if (!formData.full_name || !formData.phone || !formData.date_of_birth || 
        !formData.gender || !formData.address || !formData.avatar_url) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and upload your passport photo.",
        variant: "destructive",
      });
      return;
    }

    // Validate required custom fields
    const missingRequiredCustom = customFields?.filter(f => 
      f.is_required && !customFieldValues[f.field_name]
    );
    
    if (missingRequiredCustom && missingRequiredCustom.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingRequiredCustom.map(f => f.field_label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          state: formData.state,
          country: formData.country,
          next_of_kin_name: formData.next_of_kin_name,
          next_of_kin_phone: formData.next_of_kin_phone,
          emergency_contact: formData.emergency_contact,
          avatar_url: formData.avatar_url,
          custom_field_values: customFieldValues,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Profile completed",
        description: "Your profile has been saved. Your application is now pending admin approval.",
      });

      // Navigate to applications page to see pending status
      navigate('/dashboard/applications');
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  return (
    <DashboardLayout role="trainee" title="Complete Your Profile" subtitle="Please provide your information to continue">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator - Updated for new flow */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-sm font-semibold">✓</div>
              <span className="font-medium text-success">Application Fee Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold">2</div>
              <span className="font-medium">Complete Profile</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">3</div>
              <span>Admin Approval</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">4</div>
              <span>Pay & Enroll</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent w-1/2 transition-all" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              This information is required for your trainee registration and ID card generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-lg bg-muted/30">
                <div className="relative">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Passport" 
                      className="w-32 h-40 object-cover rounded-lg border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-40 bg-muted rounded-lg border-4 border-white shadow-lg flex flex-col items-center justify-center">
                      <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center">Passport Photo</span>
                    </div>
                  )}
                  {formData.avatar_url && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploadingPhoto}
                  />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button variant="outline" asChild disabled={uploadingPhoto}>
                      <span>
                        {uploadingPhoto ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {formData.avatar_url ? 'Change Photo' : 'Upload Passport Photo'} *
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload a clear passport photograph (JPG/PNG, max 2MB)
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your full residential address"
                      className="pl-10 min-h-[80px]"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Nigeria"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Emergency Contact / Next of Kin
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="next_of_kin_name">Next of Kin Name</Label>
                    <Input
                      id="next_of_kin_name"
                      value={formData.next_of_kin_name}
                      onChange={(e) => setFormData({ ...formData, next_of_kin_name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_of_kin_phone">Next of Kin Phone</Label>
                    <Input
                      id="next_of_kin_phone"
                      type="tel"
                      value={formData.next_of_kin_phone}
                      onChange={(e) => setFormData({ ...formData, next_of_kin_phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergency_contact">Emergency Contact Number</Label>
                    <Input
                      id="emergency_contact"
                      type="tel"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Fields Section */}
              {customFields && customFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Additional Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {customFields.map((field) => (
                      <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                        <DynamicFormField
                          field={field}
                          value={customFieldValues[field.field_name]}
                          onChange={(value) => setCustomFieldValues(prev => ({
                            ...prev,
                            [field.field_name]: value
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Information Required</p>
                  <p className="text-muted-foreground">
                    Fields marked with * are required. Your passport photo will be used for your trainee ID card.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Program Selection
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompleteProfile;
