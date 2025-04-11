import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { containsScript } from "@/utils/languageUtils";
import { filterContent, isSafeContent, logDataAccess } from "@/utils/contentSafetyUtils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  const sendLanguageLearningPrompt = () => {
    let prompt = "";
    
    if (currentLanguage === "english") {
      prompt = "¡Hola! Quiero practicar español contigo.";
    } else if (currentLanguage === "spanish") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "portuguese") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "korean") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "arabic") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "mandarin") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "vietnamese") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "french") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "japanese") {
      prompt = "こんにちは！英語を練習したいと思います！";
    } else if (currentLanguage === "russian") {
      prompt = "Здравствуйте! Я хочу попрактиковаться в английском с вами!";
    } else if (currentLanguage === "ukrainian") {
      prompt = "Привіт! Я хочу попрактикуватися в англійській з вами!";
    } else if (currentLanguage === "hindi") {
      prompt = "नमस्ते! मैं आपके साथ अंग्रेजी का अभ्यास करना चाहता हूँ!";
    } else if (currentLanguage === "indonesian") {
      prompt = "Halo! Saya ingin berlatih bahasa Inggris dengan Anda!";
    }

    if (prompt) {
      const userMessage: ChatMessage = {
        role: "user",
        content: prompt,
      };

      setMessages((prev) => [...prev, userMessage]);
      handleSendPrompt(prompt);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!isSafeContent(promptText)) {
      const filteredPrompt = filterContent(promptText);
      
      toast({
        title: t("contentFiltered"),
        description: t("contentFilteredDescription"),
        variant: "warning",
      });
      
      promptText = filteredPrompt;
    }
    
    setIsLoading(true);

    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: promptText,
          userLanguage: currentLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Response with translation check:', data);
      
      let translation = data.translation || "";
      
      if (currentLanguage === "hindi" && !containsScript(translation, "devanagari")) {
        console.log("Hindi translation doesn't contain Devanagari script, requesting specific translation");
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: data.content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translation = translationData.translation;
            console.log("Got Hindi translation with Devanagari script:", translation);
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
        }
      } 
      else if (!translation && currentLanguage !== "english") {
        console.log("No translation provided for response in language:", currentLanguage);
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: data.content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translation = translationData.translation;
            console.log("Got translation manually:", translation);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      const safeContent = filterContent(data.content);
      const safeTranslation = filterContent(translation);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: safeContent,
        translation: safeTranslation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const isSafe = isSafeContent(input);
    let processedInput = input;
    
    if (!isSafe) {
      processedInput = filterContent(input);
      
      toast({
        title: t("contentFiltered"),
        description: t("contentFilteredDescription"),
        variant: "warning",
      });
    }
    
    const userMessage: ChatMessage = {
      role: "user",
      content: processedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: processedInput,
          userLanguage: currentLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        throw error;
      }

      console.log('Response from AI tutor:', data);
      
      let translation = data.translation || "";
      
      if (currentLanguage === "hindi" && !containsScript(translation, "devanagari")) {
        console.log("Hindi translation does not contain Devanagari script, requesting specific translation");
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: data.content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translation = translationData.translation;
            console.log("Got Hindi translation with Devanagari script:", translation);
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
        }
      }
      else if (!translation && currentLanguage !== "english") {
        console.warn("Missing translation for", currentLanguage, "user");
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: data.content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translation = translationData.translation;
            console.log("Got translation manually:", translation);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      const safeContent = filterContent(data.content);
      const safeTranslation = filterContent(translation);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: safeContent,
        translation: safeTranslation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    sendLanguageLearningPrompt,
    handleSendPrompt,
    handleSubmit,
    getPlaceholderText
  };
};
