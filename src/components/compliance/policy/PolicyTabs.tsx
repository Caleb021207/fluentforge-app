
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, BookOpen, Lock, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CIPATabContent from "./CIPATabContent";
import FERPATabContent from "./FERPATabContent";
import PrivacyTabContent from "./PrivacyTabContent";
import ComplianceStatusTabContent from "./ComplianceStatusTabContent";

const PolicyTabs = () => {
  const { t } = useLocalization();
  
  return (
    <Tabs defaultValue="cipa" className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-4">
        <TabsTrigger value="cipa" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">CIPA</span>
        </TabsTrigger>
        <TabsTrigger value="ferpa" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">FERPA</span>
        </TabsTrigger>
        <TabsTrigger value="privacy" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">{t("dataPrivacy") || "Privacy"}</span>
        </TabsTrigger>
        <TabsTrigger value="status" className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">Status</span>
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

      <TabsContent value="status">
        <ComplianceStatusTabContent />
      </TabsContent>
    </Tabs>
  );
};

export default PolicyTabs;
