
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface DataFixPromptProps {
  show: boolean;
  isFixing: boolean;
  onFix: () => Promise<void>;
}

const DataFixPrompt = ({ show, isFixing, onFix }: DataFixPromptProps) => {
  const { t } = useLocalization();

  if (!show) return null;

  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-row items-center justify-between">
        <span>{t("incompleteLanguageData")}</span>
        <Button 
          onClick={onFix} 
          disabled={isFixing}
          variant="outline" 
          size="sm"
          className="ml-4"
        >
          {isFixing ? t("fixing") : t("fixData")}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DataFixPrompt;
