
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PolicyHeader from "@/components/compliance/policy/PolicyHeader";
import PolicyTabs from "@/components/compliance/policy/PolicyTabs";

const SafetyPolicy = () => {
  const { t } = useLocalization();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <PolicyHeader 
        title={t("safetyAndPrivacyPolicy") || "CIPA Compliance & Student Data Privacy Overview"}
        description={t("safetyPolicyIntro") || "Palavox is fully committed to providing a safe, age-appropriate, and educationally sound platform in compliance with the Children's Internet Protection Act (CIPA) and FERPA (Family Educational Rights and Privacy Act)."}
      />
      
      <PolicyTabs />
    </div>
  );
};

export default SafetyPolicy;
