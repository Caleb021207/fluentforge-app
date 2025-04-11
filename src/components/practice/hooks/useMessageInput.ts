
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";

export const useMessageInput = () => {
  const [input, setInput] = useState("");
  const { t, currentLanguage } = useLocalization();

  const getPlaceholderText = () => {
    if (currentLanguage === "english") {
      return "Type your message in English or Spanish...";
    } else if (currentLanguage === "japanese") {
      return "英語または日本語でメッセージを入力してください...";
    } else if (currentLanguage === "russian") {
      return "Введите сообщение на английском или русском...";
    } else if (currentLanguage === "french") {
      return "Tapez votre message en anglais ou français...";
    } else if (currentLanguage === "hindi") {
      return "अंग्रेजी या हिंदी में अपना संदेश टाइप करें...";
    } else if (currentLanguage === "indonesian") {
      return "Ketikkan pesan Anda dalam bahasa Inggris atau Indonesia...";
    } else if (currentLanguage === "korean") {
      return "영어나 한국어로 메시지를 입력하세요...";
    } else if (currentLanguage === "arabic") {
      return "اكتب رسالتك باللغة الإنجليزية أو العربية...";
    } else if (currentLanguage === "mandarin") {
      return "用英语或中文输入您的消息...";
    } else if (currentLanguage === "vietnamese") {
      return "Nhập tin nhắn của bạn bằng tiếng Anh hoặc tiếng Việt...";
    } else if (currentLanguage === "ukrainian") {
      return "Введіть повідомлення англійською або українською...";
    }
    return t("typeMessage") || "Type your message...";
  };

  return {
    input,
    setInput,
    getPlaceholderText
  };
};
