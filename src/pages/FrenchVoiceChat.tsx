
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { useFrenchVoiceChat } from "@/hooks/useFrenchVoiceChat";
import FrenchVoiceHeader from "@/components/french-voice/FrenchVoiceHeader";
import FrenchVoiceControls from "@/components/french-voice/FrenchVoiceControls";
import FrenchVoiceResponse from "@/components/french-voice/FrenchVoiceResponse";
import FrenchConversationHistory from "@/components/french-voice/FrenchConversationHistory";

const FrenchVoiceChat = () => {
  const { t } = useLocalization();
  const {
    isListening,
    transcript,
    gptResponse,
    translation,
    isLoading,
    isSpeaking,
    conversationHistory,
    toggleListening,
    handleSendTranscript,
    speakWithTTS,
    clearConversation
  } = useFrenchVoiceChat();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <FrenchVoiceHeader />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Practice Level: B1</span> - Can discuss familiar topics
              </p>
            </div>

            <FrenchVoiceControls
              isListening={isListening}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              transcript={transcript}
              toggleListening={toggleListening}
              onSendTranscript={handleSendTranscript}
            />
          </div>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse mb-4">
              {t("listeningNow")}...
            </div>
          )}

          {transcript && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">{t("youSaid")}:</h3>
              <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
                {transcript}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center my-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <FrenchVoiceResponse
            content={gptResponse}
            translation={translation}
            isSpeaking={isSpeaking}
            onPlayAgain={speakWithTTS}
          />
        </Card>
        
        <FrenchConversationHistory
          messages={conversationHistory}
          onClear={clearConversation}
          onPlayAudio={speakWithTTS}
        />
      </div>
    </div>
  );
};

export default FrenchVoiceChat;
