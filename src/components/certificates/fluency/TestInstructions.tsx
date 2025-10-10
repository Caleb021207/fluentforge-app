
import React from "react";
import { Info } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const TestInstructions = () => {
  const { currentLanguage, t } = useLocalization();
  
  // Determine the target language based on user's native language
  const getInstructions = () => {
    if (currentLanguage === "spanish" || currentLanguage === "portuguese" || 
        currentLanguage === "korean" || currentLanguage === "indonesian") {
      // For Spanish/Portuguese/Korean/Indonesian speakers learning English
      return (
        <ul className="text-base md:text-lg text-gray-600 space-y-2 pl-6 list-disc">
          <li>{t("speakNaturallyInEnglish")}</li>
          <li>{t("answerTutorQuestions")}</li>
          <li>{t("keepConversationFlowing")}</li>
          <li>{t("listenCarefully")}</li>
          <li>{t("dontWorryAboutMistakes")}</li>
        </ul>
      );
    } else {
      // For English speakers learning Spanish/Portuguese/Korean/Indonesian
      return (
        <ul className="text-base md:text-lg text-gray-600 space-y-2 pl-6 list-disc">
          <li>{t("speakNaturallyInTargetLanguage")}</li>
          <li>{t("answerTutorQuestions")}</li>
          <li>{t("keepConversationFlowing")}</li>
          <li>{t("listenCarefully")}</li>
          <li>{t("dontWorryAboutMistakes")}</li>
        </ul>
      );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center mb-3">
        <Info className="h-6 w-6 text-blue-500 mr-3" />
        <h3 className="text-lg md:text-xl font-medium">{t("testInstructions")}</h3>
      </div>
      {getInstructions()}
    </div>
  );
};

export default TestInstructions;
