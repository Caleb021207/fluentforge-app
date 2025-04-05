
import React from "react";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface PracticePromptButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const PracticePromptButton: React.FC<PracticePromptButtonProps> = ({ onClick, isLoading }) => {
  const { t, currentLanguage } = useLocalization();

  return (
    <div className="flex justify-center mb-8">
      <Button onClick={onClick} disabled={isLoading} className="bg-lingua-primary w-full sm:w-auto">
        <Book className="h-4 w-4 mr-2" />
        {currentLanguage === "arabic"
          ? t("sendEnglishPracticePrompt")
          : currentLanguage === "mandarin"
            ? "发送英语练习提示"
            : currentLanguage === "english" 
              ? "Send Spanish Practice Prompt" 
              : currentLanguage === "spanish"
                ? "Enviar mensaje de práctica en inglés"
                : currentLanguage === "portuguese"
                  ? "Enviar mensagem de prática em inglês"
                  : currentLanguage === "korean"
                    ? "영어 연습 메시지 보내기"
                    : currentLanguage === "vietnamese"
                      ? "Gửi gợi ý thực hành tiếng Anh"
                    : currentLanguage === "japanese"
                      ? "英語練習プロンプトを送信"
                    : currentLanguage === "russian"
                      ? "Отправить задание для практики английского"
                    : "Send Practice Prompt"}
      </Button>
    </div>
  );
};

export default PracticePromptButton;
