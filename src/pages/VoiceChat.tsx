
import { useRef } from "react";
import { useVoiceChatState } from "@/components/voice-chat/hooks/useVoiceChatState";
import VoiceChatHeader from "@/components/voice-chat/components/VoiceChatHeader";
import VoiceChatContainer from "@/components/voice-chat/components/VoiceChatContainer";
import ConversationHistoryCard from "@/components/voice-chat/components/ConversationHistoryCard";
import ConversationStarters from "@/components/voice-chat/components/ConversationStarters";
import PracticeGuide from "@/components/voice-chat/components/PracticeGuide";

const VoiceChat = () => {
  const {
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
  } = useVoiceChatState();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        <VoiceChatContainer
          isLoading={isLoading}
          isListening={isListening}
          isSpeaking={isSpeaking}
          transcript={transcript}
          gptResponse={gptResponse}
          translation={translation}
          toggleListening={toggleListening}
          playAgain={playAgain}
        />
        
        {conversationHistory.length > 0 && (
          <ConversationHistoryCard
            conversationHistory={conversationHistory}
            conversationEndRef={conversationEndRef}
            clearConversation={clearConversation}
          />
        )}

        <ConversationStarters onPhraseClick={handlePhraseClick} />
        
        <PracticeGuide />
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceChat;
