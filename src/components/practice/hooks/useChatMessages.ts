
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

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
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: promptText,
          userLanguage: currentLanguage,
          requestTranslation: true // Explicitly request translation
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Response with translation check:', data);
      
      // Ensure we always have a translation for all languages
      let translation = data.translation || "";
      
      // If no translation was provided but one is expected, make note of it and try to get one
      if (!translation) {
        console.log("No translation provided for response in language:", currentLanguage);
        
        // For English users, we want Spanish translations
        // For non-English users, we want translations in their native language
        const targetLanguage = currentLanguage === "english" ? "spanish" : currentLanguage;
        
        try {
          // Try to get a translation manually if none was provided
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: data.content,
              userLanguage: targetLanguage,
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
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: translation,
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

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: input,
          userLanguage: currentLanguage,
          requestTranslation: true // Explicitly request translation
        }
      });

      if (error) {
        throw error;
      }

      console.log('Response from AI tutor:', data);
      
      // Ensure we always have a translation
      let translation = data.translation || "";
      
      // If no translation was provided, try to get one
      if (!translation) {
        console.warn("Missing translation for", currentLanguage, "user");
        
        // For English users, we want Spanish translations
        // For non-English users, we want translations in their native language
        const targetLanguage = currentLanguage === "english" ? "spanish" : currentLanguage;
        
        try {
          // Try to get a translation manually if none was provided
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: data.content,
              userLanguage: targetLanguage,
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
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: translation,
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
    getPlaceholderText: () => {
      if (currentLanguage === "english") {
        return "Type your message in English or Spanish...";
      } else if (currentLanguage === "japanese") {
        return "英語または日本語でメッセージを入力してください...";
      }
      return t("typeMessage") || "Type your message...";
    }
  };
};
