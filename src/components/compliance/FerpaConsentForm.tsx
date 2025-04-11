
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
import { setFerpaConsentStatus, setFerpaDirectoryPreferences } from "@/utils/contentSafetyUtils";

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
  const [directoryPreferences, setDirectoryPreferences] = useState({
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
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            {t("dataPrivacyConsent") || "Educational Data Privacy Consent"}
          </DialogTitle>
          <DialogDescription>
            {t("ferpaConsentDescription") || "Under the Family Educational Rights and Privacy Act (FERPA), we need your consent to collect and share certain educational information."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="bg-blue-50 p-3 rounded-md text-sm">
            <p className="font-medium text-blue-800 mb-1">{t("whatIsFerpa") || "What is FERPA?"}</p>
            <p className="text-blue-700">
              {t("ferpaExplanation") || "FERPA is a federal law that protects the privacy of student education records. It gives parents certain rights with respect to their children's education records. These rights transfer to the student when they reach the age of 18 or attend a post-secondary educational institution."}
            </p>
          </div>
          
          <div>
            <div className="font-medium mb-2">{t("dataWeCollect") || "Data We Collect"}</div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>{t("assessmentResults") || "Language assessment results"}</li>
              <li>{t("progressData") || "Learning progress data"}</li>
              <li>{t("practiceHistory") || "Practice history and performance"}</li>
              <li>{t("certificationsEarned") || "Certifications earned"}</li>
            </ul>
          </div>
          
          <div>
            <div className="font-medium mb-2">{t("directoryInformation") || "Directory Information"}</div>
            <p className="text-sm mb-2">
              {t("directoryInfoDescription") || "You can choose which directory information can be shared (e.g., with other language learners or educators):"}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="directory-name" 
                  checked={directoryPreferences.name}
                  onCheckedChange={() => handleToggleDirectoryItem('name')}
                />
                <Label htmlFor="directory-name">{t("yourName") || "Your name"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="directory-email" 
                  checked={directoryPreferences.email}
                  onCheckedChange={() => handleToggleDirectoryItem('email')}
                />
                <Label htmlFor="directory-email">{t("yourEmail") || "Your email address"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="directory-language" 
                  checked={directoryPreferences.language}
                  onCheckedChange={() => handleToggleDirectoryItem('language')}
                />
                <Label htmlFor="directory-language">{t("languagesStudied") || "Languages you're studying"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="directory-progress" 
                  checked={directoryPreferences.progress}
                  onCheckedChange={() => handleToggleDirectoryItem('progress')}
                />
                <Label htmlFor="directory-progress">{t("learningProgress") || "Learning progress"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="directory-achievements" 
                  checked={directoryPreferences.achievements}
                  onCheckedChange={() => handleToggleDirectoryItem('achievements')}
                />
                <Label htmlFor="directory-achievements">{t("achievements") || "Achievements and certificates"}</Label>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="consent-checkbox" 
                checked={consentGiven}
                onCheckedChange={handleToggleConsent}
              />
              <Label htmlFor="consent-checkbox" className="text-sm font-normal">
                {t("ferpaConsentCheckbox") || "I consent to the collection and use of my educational data as described above. I understand I can revoke this consent at any time through my profile settings."}
              </Label>
            </div>
            
            {!consentGiven && (
              <div className="flex items-center text-amber-600 text-xs mt-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>
                  {t("consentRequired") || "Consent is required to use all features of this application. Without consent, certain features will be limited."}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-4">
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
