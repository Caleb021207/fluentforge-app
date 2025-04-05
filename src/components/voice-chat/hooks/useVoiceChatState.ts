
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useConversationHistory } from "./useConversationHistory";
import { useVoiceChatApi } from "./useVoiceChatApi";
import { useState } from "react";

/**
 * Hook for managing voice chat state and interactions
 */
export const useVoiceChatState = () => {
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hooks
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
  const { isLoading, processChatInput } = useVoiceChatApi();
  
  // Handle transcript after user stops recording
  function handleSendTranscript(text: string) {
    processUserInput(text);
  }
  
  // Now handleSendTranscript is only called when user stops recording
  const { isListening, transcript, toggleListening, setTranscript } = useSpeechRecognition(handleSendTranscript);

  async function processUserInput(text: string) {
    addUserMessage(text);
    
    await processChatInput(
      text,
      apiConversationHistory,
      'B1',
      (content, translationText, updatedHistory) => {
        addAssistantMessage(content, translationText);
        setGptResponse(content);
        setTranslation(translationText);
        setApiConversationHistory(updatedHistory);
        speakText(content);
      }
    );
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
