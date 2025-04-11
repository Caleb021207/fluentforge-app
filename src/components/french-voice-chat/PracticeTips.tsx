
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeTips: React.FC = () => {
  const { currentLanguage, t } = useLocalization();

  const getPracticeTipsText = () => {
    if (currentLanguage === "english") {
      return "Use this tool to improve your speaking and listening skills. Here are some tips:";
    } else if (currentLanguage === "french") {
      return "Utilisez cet outil pour améliorer vos compétences en expression orale et en compréhension. Voici quelques conseils :";
    } else {
      return t("useThisTool") || "Use this tool to improve your speaking and listening skills. Here are some tips:";
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="font-medium mb-2">
        {currentLanguage === "french" ? "Pratiquer avec le chat vocal" : t("practiceWithVoiceChat")}
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        {getPracticeTipsText()}
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
        <li>{currentLanguage === "french" ? "Posez des questions sur des sujets quotidiens" : t("askQuestions")}</li>
        <li>{currentLanguage === "french" ? "Pratiquez des phrases et expressions courantes" : t("practiceCommonPhrases")}</li>
        <li>{currentLanguage === "french" ? "Décrivez ce que vous voyez autour de vous" : t("describeWhatYouSee")}</li>
        <li>{currentLanguage === "french" ? "Pratiquez le vocabulaire pour des sujets spécifiques comme les voyages ou la nourriture" : t("practiceVocabularyForSpecific")}</li>
      </ul>
    </div>
  );
};

export default PracticeTips;
