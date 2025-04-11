
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

export const useFrenchVoiceChat = () => {
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  
  const cefrLevel = 'B1';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // For French speakers learning English
  const native = "French";
  const target = "English";
  
  // Set this to true to ensure setCurrentLanguage is called with "french"
  useEffect(() => {
    localStorage.setItem("currentLanguage", "french");
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
          // French speaker learning English
          userLanguage: 'french',
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
    // These phrases should be in English since French speakers are practicing English
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
    
    // These are French phrases since the user is a French speaker
    const nativeLanguagePhrases = [
      "Bonjour, comment allez-vous aujourd'hui?",
      "Quel temps fait-il chez vous?",
      "Pouvez-vous recommander un bon restaurant?",
      "Quels sont vos passe-temps et centres d'intérêt?",
      "Je voudrais pratiquer ma prononciation.",
      "Pourriez-vous m'aider avec la grammaire?",
      "Parlez-moi de vous.",
      "Quelle heure est-il?"
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
