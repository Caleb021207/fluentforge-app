
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PolicyHeader from "@/components/compliance/policy/PolicyHeader";
import PolicyTabs from "@/components/compliance/policy/PolicyTabs";

const SafetyPolicy = () => {
  const { t } = useLocalization();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <PolicyHeader 
        title={t("safetyAndPrivacyPolicy")}
        description={t("safetyPolicyIntro") || "Our commitment to providing a safe, secure, and privacy-focused learning environment"}
      />
      
      <PolicyTabs />
    </div>
  );
};

export default SafetyPolicy;
