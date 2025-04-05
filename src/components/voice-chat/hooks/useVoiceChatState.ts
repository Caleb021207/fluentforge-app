
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useConversationHistory } from "./useConversationHistory";

/**
 * Hook for managing voice chat state and interactions
 */
export const useVoiceChatState = () => {
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { 
    conversationHistory, 
    apiConversationHistory,
    conversationEndRef, 
    addUserMessage, 
    addAssistantMessage, 
    clearConversation,
    setApiConversationHistory
  } = useConversationHistory();

  const { isSpeaking, speakText } = useSpeechSynthesis();
  
  // Now handleSendTranscript is only called when user stops recording
  const { isListening, transcript, toggleListening, setTranscript } = useSpeechRecognition(handleSendTranscript);

  function handleSendTranscript(text: string) {
    processUserInput(text);
  }

  async function processUserInput(text: string) {
    addUserMessage(text);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel: 'B1',
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText) {
        console.log("No translation provided for response in language:", currentLanguage);
        
        const targetLanguage = currentLanguage === "english" ? "spanish" : currentLanguage;
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: targetLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got translation manually:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      addAssistantMessage(content, translationText);
      
      setGptResponse(content);
      setTranslation(translationText);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      speakText(content);
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
  }

  const handlePhraseClick = (phrase: string) => {
    processUserInput(phrase);
  };

  const playAgain = () => {
    if (gptResponse) {
      speakText(gptResponse);
    }
  };

  return {
    gptResponse,
    translation,
    isLoading,
    isListening,
    isSpeaking,
    transcript,
    audioRef,
    conversationHistory,
    conversationEndRef,
    toggleListening,
    handlePhraseClick,
    playAgain,
    clearConversation
  };
};
