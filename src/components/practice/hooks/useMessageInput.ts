
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

export const useMessageInput = () => {
  const [input, setInput] = useState("");
  const { t, currentLanguage } = useLocalization();

  const getPlaceholderText = () => {
    // Get correct language pair
    const { native, practice } = getLanguagePair(currentLanguage);
    
    const placeholders: Record<string, string> = {
      english: `Type your message in English or ${practice}...`,
      spanish: "Escribe tu mensaje en español o inglés...",
      portuguese: "Digite sua mensagem em português ou inglês...",
      french: "Tapez votre message en français ou en anglais...",
      korean: "한국어 또는 영어로 메시지를 입력하세요...",
      arabic: "اكتب رسالتك بالعربية أو الإنجليزية...",
      mandarin: "用中文或英语输入您的消息...",
      vietnamese: "Nhập tin nhắn của bạn bằng tiếng Việt hoặc tiếng Anh...",
      japanese: "日本語または英語でメッセージを入力してください...",
      ukrainian: "Введіть ваше повідомлення українською або англійською мовою...",
      russian: "Введите ваше сообщение на русском или английском языке...",
      hindi: "अपना संदेश हिंदी या अंग्रेजी में टाइप करें...",
      indonesian: "Ketik pesan Anda dalam bahasa Indonesia atau Inggris...",
    };

    if (placeholders[currentLanguage]) {
      return placeholders[currentLanguage];
    }
    
    return t("typeMessage");
  };

  return {
    input,
    setInput,
    getPlaceholderText
  };
};
