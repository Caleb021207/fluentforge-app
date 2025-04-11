
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useFrenchVoiceChat } from "@/hooks/useFrenchVoiceChat";
import VoiceChatHeader from "@/components/french-voice-chat/VoiceChatHeader";
import VoiceChatControls from "@/components/french-voice-chat/VoiceChatControls";
import TranscriptDisplay from "@/components/french-voice-chat/TranscriptDisplay";
import AIResponseDisplay from "@/components/french-voice-chat/AIResponseDisplay";
import ConversationHistory from "@/components/french-voice-chat/ConversationHistory";
import ConversationStarters from "@/components/french-voice-chat/ConversationStarters";
import PracticeTips from "@/components/french-voice-chat/PracticeTips";

const FrenchVoiceChat = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    transcript,
    setTranscript,
    gptResponse,
    translation,
    isLoading,
    conversationHistory,
    handleSendTranscript,
    clearConversation,
    getConversationStarters
  } = useFrenchVoiceChat();

  const { speak, isSpeaking } = useSpeechSynthesis({
    defaultLanguage: 'en-US'
  });

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onTranscriptChange: setTranscript,
    onSilence: () => {
      if (transcript) {
        handleSendTranscript(transcript);
        stopListening();
      }
    },
    language: 'en-US'
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setTranscript("");
    }
  };

  const playAgain = () => {
    if (gptResponse) {
      speak(gptResponse, 'en-US');
    }
  };

  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };

  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <VoiceChatControls 
            isListening={isListening}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            transcript={transcript}
            onToggleListening={toggleListening}
            onSendTranscript={() => handleSendTranscript(transcript)}
          />
          
          <TranscriptDisplay 
            transcript={transcript}
            isListening={isListening}
          />

          {isLoading && (
            <div className="flex justify-center my-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <AIResponseDisplay 
            gptResponse={gptResponse}
            translation={translation}
            isSpeaking={isSpeaking}
            onPlayAgain={playAgain}
          />
        </Card>
        
        <ConversationHistory 
          messages={conversationHistory}
          onClearConversation={clearConversation}
        />

        <ConversationStarters 
          nativeLanguagePhrases={nativeLanguagePhrases}
          targetLanguagePhrases={targetLanguagePhrases}
          onPhraseClick={handlePhraseClick}
        />
        
        <PracticeTips />
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default FrenchVoiceChat;
