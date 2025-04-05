
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeGuide: React.FC = () => {
  const { t, currentLanguage } = useLocalization();
  
  const getPracticeTipsText = () => {
    if (currentLanguage === "english") {
      return "Use this tool to improve your speaking and listening skills. Here are some tips:";
    } else if (currentLanguage === "spanish") {
      return "Utiliza esta herramienta para mejorar tus habilidades de habla y escucha. Aquí hay algunos consejos:";
    } else if (currentLanguage === "portuguese") {
      return "Use esta ferramenta para melhorar suas habilidades de fala e escuta. Aqui estão algumas dicas:";
    } else if (currentLanguage === "arabic") {
      return "استخدم هذه الأداة لتحسين مهارات التحدث والاستماع. إليك بعض النصائح:";
    } else if (currentLanguage === "mandarin") {
      return "使用此工具提高口语和听力技能。以下是一些提示：";
    } else if (currentLanguage === "vietnamese") {
      return "Sử dụng công cụ này để cải thiện kỹ năng nói và nghe của bạn. Dưới đây là một số mẹo:";
    } else if (currentLanguage === "french") {
      return "Utilisez cet outil pour améliorer vos compétences en expression orale et en compréhension. Voici quelques conseils :";
    } else if (currentLanguage === "japanese") {
      return "このツールを使用してスピーキングとリスニングのスキルを向上させましょう。いくつかのヒント：";
    } else if (currentLanguage === "russian") {
      return "Используйте этот инструмент для улучшения разговорных и слуховых навыков. Вот несколько советов:";
    }
    return t("practiceLanguageTips");
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="font-medium mb-2">{t("practiceWithVoiceChat")}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {getPracticeTipsText()}
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
        <li>{t("askQuestionsAboutTopics")}</li>
        <li>{t("practiceEverydayPhrases")}</li>
        <li>{t("describeImagesOrScenes")}</li>
        <li>{t("practiceVocabularyForSpecificTopics")}</li>
      </ul>
    </div>
  );
};

export default PracticeGuide;
