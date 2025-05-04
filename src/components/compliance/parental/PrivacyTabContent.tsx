
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { BookOpen } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import FerpaPrivacySettings from "../FerpaPrivacySettings";

interface PrivacyTabContentProps {
  parentalDataConsent: boolean;
  onParentalDataConsentChange: (checked: boolean) => void;
}

const PrivacyTabContent: React.FC<PrivacyTabContentProps> = ({
  parentalDataConsent,
  onParentalDataConsentChange
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t("parentalDataConsent") || "Educational Data Consent (FERPA)"}</h3>
          <p className="text-sm text-gray-500">
            {t("parentalDataConsentDesc") || "As a parent or guardian, you can control whether your child's educational data can be collected and processed"}
          </p>
        </div>
        <Switch 
          checked={parentalDataConsent} 
          onCheckedChange={onParentalDataConsentChange}
        />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-medium text-blue-700 flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          {t("ferpaCompliance") || "FERPA Compliance"}
        </h3>
        <p className="text-sm text-blue-600 mt-1">
          {t("ferpaComplianceShortDesc") || "The Family Educational Rights and Privacy Act (FERPA) gives parents certain rights with respect to their children's educational records. These rights transfer to the student at age 18."}
        </p>
      </div>
      
      <FerpaPrivacySettings />
    </div>
  );
};

export default PrivacyTabContent;
