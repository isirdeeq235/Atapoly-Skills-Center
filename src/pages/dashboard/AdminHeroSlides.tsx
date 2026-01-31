import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { 
  useAllHeroSlides, 
  useCreateHeroSlide, 
  useUpdateHeroSlide, 
  useDeleteHeroSlide,
  HeroSlide 
} from "@/hooks/useHeroSlides";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "sonner";
import { 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  Edit2, 
  GripVertical,
  Eye,
  EyeOff,
  Upload,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminHeroSlides = () => {
  const { role } = useAuth();
  const { data: slides, isLoading } = useAllHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setCtaText("");
    setCtaLink("");
    setDisplayOrder(slides?.length || 0);
    setIsActive(true);
    setSelectedSlide(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDisplayOrder(slides?.length || 0);
    setIsDialogOpen(true);
  };

  const openEditDialog = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || "");
    setImageUrl(slide.image_url || "");
    setCtaText(slide.cta_text || "");
    setCtaLink(slide.cta_link || "");
    setDisplayOrder(slide.display_order);
    setIsActive(slide.is_active);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const resp: any = await apiFetch('/api/uploads/s3', { method: 'POST', body: form });
      const publicUrl = resp.url;

      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (selectedSlide) {
        await updateSlide.mutateAsync({
          id: selectedSlide.id,
          title,
          subtitle: subtitle || null,
          image_url: imageUrl || null,
          cta_text: ctaText || null,
          cta_link: ctaLink || null,
          display_order: displayOrder,
          is_active: isActive,
        });
        toast.success("Slide updated successfully");
      } else {
        await createSlide.mutateAsync({
          title,
          subtitle: subtitle || null,
          image_url: imageUrl || null,
          cta_text: ctaText || null,
          cta_link: ctaLink || null,
          display_order: displayOrder,
          is_active: isActive,
        });
        toast.success("Slide created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error("Failed to save slide: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlide) return;

    try {
      await deleteSlide.mutateAsync(selectedSlide.id);
      toast.success("Slide deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedSlide(null);
    } catch (error: any) {
      toast.error("Failed to delete slide: " + error.message);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await updateSlide.mutateAsync({
        id: slide.id,
        is_active: !slide.is_active,
      });
      toast.success(slide.is_active ? "Slide hidden" : "Slide activated");
    } catch (error: any) {
      toast.error("Failed to update slide");
    }
  };

  const dashboardRole = role === 'super_admin' ? 'super-admin' : (role as 'admin' | 'instructor');

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Hero Slides">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole}
      title="Hero Slides Management" 
      subtitle="Manage the hero carousel on your homepage"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-muted-foreground">
            {slides?.length || 0} slide(s) configured
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {/* Slides Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {slides?.map((slide) => (
          <Card key={slide.id} className={`overflow-hidden ${!slide.is_active ? 'opacity-60' : ''}`}>
            <div className="relative h-40 bg-muted">
              {slide.image_url ? (
                <img 
                  src={slide.image_url} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-semibold text-white text-sm truncate">{slide.title}</h3>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleActive(slide)}
                >
                  {slide.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="absolute top-3 left-3">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  #{slide.display_order + 1}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {slide.subtitle || "No subtitle"}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {slide.cta_text && (
                    <span className="bg-secondary px-2 py-1 rounded">
                      CTA: {slide.cta_text}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditDialog(slide)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedSlide(slide);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!slides || slides.length === 0) && (
        <Card className="p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Hero Slides</h3>
          <p className="text-muted-foreground mb-4">
            Create your first hero slide to display on the homepage.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Slide
          </Button>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSlide ? "Edit Hero Slide" : "Create Hero Slide"}
            </DialogTitle>
            <DialogDescription>
              Configure the content for this hero carousel slide
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Background Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setImageUrl("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="slide-image-upload"
                      disabled={uploading}
                    />
                    <Label htmlFor="slide-image-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild disabled={uploading}>
                        <span>
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </>
                          )}
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended: 1920x1080px or larger
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Unlock Your Potential"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Join thousands of professionals..."
                rows={2}
              />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaText">CTA Button Text</Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Get Started"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLink">CTA Link</Label>
                <Input
                  id="ctaLink"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/register"
                />
              </div>
            </div>

            {/* Display Order & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label>Active</Label>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createSlide.isPending || updateSlide.isPending}
            >
              {(createSlide.isPending || updateSlide.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {selectedSlide ? "Save Changes" : "Create Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Slide?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The slide "{selectedSlide?.title}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSlide.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminHeroSlides;
