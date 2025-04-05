
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useConversationHistory } from "./useConversationHistory";
import { useVoiceChatApi } from "./useVoiceChatApi";

/**
 * Hook for managing voice chat state and interactions
 */
export const useVoiceChatState = () => {
  // State hooks must be called before any other hooks that might use useState internally
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Toast notification
  const { toast } = useToast();
  
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
  
  // Process user input function - defined before useSpeechRecognition to avoid hook issues
  const processUserInput = async (text: string) => {
    console.log("Processing user input:", text);
    if (!text.trim()) {
      console.log("Empty transcript, not processing");
      return;
    }
    
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
  };

  // Handle transcript after user stops recording
  function handleSendTranscript(text: string) {
    console.log("Transcript received for processing:", text);
    processUserInput(text);
  }
  
  // Now handleSendTranscript is defined before useSpeechRecognition
  const { isListening, transcript, toggleListening, setTranscript } = useSpeechRecognition(handleSendTranscript);

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

