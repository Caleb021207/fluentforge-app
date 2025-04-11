
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PolicyHeader from "@/components/compliance/policy/PolicyHeader";
import PolicyTabs from "@/components/compliance/policy/PolicyTabs";

const SafetyPolicy = () => {
  const { t } = useLocalization();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <PolicyHeader 
        title={t("safetyAndPrivacyPolicy") || "Palavox: CIPA, FERPA & Data Privacy Compliance Overview"}
        description={t("safetyPolicyIntro") || "Palavox is committed to protecting student safety and privacy in full compliance with the Children's Internet Protection Act (CIPA) and the Family Educational Rights and Privacy Act (FERPA). Our platform is designed for educational environments and prioritizes security, responsible data use, and appropriate content access."}
      />
      
      <PolicyTabs />
    </div>
  );
};

export default SafetyPolicy;
