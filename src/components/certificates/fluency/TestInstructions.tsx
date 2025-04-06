
import React from "react";
import { Info } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const TestInstructions = () => {
  const { currentLanguage, t } = useLocalization();
  
  // Determine the target language based on user's native language
  const getInstructions = () => {
    if (currentLanguage === "spanish" || currentLanguage === "portuguese" || 
        currentLanguage === "korean" || currentLanguage === "indonesian" || 
        currentLanguage === "turkish" || currentLanguage === "polish") {
      // For speakers of these languages learning English
      return (
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
          <li>{t("speakNaturallyInEnglish")}</li>
          <li>{t("answerTutorQuestions")}</li>
          <li>{t("keepConversationFlowing")}</li>
          <li>{t("listenCarefully")}</li>
          <li>{t("dontWorryAboutMistakes")}</li>
        </ul>
      );
    } else {
      // For English speakers learning other languages
      return (
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
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
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Info className="h-4 w-4 text-blue-500 mr-2" />
        <h3 className="text-sm font-medium">{t("testInstructions")}</h3>
      </div>
      {getInstructions()}
    </div>
  );
};

export default TestInstructions;
