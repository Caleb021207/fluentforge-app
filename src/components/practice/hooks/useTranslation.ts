
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for managing translations in the chat
 */
export const useTranslation = () => {
  const { currentLanguage } = useLocalization();

  /**
   * Get translation for a message
   */
  const getTranslation = async (content: string): Promise<string> => {
    // Determine target language
    const targetLanguage = currentLanguage === "english" ? "spanish" : currentLanguage;
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: content,
          userLanguage: targetLanguage,
          requestType: 'translation'
        }
      });
      
      if (!error && data && data.translation) {
        console.log("Got translation:", data.translation);
        return data.translation;
      }
    } catch (error) {
      console.error("Failed to get translation:", error);
    }
    
    return "";
  };

  /**
   * Get placeholder text based on current language
   */
  const getPlaceholderText = (): string => {
    if (currentLanguage === "english") {
      return "Type your message in English or Spanish...";
    } else if (currentLanguage === "spanish") {
      return "Escribe tu mensaje en inglés o español...";
    } else if (currentLanguage === "portuguese") {
      return "Digite sua mensagem em inglês ou português...";
    } else if (currentLanguage === "korean") {
      return "영어 또는 한국어로 메시지를 입력하세요...";
    } else if (currentLanguage === "arabic") {
      return "اكتب رسالتك بالإنجليزية أو العربية...";
    } else if (currentLanguage === "mandarin") {
      return "用英语或中文输入您的消息...";
    } else if (currentLanguage === "vietnamese") {
      return "Nhập tin nhắn của bạn bằng tiếng Anh hoặc tiếng Việt...";
    } else if (currentLanguage === "french") {
      return "Tapez votre message en anglais ou français...";
    } else if (currentLanguage === "japanese") {
      return "英語または日本語でメッセージを入力してください...";
    } else if (currentLanguage === "russian") {
      return "Введите сообщение на английском или русском...";
    }
    return "Type your message...";
  };

  return {
    getTranslation,
    getPlaceholderText,
    currentLanguage
  };
};
