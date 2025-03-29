
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocalization } from "@/context/LocalizationContext";

export interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TestStartPromptProps {
  isLoading?: boolean;
  isLoggedIn?: boolean;
  microphoneAccess?: boolean;
  onStart: () => void;
  languagePair?: LanguagePair;
}

const TestStartPrompt = ({
  isLoading = false,
  isLoggedIn = false,
  microphoneAccess = false,
  onStart,
  languagePair
}: TestStartPromptProps) => {
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);
  const { t } = useLocalization();
  
  useEffect(() => {
    const hasStudyMaterials = sessionStorage.getItem("hasStudyMaterials") === "true";
    setHasStudyMaterials(hasStudyMaterials);
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <p className="text-gray-500 mb-4">{t("readyToTest")}</p>
      
      {!hasStudyMaterials && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t("thisTestNotAvailable")}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={onStart} 
        disabled={isLoading || !isLoggedIn || !microphoneAccess || !hasStudyMaterials}
        className="bg-blue-500 hover:bg-blue-600"
      >
        {isLoading ? t("processing") : t("startTest")}
      </Button>
      
      {!isLoggedIn && (
        <p className="text-sm text-red-400 mt-3">{t("pleaseLoginToTakeTest")}</p>
      )}
      {!microphoneAccess && (
        <p className="text-sm text-red-400 mt-3">{t("microphoneAccessRequired")}</p>
      )}
    </div>
  );
};

export default TestStartPrompt;
