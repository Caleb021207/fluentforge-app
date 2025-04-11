import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BookOpen, Shield, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getFerpaConsentStatus, 
  setFerpaConsentStatus,
  getFerpaDirectoryPreferences,
  setFerpaDirectoryPreferences
} from "@/utils/safety/ferpaCompliance";

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
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-700 flex items-center mb-2">
            <Shield className="mr-2 h-4 w-4" />
            {t("whatIsFerpa") || "What is FERPA?"}
          </h3>
          <p className="text-sm text-blue-600">
            {t("ferpaExplanationShort") || "FERPA is a federal law that protects the privacy of student education records and gives students certain rights to their educational information."}
          </p>
        </div>
        
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t("dataConsent") || "Educational Data Consent"}</h3>
              <p className="text-sm text-gray-500">
                {t("dataConsentDescription") || "Allow this application to collect and process your educational data for learning purposes"}
              </p>
            </div>
            <Switch 
              checked={consentGiven} 
              onCheckedChange={handleConsentChange}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">{t("directoryInformation") || "Directory Information"}</h3>
            <p className="text-sm text-gray-500">
              {t("directoryInfoDescription") || "Control which information can be shared in public directories or with other users"}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="flex items-center justify-between space-x-2 bg-gray-50 p-2 rounded">
                <Label htmlFor="share-name" className="text-sm cursor-pointer flex-grow">
                  {t("yourName") || "Your name"}
                </Label>
                <Switch 
                  id="share-name"
                  checked={directoryPreferences.name} 
                  onCheckedChange={(checked) => handleDirectoryPrefChange('name', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 bg-gray-50 p-2 rounded">
                <Label htmlFor="share-email" className="text-sm cursor-pointer flex-grow">
                  {t("yourEmail") || "Your email address"}
                </Label>
                <Switch 
                  id="share-email"
                  checked={directoryPreferences.email} 
                  onCheckedChange={(checked) => handleDirectoryPrefChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 bg-gray-50 p-2 rounded">
                <Label htmlFor="share-language" className="text-sm cursor-pointer flex-grow">
                  {t("languagesStudied") || "Languages you're studying"}
                </Label>
                <Switch 
                  id="share-language"
                  checked={directoryPreferences.language} 
                  onCheckedChange={(checked) => handleDirectoryPrefChange('language', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 bg-gray-50 p-2 rounded">
                <Label htmlFor="share-progress" className="text-sm cursor-pointer flex-grow">
                  {t("learningProgress") || "Learning progress"}
                </Label>
                <Switch 
                  id="share-progress"
                  checked={directoryPreferences.progress} 
                  onCheckedChange={(checked) => handleDirectoryPrefChange('progress', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 bg-gray-50 p-2 rounded">
                <Label htmlFor="share-achievements" className="text-sm cursor-pointer flex-grow">
                  {t("achievements") || "Achievements and certificates"}
                </Label>
                <Switch 
                  id="share-achievements"
                  checked={directoryPreferences.achievements} 
                  onCheckedChange={(checked) => handleDirectoryPrefChange('achievements', checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleDownloadData}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("downloadMyData") || "Download my educational data"}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {t("downloadDataDescription") || "Request a copy of all your educational data stored in our system. This will be prepared and sent to your registered email address."}
          </p>
        </div>
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
