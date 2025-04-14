
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { playTTS } from "@/utils/ttsUtils";
import type { ConversationMessage } from "@/types/chat";

interface UseVoiceChatActionsProps {
  currentLanguage: string;
  setIsLoading: (loading: boolean) => void;
  setGptResponse: (response: string) => void;
  setTranslation: (translation: string) => void;
  setConversationHistory: (updater: (prev: ConversationMessage[]) => ConversationMessage[]) => void;
  setApiConversationHistory: (updater: (prev: {role: string; content: string}[]) => {role: string; content: string}[]) => void;
  setIsSpeaking: (speaking: boolean) => void;
  clearSilenceDetection: () => void;
  t: (key: string) => string;
}

export const useVoiceChatActions = ({
  currentLanguage,
  setIsLoading,
  setGptResponse,
  setTranslation,
  setConversationHistory,
  setApiConversationHistory,
  setIsSpeaking,
  clearSilenceDetection,
  t
}: UseVoiceChatActionsProps) => {
  const { toast } = useToast();

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    clearSilenceDetection();
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
          userLanguage: currentLanguage,
          conversationHistory: [],
          cefrLevel: 'B1',
          requestTranslation: true
        }
      });

      if (error) throw error;
      
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
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
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
      setApiConversationHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      speakWithBrowserSynthesis(content);
      
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

  const speakWithBrowserSynthesis = (text: string) => {
    if (!text || text.trim() === '') return;
    
    setIsSpeaking(true);
    
    playTTS({
      text,
      language: currentLanguage,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (error) => {
        console.error("TTS error:", error);
        setIsSpeaking(false);
        toast({
          title: t("error"),
          description: t("failedToGenerateSpeech"),
          variant: "destructive",
        });
      }
    });
  };

  return {
    handleSendTranscript,
    speakWithBrowserSynthesis
  };
};
