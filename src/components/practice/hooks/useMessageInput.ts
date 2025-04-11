
import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { useNavigate } from "react-router-dom";

export const useMessageInput = (targetLanguage?: string) => {
  const [input, setInput] = useState("");
  const { currentLanguage } = useLocalization();
  const navigate = useNavigate();
  
  // Check if we should redirect to the French or Portuguese voice chat
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Get target language from props or localStorage
    const savedTargetLanguage = targetLanguage || localStorage.getItem("targetLanguage");
    
    if (currentPath === "/voice-chat") {
      if (
        // For English speakers targeting French
        (currentLanguage === "english" && savedTargetLanguage?.toLowerCase() === "french") ||
        // For Spanish speakers targeting French
        (currentLanguage === "spanish" && savedTargetLanguage?.toLowerCase() === "french") ||
        // For French speakers (they always go to French voice chat)
        (currentLanguage === "french")
      ) {
        console.log("Redirecting to French voice chat from useMessageInput");
        navigate("/french-voice-chat");
      } else if (
        // For English speakers targeting Portuguese
        (currentLanguage === "english" && savedTargetLanguage?.toLowerCase() === "portuguese") ||
        // For Spanish speakers targeting Portuguese
        (currentLanguage === "spanish" && savedTargetLanguage?.toLowerCase() === "portuguese") ||
        // For Portuguese speakers (they always go to Portuguese voice chat)
        (currentLanguage === "portuguese")
      ) {
        console.log("Redirecting to Portuguese voice chat from useMessageInput");
        navigate("/portuguese-voice-chat");
      }
    }
  }, [currentLanguage, targetLanguage, navigate]);

  const getPlaceholderText = () => {
    // Get saved target language from localStorage if not provided
    const savedTargetLanguage = targetLanguage || localStorage.getItem("targetLanguage");
    
    // For English speakers, use the specified target language
    if (currentLanguage === "english") {
      // If savedTargetLanguage is provided, use it; otherwise, default to Spanish
      const practiceLanguageName = savedTargetLanguage 
        ? getLanguageDisplayName(savedTargetLanguage.toLowerCase())
        : "Spanish";
        
      return `Type your message in English or ${practiceLanguageName}...`;
    }
    
    // For non-English speakers
    const languagePlaceholders: Record<string, string> = {
      'spanish': "Escribe tu mensaje en español o inglés...",
      'portuguese': "Digite sua mensagem em português ou inglês...",
      'french': "Tapez votre message en français ou en anglais...",
      'japanese': "日本語または英語でメッセージを入力してください...",
      'russian': "Введите ваше сообщение на русском или английском...",
      'korean': "한국어 또는 영어로 메시지를 입력하세요...",
      'arabic': "اكتب رسالتك باللغة العربية أو الإنجليزية...",
      'mandarin': "用中文或英文输入您的信息...",
      'vietnamese': "Nhập tin nhắn của bạn bằng tiếng Việt hoặc tiếng Anh...",
      'ukrainian': "Введіть ваше повідомлення українською або англійською мовою...",
      'hindi': "अपना संदेश हिंदी या अंग्रेजी में टाइप करें...",
      'indonesian': "Ketik pesan Anda dalam bahasa Indonesia atau Inggris..."
    };
    
    return languagePlaceholders[currentLanguage] || "Type your message...";
  };

  return {
    input,
    setInput,
    getPlaceholderText
  };
};
