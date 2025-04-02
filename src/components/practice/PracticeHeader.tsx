
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeHeader: React.FC = () => {
  const { t, currentLanguage } = useLocalization();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("textPractice")}
      </h1>
      <p className="text-gray-600 mb-4">
        {currentLanguage === "arabic" 
          ? t("chatWithAITutor")
          : currentLanguage === "mandarin" 
            ? `与我们的AI导师聊天，通过文本对话练习英语！AI将帮助您纠正语法、词汇和用法。请随时询问有关语言或文化的问题。`
            : currentLanguage === "vietnamese"
              ? `Trò chuyện với gia sư AI của chúng tôi để luyện tập tiếng Anh thông qua các cuộc hội thoại bằng văn bản! AI sẽ giúp bạn sửa ngữ pháp, từ vựng và cách sử dụng. Hãy thoải mái đặt câu hỏi về ngôn ngữ hoặc văn hóa.`
              : currentLanguage === "english" 
                ? `Chat with our AI tutor to practice your Spanish through text conversations! The AI will help correct your grammar, vocabulary, and usage. Feel free to ask questions about language or culture.`
                : currentLanguage === "spanish"
                  ? `¡Chatea con nuestro tutor de IA para practicar tu inglés a través de conversaciones de texto! La IA te ayudará a corregir tu gramática, vocabulario y uso. No dudes en hacer preguntas sobre el idioma o la cultura.`
                  : currentLanguage === "portuguese"
                    ? `Converse com nosso tutor de IA para praticar seu inglês através de conversas de texto! A IA ajudará a corrigir sua gramática, vocabulário e uso. Sinta-se à vontade para fazer perguntas sobre idioma ou cultura.`
                    : currentLanguage === "korean"
                      ? `AI 튜터와 채팅하여 영어를 연습해보세요! AI가 문법, 어휘, 발음을 교정하는 데 도움을 줄 것입니다. 언어나 문화에 대한 질문을 자유롭게 해보세요.`
                    : `Chat with our AI tutor to practice your language skills through text conversations!`}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {t("noticeTextBasedPractice")}
        </p>
      </div>
    </div>
  );
};

export default PracticeHeader;
