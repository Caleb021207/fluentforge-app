
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeInfoPanel = () => {
  const { t } = useLocalization();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t("voiceChat")}</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Practice speaking and listening by having real-time conversations with AI. 
        Improve your pronunciation and comprehension skills naturally.
      </p>
      <p className="text-xs text-muted-foreground max-w-md">
        We use OpenAI's GPT-4o-mini for natural language understanding and generation, 
        and your browser's built-in speech synthesis for voice responses.
      </p>
    </div>
  );
};

export default PracticeInfoPanel;
