
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
  // We'll still use the localization hook, but we'll use a fixed set of English strings 
  // rather than translated ones for compliance content
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
  
  // Fixed English strings for compliance content
  const complianceStrings = {
    dialogTitle: "Educational Data Privacy Consent",
    dialogDescription: "Under the Family Educational Rights and Privacy Act (FERPA), we need your consent to collect and share certain educational information.",
    whatIsFerpa: "What is FERPA?",
    ferpaExplanation: "FERPA is a federal law that protects the privacy of student education records. It gives parents certain rights with respect to their children's education records. These rights transfer to the student when they reach the age of 18 or attend a post-secondary educational institution.",
    dataWeCollect: "Data We Collect",
    assessmentResults: "Language assessment results",
    progressData: "Learning progress data",
    practiceHistory: "Practice history and performance",
    certificationsEarned: "Certifications earned",
    dataCollectionNote: "Note: Palavox collects minimal, anonymized data for educational purposes only.",
    directoryInformation: "Directory Information",
    directoryInfoDescription: "Schools may allow limited information (like grade level or learning language) to be shared for educational purposes. Palavox does not share any student data externally.",
    yourName: "Your name",
    yourEmail: "Your email address",
    languagesStudied: "Languages you're studying",
    learningProgress: "Learning progress",
    achievements: "Achievements and certificates",
    consentCheckbox: "I consent to the collection and use of my educational data as described above. I understand I can revoke this consent at any time through my profile settings.",
    consentRequired: "Consent is required to use all features of this application. Without consent, certain features will be limited.",
    savePreferences: "Save Preferences"
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
            
            <div className="border-t pt-4">
              <div className="font-medium mb-2.5">{complianceStrings.directoryInformation}</div>
              <p className="text-sm mb-3">
                {complianceStrings.directoryInfoDescription}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-name" 
                    checked={directoryPreferences.name}
                    onCheckedChange={() => handleToggleDirectoryItem('name')}
                  />
                  <Label htmlFor="directory-name" className="text-sm">{complianceStrings.yourName}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-email" 
                    checked={directoryPreferences.email}
                    onCheckedChange={() => handleToggleDirectoryItem('email')}
                  />
                  <Label htmlFor="directory-email" className="text-sm">{complianceStrings.yourEmail}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-language" 
                    checked={directoryPreferences.language}
                    onCheckedChange={() => handleToggleDirectoryItem('language')}
                  />
                  <Label htmlFor="directory-language" className="text-sm">{complianceStrings.languagesStudied}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-progress" 
                    checked={directoryPreferences.progress}
                    onCheckedChange={() => handleToggleDirectoryItem('progress')}
                  />
                  <Label htmlFor="directory-progress" className="text-sm">{complianceStrings.learningProgress}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="directory-achievements" 
                    checked={directoryPreferences.achievements}
                    onCheckedChange={() => handleToggleDirectoryItem('achievements')}
                  />
                  <Label htmlFor="directory-achievements" className="text-sm">{complianceStrings.achievements}</Label>
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
          >
            {complianceStrings.savePreferences}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FerpaConsentForm;
