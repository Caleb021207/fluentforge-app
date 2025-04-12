
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, AlertTriangle, Info, Lock } from "lucide-react";
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
          <p className="text-sm text-gray-500">{t("strictContentFilteringDescription") || "Provides stronger content filtering appropriate for children and educational settings."}</p>
        </div>
        <Switch 
          checked={safetyMode === 'strict'} 
          onCheckedChange={onSafeModeChange}
        />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-medium text-blue-700 flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          {t("cipaCompliance") || "CIPA Compliance"}
        </h3>
        <p className="text-sm text-blue-600 mt-1">
          {t("cipaComplianceShortDesc") || "Strict content filtering complies with the Children's Internet Protection Act (CIPA) requirements for filtering inappropriate content in educational settings. This ensures all learning materials are age-appropriate and safe for classroom use."}
        </p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-md">
        <h3 className="font-medium text-amber-700 flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          {t("languageLearningCaution") || "Language Learning Safeguards"}
        </h3>
        <p className="text-sm text-amber-600 mt-1">
          {t("languageLearningCautionDesc") || "Our intelligent filtering system is designed to recognize educational context, ensuring language learning vocabulary is preserved while still filtering inappropriate content. This prevents overly-aggressive blocking that could interfere with legitimate learning materials."}
        </p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-md">
        <h3 className="font-medium text-green-700 flex items-center">
          <Lock className="mr-2 h-4 w-4" />
          {t("parentalPin") || "Parental PIN Protection"}
        </h3>
        <p className="text-sm text-green-600 mt-1">
          {t("parentalPinDesc") || "Safety settings are protected by a PIN code to prevent children from changing them without adult supervision. The default PIN is 0000 if you haven't set a custom one. We recommend changing this PIN to a unique number that only authorized adults know."}
        </p>
      </div>
    </div>
  );
};

export default SafetyTabContent;
