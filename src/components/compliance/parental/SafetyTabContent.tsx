
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <h3 className="font-medium flex items-center">
            {t("strictContentFiltering")}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Strict mode filters profanity, inappropriate language, and mature content
                    while preserving educational language learning vocabulary.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
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
      
      <div className="bg-amber-50 p-4 rounded-md">
        <h3 className="font-medium text-amber-700 flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Language Learning Safeguards
        </h3>
        <p className="text-sm text-amber-600 mt-1">
          Our filtering system is designed to avoid false positives in educational contexts, ensuring language learning vocabulary and phrases are preserved while still filtering out inappropriate content.
        </p>
      </div>
    </div>
  );
};

export default SafetyTabContent;
