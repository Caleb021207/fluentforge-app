
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { VoiceMessage, useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import { useVoiceChatRecognition } from "@/hooks/useVoiceChatRecognition";
import VoiceChatHeader from "@/components/practice/VoiceChatHeader";
import VoiceChatControls from "@/components/practice/VoiceChatControls";
import VoiceChatHistory from "@/components/practice/VoiceChatHistory";
import ConversationStarters from "@/components/practice/ConversationStarters";

const VoiceChat = () => {
  const [conversationHistory, setConversationHistory] = useState<VoiceMessage[]>([]);
  const { t } = useLocalization();
  const { toast } = useToast();
  
  // Custom hooks
  const {
    isListening,
    isLoading,
    isSpeaking,
    transcript,
    gptResponse,
    translation,
    toggleListening,
    handleSendTranscript,
    speakWithBrowserSynthesis,
    playAgain,
  } = useVoiceChatRecognition();
  
  const {
    messages,
    clearMessages,
    addMessage
  } = useVoiceChatMessages();
  
  useEffect(() => {
    setConversationHistory(messages);
  }, [messages]);
  
  const handleSendMessage = async (text: string) => {
    // Add user message to conversation history
    addMessage('user', text);
    
    // Process with GPT
    const response = await handleSendTranscript(text);
    
    if (response && gptResponse) {
      // Add assistant message to conversation history
      addMessage('assistant', gptResponse, translation);
    }
  };
  
  const clearConversation = () => {
    clearMessages();
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <VoiceChatHeader />
      
      <div className="flex flex-col gap-6">
        {/* Voice Chat Controls */}
        <VoiceChatControls
          isListening={isListening}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
          transcript={transcript}
          gptResponse={gptResponse}
          translation={translation}
          toggleListening={toggleListening}
          handleSendTranscript={handleSendMessage}
          playAgain={playAgain}
        />
        
        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <VoiceChatHistory
            messages={conversationHistory}
            onClearHistory={clearConversation}
            onPlayAudio={speakWithBrowserSynthesis}
          />
        )}
        
        {/* Conversation Starters */}
        <ConversationStarters
          onPhraseClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default VoiceChat;
