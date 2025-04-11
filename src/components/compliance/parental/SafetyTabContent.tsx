
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SafetyTabContentProps {
  safetyMode: 'strict' | 'standard';
  onSafeModeChange: (checked: boolean) => void;
}

const SafetyTabContent: React.FC<SafetyTabContentProps> = ({ 
  safetyMode, 
  onSafeModeChange 
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t("strictContentFiltering")}</h3>
          <p className="text-sm text-gray-500">{t("strictContentFilteringDescription")}</p>
        </div>
        <Switch 
          checked={safetyMode === 'strict'} 
          onCheckedChange={onSafeModeChange}
        />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-medium text-blue-700 flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          {t("cipaCompliance")}
        </h3>
        <p className="text-sm text-blue-600 mt-1">
          {t("cipaComplianceShortDesc") || "Strict content filtering complies with the Children's Internet Protection Act (CIPA) requirements for filtering inappropriate content in educational settings."}
        </p>
      </div>
    </div>
  );
};

export default SafetyTabContent;
