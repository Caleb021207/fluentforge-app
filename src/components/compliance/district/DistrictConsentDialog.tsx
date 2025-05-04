import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/hooks/useLocalization";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  districtId: string;
  onComplete: () => void;
}

const DistrictConsentDialog: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  districtId,
  onComplete
}) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [accepted, setAccepted] = React.useState(false);

  const handleSubmit = async () => {
    if (!accepted) {
      toast({
        title: "Consent Required",
        description: "Please accept the terms to continue",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('district_users')
        .insert({
          district_id: districtId,
          user_id: user.id,
          consent_provided: true,
          consent_type: 'code_of_conduct',
          consent_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "District consent recorded successfully"
      });
      
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error providing consent:', error);
      toast({
        title: "Error",
        description: "Failed to record consent. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>SCBOE Student Code of Conduct</DialogTitle>
          <DialogDescription>
            This application is approved for use under the Shelby County Schools Student Code of Conduct.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm space-y-2">
            <p>By continuing, you acknowledge:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>This platform complies with CIPA and FERPA requirements</li>
              <li>Usage is governed by SCBOE's acceptable use policies</li>
              <li>Parents may opt-out by notifying the school in writing</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="consent" 
              checked={accepted} 
              onCheckedChange={(checked) => setAccepted(checked as boolean)} 
            />
            <Label htmlFor="consent">
              I accept the terms of use under the SCBOE Student Code of Conduct
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!accepted}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DistrictConsentDialog;
