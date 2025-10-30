
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getFerpaConsentStatus, 
  setFerpaConsentStatus,
  getFerpaDirectoryPreferences,
  setFerpaDirectoryPreferences
} from "@/utils/safety/ferpaCompliance";
import { supabase } from "@/integrations/supabase/client";

// Import our components
import FerpaInfoSection from "./ferpa/FerpaInfoSection";
import ConsentToggle from "./ferpa/ConsentToggle";
import DirectoryPreferencesSection, { DirectoryPreference } from "./ferpa/DirectoryPreferencesSection";
import DataExportSection from "./ferpa/DataExportSection";

const FerpaPrivacySettings = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [consentGiven, setConsentGiven] = useState(false);
  const [directoryPreferences, setDirectoryPreferences] = useState<DirectoryPreference>(getFerpaDirectoryPreferences() as DirectoryPreference);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load initial values from database and localStorage
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const hasConsent = await getFerpaConsentStatus(supabase, user.id);
          setConsentGiven(hasConsent);
        }
        setDirectoryPreferences(getFerpaDirectoryPreferences() as DirectoryPreference);
      } catch (error) {
        console.error('Error loading FERPA preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
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
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Save FERPA consent to database
      const success = await setFerpaConsentStatus(
        supabase,
        user.id,
        consentGiven,
        user.email || 'Self',
        user.email
      );
      
      if (!success) {
        throw new Error("Failed to save consent");
      }
      
      // Save directory information preferences (localStorage)
      setFerpaDirectoryPreferences(directoryPreferences);
      
      toast({
        title: t("preferencesUpdated") || "Privacy preferences updated",
        description: t("privacySettingsSaved") || "Your privacy and data sharing preferences have been saved.",
      });
    } catch (error) {
      console.error('Error saving FERPA preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDownloadData = () => {
    // In a real implementation, this would trigger an API call to 
    // generate and download the user's educational data
    
    toast({
      title: t("dataPreparing") || "Data export preparing",
      description: t("dataExportDescription") || "Your data export is being prepared and will be emailed to you shortly.",
    });
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center">
          <p>Loading FERPA preferences...</p>
        </CardContent>
      </Card>
    );
  }

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
        
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start space-x-2 text-sm">
          <InfoIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="font-medium mb-1">Demo Mode Notice</p>
            <p>Palavox collects minimal or no real user data. This FERPA compliance interface is provided as a demonstration of how educational apps should handle data privacy, and for schools/districts that may require such documentation.</p>
          </div>
        </div>
        
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
