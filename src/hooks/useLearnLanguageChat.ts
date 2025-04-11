
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import englishTranslations from "@/translations/english";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

export const useLearnLanguageChat = (targetLanguage: string) => {
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
  
  // For English speakers learning another language
  const native = "English";
  const target = targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1);

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
          // User is English speaker learning target language
          userLanguage: 'english',
          targetLanguage: targetLanguage.toLowerCase(),
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
    // These phrases should match the language being learned
    const targetLanguagePhrases = getPhrasesForLanguage(targetLanguage.toLowerCase());
    
    // These are English phrases since the user is an English speaker
    const nativeLanguagePhrases = [
      "Hello, how are you today?",
      "What's the weather like where you are?",
      "Can you recommend a good restaurant?",
      "What are your hobbies and interests?",
      "I would like to practice my pronunciation.",
      "Could you help me with grammar?",
      "Tell me about yourself.",
      "What time is it?"
    ];
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  // Helper function to get phrases in the target language
  const getPhrasesForLanguage = (language: string): string[] => {
    if (language === 'french') {
      return [
        "Bonjour, comment allez-vous aujourd'hui?",
        "Quel temps fait-il chez vous?",
        "Pouvez-vous recommander un bon restaurant?",
        "Quels sont vos passe-temps et centres d'intérêt?",
        "Je voudrais pratiquer ma prononciation.",
        "Pourriez-vous m'aider avec la grammaire?",
        "Parlez-moi de vous.",
        "Quelle heure est-il?"
      ];
    } else if (language === 'portuguese') {
      return [
        "Olá, como está hoje?",
        "Como está o tempo onde você está?",
        "Pode recomendar um bom restaurante?",
        "Quais são os seus passatempos e interesses?",
        "Eu gostaria de praticar minha pronúncia.",
        "Você poderia me ajudar com gramática?",
        "Fale-me sobre você.",
        "Que horas são?"
      ];
    } else if (language === 'spanish') {
      return [
        "Hola, ¿cómo estás hoy?",
        "¿Cómo está el clima donde estás?",
        "¿Puedes recomendar un buen restaurante?",
        "¿Cuáles son tus pasatiempos e intereses?",
        "Me gustaría practicar mi pronunciación.",
        "¿Podrías ayudarme con la gramática?",
        "Háblame de ti.",
        "¿Qué hora es?"
      ];
    } else {
      // Default to English phrases if language not supported
      return [
        "Hello, how are you today?",
        "What's the weather like where you are?",
        "Can you recommend a good restaurant?",
        "What are your hobbies and interests?",
        "I would like to practice my pronunciation.",
        "Could you help me with grammar?",
        "Tell me about yourself.",
        "What time is it?"
      ];
    }
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
