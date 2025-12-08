
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, Info } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface FerpaConsentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const FerpaConsentForm: React.FC<FerpaConsentFormProps> = ({ 
  isOpen, 
  onOpenChange,
  onComplete
}) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleToggleConsent = () => {
    setConsentGiven(!consentGiven);
  };
  
  const handleSubmit = async () => {
    if (!consentGiven) {
      toast({
        title: "Consent Required",
        description: "You must provide consent to continue using the application.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Store consent acknowledgment locally
      // Note: Parental consent is obtained in-person through teachers/schools
      localStorage.setItem("ferpaConsentAcknowledged", "true");
      
      toast({
        title: "Preferences Saved",
        description: "Your FERPA acknowledgment has been recorded.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving FERPA consent:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const complianceStrings = {
    dialogTitle: t("educationalDataPrivacyConsent"),
    dialogDescription: t("ferpaConsentDescription"),
    whatIsFerpa: t("whatIsFerpa"),
    ferpaExplanation: t("ferpaExplanation"),
    dataWeCollect: t("dataWeCollect"),
    assessmentResults: t("assessmentResults"),
    progressData: t("progressData"),
    practiceHistory: t("practiceHistory"),
    certificationsEarned: t("certificationsEarned"),
    dataCollectionNote: t("dataCollectionNote"),
    consentCheckbox: t("consentCheckbox"),
    consentRequired: t("consentRequired"),
    savePreferences: t("savePreferences")
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            {complianceStrings.dialogTitle}
          </DialogTitle>
          <DialogDescription className="mt-1.5">
            {complianceStrings.dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
          <div className="space-y-6 mt-2">
            <div className="bg-blue-50 p-4 rounded-md text-sm">
              <p className="font-medium text-blue-800 mb-2">{complianceStrings.whatIsFerpa}</p>
              <p className="text-blue-700">
                {complianceStrings.ferpaExplanation}
              </p>
            </div>
            
            <div className="border-t pt-4 pb-2">
              <div className="font-medium mb-2.5">{complianceStrings.dataWeCollect}</div>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>{complianceStrings.assessmentResults}</li>
                <li>{complianceStrings.progressData}</li>
                <li>{complianceStrings.practiceHistory}</li>
                <li>{complianceStrings.certificationsEarned}</li>
              </ul>
              <p className="text-xs text-gray-500 italic mt-2">{complianceStrings.dataCollectionNote}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm">
              <p className="font-medium text-yellow-800 mb-1">Parental Consent</p>
              <p className="text-yellow-700">
                Parental consent for student data is obtained in-person through your school or district. 
                Contact your teacher or administrator for consent documentation.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="consent-checkbox" 
                  checked={consentGiven}
                  onCheckedChange={handleToggleConsent}
                  className="mt-1"
                />
                <Label htmlFor="consent-checkbox" className="text-sm font-normal">
                  {complianceStrings.consentCheckbox}
                </Label>
              </div>
              
              {!consentGiven && (
                <div className="flex items-center text-amber-600 text-xs mt-3 ml-6">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>
                    {complianceStrings.consentRequired}
                  </span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6 pt-4 border-t">
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!consentGiven || isSubmitting}
          >
            {isSubmitting ? "Saving..." : complianceStrings.savePreferences}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FerpaConsentForm;
