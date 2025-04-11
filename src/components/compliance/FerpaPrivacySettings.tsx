
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getFerpaConsentStatus, 
  setFerpaConsentStatus,
  getFerpaDirectoryPreferences,
  setFerpaDirectoryPreferences
} from "@/utils/safety/ferpaCompliance";

// Import our new components
import FerpaInfoSection from "./ferpa/FerpaInfoSection";
import ConsentToggle from "./ferpa/ConsentToggle";
import DirectoryPreferencesSection from "./ferpa/DirectoryPreferencesSection";
import DataExportSection from "./ferpa/DataExportSection";

const FerpaPrivacySettings = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [consentGiven, setConsentGiven] = useState(getFerpaConsentStatus());
  const [directoryPreferences, setDirectoryPreferences] = useState(getFerpaDirectoryPreferences());
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Load initial values from localStorage
    setConsentGiven(getFerpaConsentStatus());
    setDirectoryPreferences(getFerpaDirectoryPreferences());
  }, []);
  
  const handleConsentChange = (checked: boolean) => {
    setConsentGiven(checked);
  };
  
  const handleDirectoryPrefChange = (item: string, checked: boolean) => {
    setDirectoryPreferences(prev => ({
      ...prev,
      [item]: checked
    }));
  };
  
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Save FERPA consent status
      setFerpaConsentStatus(consentGiven);
      
      // Save directory information preferences
      setFerpaDirectoryPreferences(directoryPreferences);
      
      toast({
        title: t("preferencesUpdated") || "Privacy preferences updated",
        description: t("privacySettingsSaved") || "Your privacy and data sharing preferences have been saved.",
      });
      
      setIsSaving(false);
    }, 700);
  };
  
  const handleDownloadData = () => {
    // In a real implementation, this would trigger an API call to 
    // generate and download the user's educational data
    
    toast({
      title: t("dataPreparing") || "Data export preparing",
      description: t("dataExportDescription") || "Your data export is being prepared and will be emailed to you shortly.",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
          {t("ferpaPrivacySettings") || "FERPA Privacy Settings"}
        </CardTitle>
        <CardDescription>
          {t("ferpaSettingsDescription") || "Manage how your educational data is handled in compliance with the Family Educational Rights and Privacy Act (FERPA)"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <FerpaInfoSection />
        
        <div className="space-y-4 border-t pt-4">
          <ConsentToggle 
            consentGiven={consentGiven}
            onConsentChange={handleConsentChange}
          />
          
          <DirectoryPreferencesSection 
            preferences={directoryPreferences}
            onPreferenceChange={handleDirectoryPrefChange}
          />
        </div>
        
        <DataExportSection onDownloadData={handleDownloadData} />
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-4">
        <Button 
          onClick={handleSaveChanges} 
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              {t("saving") || "Saving..."}
            </span>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("saveChanges") || "Save Changes"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FerpaPrivacySettings;
