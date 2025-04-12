
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, FileText, BellRing, User, Globe, VolumeX } from "lucide-react";
import ParentalControls from "@/components/compliance/ParentalControls";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("settings")}</h1>
      
      <Tabs defaultValue="safety" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="safety">
            <Shield className="h-4 w-4 mr-2" />
            {t("safety") || "Safety"}
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            {t("account") || "Account"}
          </TabsTrigger>
          <TabsTrigger value="language">
            <Globe className="h-4 w-4 mr-2" />
            {t("language") || "Language"}
          </TabsTrigger>
          <TabsTrigger value="audio">
            <VolumeX className="h-4 w-4 mr-2" />
            {t("audioSettings") || "Audio"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="safety" className="mt-0">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield size={20} className="text-primary" />
              <div>
                <CardTitle>{t("parentalControls") || "Parental Controls"}</CardTitle>
                <CardDescription>{t("parentalControlsDescription") || "Configure safety settings to protect younger users"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ParentalControls />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={() => navigate("/safety-policy")}
              >
                <FileText size={16} />
                {t("safetyPolicy") || "Safety Policy"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountSettings") || "Account Settings"}</CardTitle>
              <CardDescription>{t("manageYourAccount") || "Manage your account details and preferences"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("accountSettingsDescription") || "Account settings allow you to update your profile information, password, and notification preferences."}
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 items-center">
                  <span className="text-sm font-medium">{t("emailNotifications") || "Email Notifications"}</span>
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" disabled>
                      {t("manage") || "Manage"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 items-center">
                  <span className="text-sm font-medium">{t("changePassword") || "Change Password"}</span>
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" disabled>
                      {t("update") || "Update"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 items-center">
                  <span className="text-sm font-medium">{t("deleteAccount") || "Delete Account"}</span>
                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm" disabled>
                      {t("delete") || "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("languageSettings") || "Language Settings"}</CardTitle>
              <CardDescription>{t("changeAppLanguage") || "Change the application display language"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("appLanguageDescription") || "This will change the interface language for buttons, menus and system messages."}
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" disabled className="justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  {t("comingSoon") || "Additional languages coming soon"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audio" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("audioSettings") || "Audio Settings"}</CardTitle>
              <CardDescription>{t("adjustAudioPreferences") || "Adjust audio preferences for voice interactions"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("audioSettingsDescription") || "Configure audio settings for voice chat, text-to-speech and speech recognition features."}
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 items-center">
                  <span className="text-sm font-medium">{t("voiceSpeed") || "Voice Speed"}</span>
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" disabled>
                      {t("adjust") || "Adjust"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 items-center">
                  <span className="text-sm font-medium">{t("automaticPlayback") || "Automatic Audio Playback"}</span>
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" disabled>
                      {t("configure") || "Configure"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
