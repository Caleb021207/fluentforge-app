
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeGuide: React.FC = () => {
  const { t, currentLanguage } = useLocalization();

  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-8">
      <h3 className="font-medium mb-2">{t("practiceWithTextChat")}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {currentLanguage === "arabic"
          ? "استخدم هذه الأداة لممارسة محادثات اللغة الإنجليزية النصية. يمكنك السؤال عن:"
          : currentLanguage === "mandarin"
            ? "使用此工具练习英语文本对话。您可以询问："
            : currentLanguage === "english" 
              ? "Use this tool to practice your Spanish text conversations. You can ask about:" 
              : currentLanguage === "spanish"
                ? "Utiliza esta herramienta para practicar tus conversaciones en inglés. Puedes preguntar sobre:"
                : currentLanguage === "portuguese"
                  ? "Use esta ferramenta para praticar suas conversas em inglês. Você pode perguntar sobre:"
                  : currentLanguage === "korean"
                    ? "이 도구를 사용하여 영어 텍스트 대화를 연습하세요. 다음과 같은 주제로 질문할 수 있습니다:"
                    : currentLanguage === "vietnamese"
                      ? "Sử dụng công cụ này để thực hành hội thoại tiếng Anh của bạn. Bạn có thể hỏi về:"
                    : "Use this tool to practice your conversations."}
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
