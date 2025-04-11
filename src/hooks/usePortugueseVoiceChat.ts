
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

export const usePortugueseVoiceChat = () => {
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  
  // Set a fixed CEFR level (B1 = Intermediate)
  const cefrLevel = 'B1';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // For Portuguese speakers learning English
  const native = "Portuguese";
  const target = "English";
  
  // Set this to true to ensure setCurrentLanguage is called with "portuguese"
  useEffect(() => {
    localStorage.setItem("currentLanguage", "portuguese");
  }, []);

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          // Portuguese speaker learning English
          userLanguage: 'portuguese',
          targetLanguage: 'english',
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: content,
        translation: translationText,
        timestamp: new Date()
      };
      
      setGptResponse(content);
      setTranslation(translationText);
      setConversationHistory(prev => [...prev, aiMessage]);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      setTranscript("");
    } catch (error) {
      console.error('Error getting GPT response:', error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationStarters = () => {
    // These phrases should be in English since Portuguese speakers are practicing English
    const targetLanguagePhrases = [
      "Hello, how are you today?",
      "What's the weather like where you are?",
      "Can you recommend a good restaurant?",
      "What are your hobbies and interests?",
      "I would like to practice my pronunciation.",
      "Could you help me with grammar?",
      "Tell me about yourself.",
      "What time is it?"
    ];
    
    // These are Portuguese phrases since the user is a Portuguese speaker
    const nativeLanguagePhrases = [
      "Olá, como está hoje?",
      "Como está o tempo onde você está?",
      "Pode recomendar um bom restaurante?",
      "Quais são os seus passatempos e interesses?",
      "Eu gostaria de praticar minha pronúncia.",
      "Você poderia me ajudar com gramática?",
      "Fale-me sobre você.",
      "Que horas são?"
    ];
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  return {
    transcript,
    setTranscript,
    gptResponse,
    translation,
    isLoading,
    conversationHistory,
    handleSendTranscript,
    clearConversation,
    getConversationStarters
  };
};
