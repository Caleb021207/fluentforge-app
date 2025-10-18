
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PolicyHeader from "@/components/compliance/policy/PolicyHeader";
import PolicyTabs from "@/components/compliance/policy/PolicyTabs";
import DistrictInfoSection from "@/components/compliance/district/DistrictInfoSection";
import ComplianceFAQ from "@/components/compliance/policy/ComplianceFAQ";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const SafetyPolicy = () => {
  const { t } = useLocalization();
  
  const handleDownloadCompliance = () => {
    // TODO: Generate/download compliance packet PDF
    window.open("mailto:info@palavox.org?subject=Request%20Compliance%20Documentation&body=I%20would%20like%20to%20request%20the%20full%20FERPA%2FCIPA%20compliance%20documentation%20packet%20for%20Palavox.", "_blank");
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Compliance Status Badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-2 py-2 px-4">
          <Shield className="h-4 w-4" />
          COPPA Compliant: Paper Consent Process ✅
        </Badge>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-2 py-2 px-4">
          <Shield className="h-4 w-4" />
          CIPA Compliant: Active Filtering ✅
        </Badge>
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-2 py-2 px-4">
          <Lock className="h-4 w-4" />
          FERPA: Core Systems Implemented 🔄
        </Badge>
      </div>

      <DistrictInfoSection />
      
      <div className="mt-8">
        <div className="flex items-start justify-between mb-6">
          <PolicyHeader 
            title={t("safetyAndPrivacyPolicy")}
            description={t("safetyPolicyIntro")}
          />
          <Button 
            variant="outline" 
            onClick={handleDownloadCompliance}
            className="ml-4 flex items-center gap-2 shrink-0"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Request Compliance Packet</span>
            <span className="sm:hidden">Docs</span>
          </Button>
        </div>
        
        <PolicyTabs />
        
        <ComplianceFAQ />
      </div>
    </div>
  );
};

export default SafetyPolicy;
