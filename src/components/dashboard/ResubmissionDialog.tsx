import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface ResubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  programTitle: string;
  rejectionNotes?: string;
  onSuccess?: () => void;
}

export function ResubmissionDialog({
  open,
  onOpenChange,
  applicationId,
  programTitle,
  rejectionNotes,
  onSuccess
}: ResubmissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const queryClient = useQueryClient();

  const handleResubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('resubmit_application', {
        p_application_id: applicationId
      });

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['trainee-applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      toast.success("Application Resubmitted", {
        description: "Your application has been resubmitted for review."
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Resubmission error:", error);
      toast.error("Resubmission Failed", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-accent" />
            Resubmit Application
          </DialogTitle>
          <DialogDescription>
            Your application for <strong>{programTitle}</strong> was not approved. You can edit your profile and resubmit for another review.
          </DialogDescription>
        </DialogHeader>

        {rejectionNotes && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Admin Feedback:</p>
                <p className="text-sm text-muted-foreground mt-1">{rejectionNotes}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Before resubmitting:</Label>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Review and update your profile information if needed</li>
              <li>Ensure all required documents are properly uploaded</li>
              <li>Double-check all application form responses</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information you'd like to provide..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleResubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Resubmit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}