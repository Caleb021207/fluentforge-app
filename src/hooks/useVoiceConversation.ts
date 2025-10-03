
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import { getLanguagePair } from "@/utils/languageUtils";
import { Message } from "@/types/chat";

type ConversationMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: string;
  timestamp: Date;
};

export const useVoiceConversation = (conversationLevel: string = "intermediate", correctGrammar: boolean = false) => {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: 'user' | 'assistant' | 'system'; content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const sessionIdRef = useRef<string | null>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);
  const { analyzeConversation } = useLanguageAnalysis();

  // Initialize the session ID
  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  const sendMessage = async (text: string, speakResponse: (text: string) => void) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      // Make it clear which language we're practicing
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: text,
          userLanguage: native || currentLanguage,
          targetLanguage: practice || 'english',
          conversationHistory: apiConversationHistory,
          conversationLevel: conversationLevel,
          correctGrammar: correctGrammar,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      console.log("Chat response:", data);
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText && currentLanguage === "hindi") {
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got translation:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: content,
        translation: translationText,
        timestamp: new Date()
      };
      
      setGptResponse(content);
      setTranslation(translationText);
      setConversationHistory(prev => [...prev, aiMessage]);
      
      const updatedHistory = [
        ...apiConversationHistory,
        { role: 'user' as const, content: text },
        { role: 'assistant' as const, content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ];
      
      setApiConversationHistory(data.updatedHistory || updatedHistory);
      
      // Extract conversational content only (before grammar note) for TTS
      const ttsContent = content.split(/\n\n?📝/)[0].trim();
      speakResponse(ttsContent);
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

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  const handleAnalyzeConversation = async () => {
    if (conversationHistory.length < 4) {
      toast({
        description: t("notEnoughMessagesToAnalyze"),
        variant: "warning"
      });
      return;
    }
    
    // Format messages for analysis
    const messagesToAnalyze = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Get classroom ID for current user
    let classroomId = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('classroom_memberships')
        .select('classroom_id')
        .eq('student_id', user.id)
        .limit(1);
      
      if (data && data.length > 0) {
        classroomId = data[0].classroom_id;
      }
    }
    
    const results = await analyzeConversation(messagesToAnalyze, {
      sessionId: sessionIdRef.current || undefined,
      classroomId: classroomId || undefined
    });
    
    if (results) {
      toast({
        title: t("conversationAnalysisComplete"),
        description: `${t("grammarAccuracy")}: ${results.grammarAccuracy.toFixed(1)}, ${t("conversationComplexity")}: ${results.conversationComplexity.toFixed(1)}`,
      });
    }
  };

  return {
    conversationHistory,
    apiConversationHistory,
    isLoading,
    sendMessage,
    clearConversation,
    handleAnalyzeConversation,
    sessionIdRef
  };
};
