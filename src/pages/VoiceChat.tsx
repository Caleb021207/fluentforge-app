
import React from "react";
import { Card } from "@/components/ui/card";
import { useLanguageMetricsPanel } from "@/components/practice/hooks/useLanguageMetricsPanel";
import LanguageMetricsPanel from "@/components/practice/LanguageMetricsPanel";
import { getLanguagePair } from "@/utils/languageUtils";
import { useLocalization } from "@/context/LocalizationContext";

// Importing components
import VoiceChatHeader from "@/components/voice-chat/VoiceChatHeader";
import VoiceRecognitionControls from "@/components/voice-chat/VoiceRecognitionControls";
import PracticeInfoPanel from "@/components/voice-chat/PracticeInfoPanel";
import TranscriptDisplay from "@/components/voice-chat/TranscriptDisplay";
import ListeningIndicator from "@/components/voice-chat/ListeningIndicator";
import VoiceChatControls from "@/components/voice-chat/VoiceChatControls";
import VoiceChatContainer from "@/components/voice-chat/VoiceChatContainer";
import ConversationStarters from "@/components/premium-voice/ConversationStarters";
import InformationCard from "@/components/voice-chat/InformationCard";

// Importing hooks
import { useVoiceSpeechRecognition } from "@/hooks/useVoiceSpeechRecognition";
import { useVoiceTTS } from "@/hooks/useVoiceTTS";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";

const VoiceChat = () => {
  const { currentLanguage, t } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);
  
  // Initialize hooks
  const { conversationHistory, apiConversationHistory, isLoading, sendMessage, 
          clearConversation, handleAnalyzeConversation, sessionIdRef } = useVoiceConversation();
  
  const { speakWithAzureTTS, isSpeaking } = useVoiceTTS({ practiceLanguage: practice });
  
  const { isListening, transcript, toggleListening, handleSendTranscript } = useVoiceSpeechRecognition({
    targetLanguage: practice,
    onSendTranscript: (text) => sendMessage(text, speakWithAzureTTS)
  });

  // Initialize language metrics panel
  const { 
    isExpanded,
    togglePanel, 
    metrics,
    isAnalyzing,
    analyzeCurrentConversation
  } = useLanguageMetricsPanel(
    conversationHistory.map(msg => ({ 
      role: msg.role, 
      content: msg.content,
      translation: msg.translation
    }))
  );
  
  // Handle phrase click from conversation starters
  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };

  // Get conversation starters phrases based on language
  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    const nativeLanguagePhrases = phraseKeys.map(key => t(key));
    
    return { nativeLanguagePhrases };
  };

  const { nativeLanguagePhrases } = getConversationStarters();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <PracticeInfoPanel />

            <VoiceRecognitionControls
              isListening={isListening}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              transcript={transcript}
              toggleListening={toggleListening}
              handleSendTranscript={handleSendTranscript}
            />
          </div>
          
          <ListeningIndicator isListening={isListening} />
          
          <TranscriptDisplay transcript={transcript} isListening={isListening} />

          {(conversationHistory.length > 0 || isLoading) && (
            <VoiceChatContainer 
              messages={conversationHistory}
              isLoading={isLoading}
              targetLanguage={practice.toLowerCase()}
              onPlayAudio={speakWithAzureTTS}
            />
          )}

          <VoiceChatControls
            conversationHistory={conversationHistory}
            apiConversationHistory={apiConversationHistory}
            sessionIdRef={sessionIdRef}
            clearConversation={clearConversation}
            analyzeCurrentConversation={analyzeCurrentConversation}
            practice={practice}
          />
        </Card>

        {/* Language Metrics Panel */}
        {metrics && (
          <LanguageMetricsPanel
            metrics={metrics}
            isExpanded={isExpanded}
            onToggle={togglePanel}
            isLoading={isAnalyzing}
            onAnalyze={analyzeCurrentConversation}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConversationStarters 
            onPhraseClick={handlePhraseClick}
          />
          
          <InformationCard />
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
