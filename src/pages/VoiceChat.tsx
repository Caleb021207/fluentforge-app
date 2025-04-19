
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import { useAIResponseHandling } from "@/hooks/useAIResponseHandling";
import { ConversationStarters } from "@/components/voice-chat/ConversationStarters";
import { ConversationHistory } from "@/components/voice-chat/ConversationHistory";
import { VoiceChatControls } from "@/components/voice-chat/VoiceChatControls";
import { TranscriptDisplay } from "@/components/voice-chat/TranscriptDisplay";
import {
  getPracticeDescription,
  getAIModelInfoText,
  getBrowserTTSNote,
  getPracticeLevelText,
  getAIModelLabelText,
} from "@/utils/voiceChatTextUtils";

const VoiceChat = () => {
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const cefrLevel = 'B1';
  
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  
  const { t, currentLanguage } = useLocalization();
  const { isListening, transcript, toggleListening, setTranscript, clearSilenceDetection } = useSpeechRecognition();
  const { isSpeaking, speakText } = useSpeechSynthesis();
  const { messages, clearMessages, addMessage } = useVoiceChatMessages();
  const { isLoading, handleSendMessage } = useAIResponseHandling({
    onResponseReceived: (content: string, translationText: string) => {
      setGptResponse(content);
      setTranslation(translationText);
      addMessage('assistant', content);
      speakText(content);
      setTranscript("");
    },
    apiConversationHistory,
    setApiConversationHistory,
    cefrLevel
  });

  const handleSendTranscript = async () => {
    if (!transcript.trim()) return;
    
    clearSilenceDetection();
    addMessage('user', transcript);
    await handleSendMessage(transcript);
  };

  const clearConversation = () => {
    clearMessages();
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {getPracticeDescription(currentLanguage)}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>{getAIModelLabelText()}</strong> {getAIModelInfoText(currentLanguage)}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {getBrowserTTSNote()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{getPracticeLevelText()}: B1</span> - {t("cefrB1Description")}
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

          <TranscriptDisplay
            transcript={transcript}
            gptResponse={gptResponse}
            translation={translation}
            isSpeaking={isSpeaking}
            onPlayAudio={() => speakText(gptResponse)}
            isLoading={isLoading}
          />
        </Card>
        
        <ConversationHistory
          messages={messages}
          onClear={clearConversation}
          onPlayAudio={speakText}
        />
        
        <ConversationStarters onPhraseClick={handleSendTranscript} />
      </div>
      <div ref={conversationEndRef} />
    </div>
  );
};

export default VoiceChat;
