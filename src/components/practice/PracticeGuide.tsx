
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeGuide: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-8">
      <h3 className="font-medium mb-2">{t("practiceWithTextChat")}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {t("chatWithAITutor")}
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
        <li>{t("askAboutGrammarRules")}</li>
        <li>{t("practiceConversationsDifferentSituations")}</li>
        <li>{t("learnNewVocabulary")}</li>
        <li>{t("discussCulturalTopics")}</li>
      </ul>
    </div>
  );
};

export default PracticeGuide;
