import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConsentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  currentConsent: boolean;
  onConsentUpdated: (consented: boolean) => void;
}

export const ConsentRecordDialog: React.FC<ConsentRecordDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  currentConsent,
  onConsentUpdated
}) => {
  const { toast } = useToast();
  const [consent, setConsent] = useState<string>(currentConsent ? "yes" : "no");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      const consented = consent === "yes";

      const { error } = await supabase
        .from('parental_consent_records')
        .upsert({
          student_id: studentId,
          consent_type: 'profiling',
          consented,
          recorded_by: user.id,
          consent_date: consented ? new Date().toISOString() : null,
          academic_year: academicYear
        }, {
          onConflict: 'student_id,consent_type,academic_year'
        });

      if (error) throw error;

      onConsentUpdated(consented);
      onOpenChange(false);
      
      toast({
        title: "Consent Updated",
        description: consented 
          ? `Parental consent recorded for ${studentName}` 
          : `Consent status updated for ${studentName}`
      });
    } catch (error: any) {
      console.error("Error updating consent:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update consent status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Record Parental Consent
          </DialogTitle>
          <DialogDescription>
            Record the parental consent status for <strong>{studentName}</strong> regarding AI-powered learning profiling.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Has parental consent been provided for AI profiling?</Label>
            <RadioGroup value={consent} onValueChange={setConsent} className="space-y-2">
              <label 
                htmlFor="consent-yes" 
                className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/50 cursor-pointer"
              >
                <RadioGroupItem value="yes" id="consent-yes" />
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Yes, consent has been provided</span>
              </label>
              <label 
                htmlFor="consent-no" 
                className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/50 cursor-pointer"
              >
                <RadioGroupItem value="no" id="consent-no" />
                <ShieldX className="h-4 w-4 text-destructive" />
                <span>No consent / Opt-out</span>
              </label>
            </RadioGroup>
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">What AI profiling includes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Analysis of grammar patterns and struggles</li>
              <li>Vocabulary gap identification</li>
              <li>Proficiency level estimation</li>
              <li>Personalized flashcard generation</li>
            </ul>
            <p className="mt-2 text-xs">Data is limited to 10 recent conversations and deleted annually.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Consent Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
