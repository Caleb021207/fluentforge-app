
import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Globe, Bell } from "lucide-react";
import ParentalControls from "@/components/compliance/ParentalControls";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("parental-controls");
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("settings")}</h1>
      
      <Tabs 
        defaultValue="parental-controls"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="parental-controls" className="flex items-center gap-2">
            <Shield size={16} />
            <span>{t("parentalControls")}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe size={16} />
            <span>{t("language")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span>{t("notifications")}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="parental-controls" className="mt-4">
          <ParentalControls />
        </TabsContent>
        
        <TabsContent value="language" className="mt-4">
          <div className="text-center p-8 text-gray-500">
            {t("languageSettingsComingSoon")}
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-4">
          <div className="text-center p-8 text-gray-500">
            {t("notificationSettingsComingSoon")}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
