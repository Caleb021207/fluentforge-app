
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
          userLanguage: currentLanguage 
        }
      });

      if (error) {
        throw error;
      }
      
      // Ensure we always have a translation for non-English languages
      let translation = data.translation || "";
      
      // If no translation was provided but one is expected, make note of it
      if (!translation && currentLanguage !== "english") {
        console.log("No translation provided for response in language:", currentLanguage);
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
          userLanguage: currentLanguage
        }
      });

      if (error) {
        throw error;
      }

      console.log('Response from AI tutor:', data);
      
      // If we explicitly need translations for certain languages, log that information
      if (currentLanguage === "mandarin" && !data.translation) {
        console.warn("Missing translation for Mandarin user");
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: data.translation || "",
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
    if (currentLanguage === "spanish") {
      return "Escribe tu mensaje en español o inglés...";
    } else if (currentLanguage === "portuguese") {
      return "Digite sua mensagem em português ou inglês...";
    } else if (currentLanguage === "korean") {
      return "한국어 또는 영어로 메시지를 입력하세요...";
    } else if (currentLanguage === "arabic") {
      return "اكتب رسالتك بالعربية أو الإنجليزية...";
    } else if (currentLanguage === "mandarin") {
      return "用中文或英语输入您的消息...";
    } else {
      return "Type your message in English or Spanish...";
    }
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
