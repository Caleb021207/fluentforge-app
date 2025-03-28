
import React from "react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface TestStartPromptProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  microphoneAccess: boolean;
  onStart: () => void;
}

const TestStartPrompt = ({
  isLoading,
  isLoggedIn,
  microphoneAccess,
  onStart
}: TestStartPromptProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <p className="text-gray-500 mb-4">{t("readyToTest")}</p>
      <Button 
        onClick={onStart} 
        disabled={isLoading || !isLoggedIn || !microphoneAccess}
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
