
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
import { setFerpaConsentStatus, setFerpaDirectoryPreferences } from "@/utils/safety/ferpaCompliance";
import { DirectoryPreference } from "./ferpa/DirectoryPreferencesSection";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [consentGiven, setConsentGiven] = useState(false);
  const [directoryPreferences, setDirectoryPreferences] = useState<DirectoryPreference>({
    name: false,
    email: false,
    language: false,
    progress: false,
    achievements: false
  });
  
  const handleToggleConsent = () => {
    setConsentGiven(!consentGiven);
  };
  
  const handleToggleDirectoryItem = (item: string) => {
    setDirectoryPreferences(prev => ({
      ...prev,
      [item]: !prev[item as keyof typeof prev]
    }));
  };
  
  const handleSubmit = () => {
    // Save FERPA consent status
    setFerpaConsentStatus(consentGiven);
    
    // Save directory information preferences
    setFerpaDirectoryPreferences(directoryPreferences);
    
    // Close the dialog and notify parent component
    onComplete();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            {t("dataPrivacyConsent") || "Educational Data Privacy Consent"}
          </DialogTitle>
          <DialogDescription className="mt-1.5">
            {t("ferpaConsentDescription") || "Under the Family Educational Rights and Privacy Act (FERPA), we need your consent to collect and share certain educational information."}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
          <div className="space-y-6 mt-2">
            <div className="bg-blue-50 p-4 rounded-md text-sm">
              <p className="font-medium text-blue-800 mb-2">{t("whatIsFerpa") || "What is FERPA?"}</p>
              <p className="text-blue-700">
                {t("ferpaExplanation") || "FERPA is a federal law that protects the privacy of student education records. It gives parents certain rights with respect to their children's education records. These rights transfer to the student when they reach the age of 18 or attend a post-secondary educational institution."}
              </p>
            </div>
            
            <div className="border-t pt-4 pb-2">
              <div className="font-medium mb-2.5">{t("dataWeCollect") || "Data We Collect"}</div>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>{t("assessmentResults") || "Language assessment results"}</li>
                <li>{t("progressData") || "Learning progress data"}</li>
                <li>{t("practiceHistory") || "Practice history and performance"}</li>
                <li>{t("certificationsEarned") || "Certifications earned"}</li>
              </ul>
              <p className="text-xs text-gray-500 italic mt-2">Note: Palavox collects minimal, anonymized data for educational purposes only.</p>
            </div>
            
            <div className="border-t pt-4">
              <div className="font-medium mb-2.5">{t("directoryInformation") || "Directory Information"}</div>
              <p className="text-sm mb-3">
                {t("directoryInfoDescription") || "Schools may allow limited information (like grade level or learning language) to be shared for educational purposes. Palavox does not share any student data externally."}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-name" 
                    checked={directoryPreferences.name}
                    onCheckedChange={() => handleToggleDirectoryItem('name')}
                  />
                  <Label htmlFor="directory-name" className="text-sm">{t("yourName") || "Your name"}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-email" 
                    checked={directoryPreferences.email}
                    onCheckedChange={() => handleToggleDirectoryItem('email')}
                  />
                  <Label htmlFor="directory-email" className="text-sm">{t("yourEmail") || "Your email address"}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-language" 
                    checked={directoryPreferences.language}
                    onCheckedChange={() => handleToggleDirectoryItem('language')}
                  />
                  <Label htmlFor="directory-language" className="text-sm">{t("languagesStudied") || "Languages you're studying"}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-progress" 
                    checked={directoryPreferences.progress}
                    onCheckedChange={() => handleToggleDirectoryItem('progress')}
                  />
                  <Label htmlFor="directory-progress" className="text-sm">{t("learningProgress") || "Learning progress"}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-achievements" 
                    checked={directoryPreferences.achievements}
                    onCheckedChange={() => handleToggleDirectoryItem('achievements')}
                  />
                  <Label htmlFor="directory-achievements" className="text-sm">{t("achievements") || "Achievements and certificates"}</Label>
                </div>
              </div>
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
                  {t("ferpaConsentCheckbox") || "I consent to the collection and use of my educational data as described above. I understand I can revoke this consent at any time through my profile settings."}
                </Label>
              </div>
              
              {!consentGiven && (
                <div className="flex items-center text-amber-600 text-xs mt-3 ml-6">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>
                    {t("consentRequired") || "Consent is required to use all features of this application. Without consent, certain features will be limited."}
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
          >
            {t("savePreferences") || "Save Preferences"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FerpaConsentForm;
