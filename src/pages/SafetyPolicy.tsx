
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PolicyHeader from "@/components/compliance/policy/PolicyHeader";
import PolicyTabs from "@/components/compliance/policy/PolicyTabs";
import DistrictInfoSection from "@/components/compliance/district/DistrictInfoSection";

const SafetyPolicy = () => {
  const { t } = useLocalization();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <DistrictInfoSection />
      
      <div className="mt-8">
        <PolicyHeader 
          title={t("safetyAndPrivacyPolicy")}
          description={t("safetyPolicyIntro")}
        />
        
        <PolicyTabs />
      </div>
    </div>
  );
};

export default SafetyPolicy;
