
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import ChatMessage from "@/components/practice/ChatMessage";
import { useVoiceRecognition } from "@/hooks/voice-chat/useVoiceRecognition";
import { useVoiceChatState } from "@/hooks/voice-chat/useVoiceChatState";
import { useVoiceChatActions } from "@/hooks/voice-chat/useVoiceChatActions";
import VoiceChatHeader from "@/components/practice/voice-chat/VoiceChatHeader";
import VoiceChatControls from "@/components/practice/voice-chat/VoiceChatControls";
import VoiceChatResponse from "@/components/practice/voice-chat/VoiceChatResponse";
import { ConversationStarters } from "@/components/practice/voice-chat/ConversationStarters";

const VoiceChatMain = () => {
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  
  const {
    isLoading,
    setIsLoading,
    isSpeaking,
    setIsSpeaking,
    gptResponse,
    setGptResponse,
    translation,
    setTranslation,
    conversationHistory,
    setConversationHistory,
    apiConversationHistory,
    setApiConversationHistory,
  } = useVoiceChatState();

  const { isListening, transcript, toggleListening, setTranscript, clearSilenceDetection } = useVoiceRecognition();

  const { handleSendTranscript, speakWithBrowserSynthesis } = useVoiceChatActions({
    currentLanguage,
    setIsLoading,
    setGptResponse,
    setTranslation,
    setConversationHistory,
    setApiConversationHistory,
    setIsSpeaking,
    clearSilenceDetection,
    t
  });

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("success"),
      description: t("conversationHistoryCleared"),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{t("practiceLevel")}: B1</span> - {t("cefrB1Description")}
              </p>
            </div>

            <VoiceChatControls
              isListening={isListening}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              transcript={transcript}
              onToggleListening={toggleListening}
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

          <VoiceChatResponse
            gptResponse={gptResponse}
            translation={translation}
            isSpeaking={isSpeaking}
            onPlayAgain={() => gptResponse && speakWithBrowserSynthesis(gptResponse)}
          />
        </Card>
        
        {conversationHistory.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{t("conversationHistory")}</h3>
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
              >
                {t("clearConversation")}
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    translation={message.translation}
                    onPlayAudio={(text) => speakWithBrowserSynthesis(text)}
                  />
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
        
        <ConversationStarters onPhraseClick={handleSendTranscript} />
      </div>
    </div>
  );
};

export default VoiceChatMain;
