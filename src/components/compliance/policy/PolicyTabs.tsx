
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, BookOpen, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CIPATabContent from "./CIPATabContent";
import FERPATabContent from "./FERPATabContent";
import PrivacyTabContent from "./PrivacyTabContent";

const PolicyTabs = () => {
  const { t } = useLocalization();
  
  return (
    <Tabs defaultValue="cipa">
      <TabsList className="mb-4">
        <TabsTrigger value="cipa" className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          <span>CIPA {t("compliance")}</span>
        </TabsTrigger>
        <TabsTrigger value="ferpa" className="flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          <span>FERPA {t("compliance")}</span>
        </TabsTrigger>
        <TabsTrigger value="privacy" className="flex items-center">
          <Lock className="mr-2 h-4 w-4" />
          <span>{t("dataPrivacy")}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="cipa">
        <CIPATabContent />
      </TabsContent>
      
      <TabsContent value="ferpa">
        <FERPATabContent />
      </TabsContent>
      
      <TabsContent value="privacy">
        <PrivacyTabContent />
      </TabsContent>
    </Tabs>
  );
};

export default PolicyTabs;
