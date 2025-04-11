
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ConsentToggleProps {
  consentGiven: boolean;
  onConsentChange: (checked: boolean) => void;
}

const ConsentToggle = ({ consentGiven, onConsentChange }: ConsentToggleProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">{t("dataConsent") || "Educational Data Consent"}</h3>
        <p className="text-sm text-gray-500">
          {t("dataConsentDescription") || "Allow this application to collect and process your educational data for learning purposes"}
        </p>
      </div>
      <Switch 
        checked={consentGiven} 
        onCheckedChange={onConsentChange}
      />
    </div>
  );
};

export default ConsentToggle;
