
import React from "react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useAudioPlayback from "@/hooks/useAudioPlayback";
import useVoiceChatConversation from "@/hooks/useVoiceChatConversation";

import VoiceChatInfo from "@/components/practice/voice-chat/VoiceChatInfo";
import VoiceControls from "@/components/practice/voice-chat/VoiceControls";
import VoiceFeedback from "@/components/practice/voice-chat/VoiceFeedback";
import ConversationHistory from "@/components/practice/voice-chat/ConversationHistory";
import ConversationStarters from "@/components/practice/voice-chat/ConversationStarters";

const VoiceChat = () => {
  const { currentLanguage, t } = useLocalization();
  const { practice: targetLanguage } = getLanguagePair(currentLanguage);
  
  // Use our custom hooks
  const {
    conversationHistory,
    isLoading,
    gptResponse,
    translation,
    sendMessage,
    clearConversation
  } = useVoiceChatConversation();
  
  const { 
    isSpeaking, 
    speakText 
  } = useAudioPlayback({ language: currentLanguage });
  
  const { 
    isListening, 
    transcript, 
    isSupported: speechRecognitionSupported,
    startListening,
    stopListening
  } = useSpeechRecognition({ 
    targetLanguage, 
    onSilenceDetected: (text) => {
      if (isListening && text.trim()) {
        handleSendTranscript(text);
        stopListening();
      }
    },
    silenceTimeout: 10000 // 10 seconds
  });

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    stopListening();
    const response = await sendMessage(text);
    
    if (response) {
      speakText(response.content);
    }
  };

  const playAgain = () => {
    if (gptResponse) {
      speakText(gptResponse);
    }
  };

  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatInfo 
        speechRecognitionSupported={speechRecognitionSupported} 
      />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">
                  {t("practiceLevel")}
                </span> - 
                {t("cefrB1Description")}
              </p>
            </div>

            <VoiceControls 
              isListening={isListening}
              transcript={transcript}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              isRecognitionSupported={speechRecognitionSupported}
              onToggleListening={toggleListening}
              onSendTranscript={handleSendTranscript}
            />
          </div>
          
          <VoiceFeedback 
            transcript={transcript}
            gptResponse={gptResponse}
            translation={translation}
            isListening={isListening}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            onPlayAgain={playAgain}
          />
        </Card>
        
        {conversationHistory.length > 0 && (
          <ConversationHistory 
            conversationHistory={conversationHistory}
            onClearConversation={clearConversation}
            onPlayAudio={speakText}
          />
        )}
        
        <Card className="p-6">
          <h3 className="font-medium mb-4">
            {t("conversationStarters")}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t("tryThesePhrases")}
          </p>
          
          <ConversationStarters onPhraseClick={handlePhraseClick} />
        </Card>
      </div>
    </div>
  );
};

export default VoiceChat;
