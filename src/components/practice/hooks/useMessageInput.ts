import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";

export const useMessageInput = () => {
  const [input, setInput] = useState("");
  const { t, currentLanguage } = useLocalization();

  const getPlaceholderText = () => {
    const placeholders: Record<string, string> = {
      english: "Type your message in English or Spanish...",
      spanish: "Escribe tu mensaje en español o inglés...",
      portuguese: "Digite sua mensagem em português ou inglês...",
      korean: "한국어 또는 영어로 메시지를 입력하세요...",
      arabic: "اكتب رسالتك بالعربية أو الإنجليزية...",
      mandarin: "用中文或英语输入您的消息...",
      vietnamese: "Nhập tin nhắn của bạn bằng tiếng Việt hoặc tiếng Anh...",
      japanese: "日本語または英語でメッセージを入力してください...",
      ukrainian: "Введіть ваше повідомлення українською або англійською мовою...",
      russian: "Введите ваше сообщение на русском или английском языке...",
      hindi: "अपना संदेश हिंदी या अंग्रेजी में टाइप करें...",
      indonesian: "Ketik pesan Anda dalam bahasa Indonesia atau Inggris...",
      french: "Tapez votre message en français ou en anglais...",
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
