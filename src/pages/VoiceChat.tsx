
import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguageMetricsPanel } from "@/components/practice/hooks/useLanguageMetricsPanel";
import LanguageMetricsPanel from "@/components/practice/LanguageMetricsPanel";
import { getLanguagePair } from "@/utils/languageUtils";
import { useLocalization } from "@/context/LocalizationContext";
import { getEnglishOnlyMessage } from "@/utils/englishOnlyMessages";

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
import { VoiceChatProps } from "@/types/voiceChat";
import { Message } from "@/types/chat";

const VoiceChat: React.FC<VoiceChatProps> = () => {
  const { currentLanguage, t } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);
  const { toast } = useToast();
  const [conversationLevel, setConversationLevel] = useState<string>("intermediate");
  const [correctGrammar, setCorrectGrammar] = useState<boolean>(false);

  // Load saved preferences
  useEffect(() => {
    const storedLevel = localStorage.getItem("conversationLevel");
    if (storedLevel) {
      setConversationLevel(storedLevel);
    }
    
    const savedCorrectGrammar = localStorage.getItem('correctGrammar');
    if (savedCorrectGrammar) {
      setCorrectGrammar(savedCorrectGrammar === 'true');
    }
  }, []);

  const handleLevelChange = (newLevel: string) => {
    setConversationLevel(newLevel);
    localStorage.setItem("conversationLevel", newLevel);
    
    const levelNames = {
      basic: getEnglishOnlyMessage("basicLevel"),
      intermediate: getEnglishOnlyMessage("intermediateLevel"),
      advanced: getEnglishOnlyMessage("advancedLevel")
    };
    
    toast({
      title: getEnglishOnlyMessage("conversationLevelUpdated"),
      description: `${getEnglishOnlyMessage("levelSetTo")} ${levelNames[newLevel as keyof typeof levelNames]}`,
      variant: "default",
    });
  };

  const toggleGrammarCorrection = () => {
    const newValue = !correctGrammar;
    setCorrectGrammar(newValue);
    localStorage.setItem('correctGrammar', String(newValue));
    
    toast({
      title: newValue ? getEnglishOnlyMessage("grammarCorrectionEnabled") : getEnglishOnlyMessage("grammarCorrectionDisabled"),
      description: newValue ? getEnglishOnlyMessage("tutorWillCorrectGrammar") : getEnglishOnlyMessage("tutorWontCorrectGrammar"),
      variant: "default",
    });
  };
  
  // Initialize hooks
  const { conversationHistory, apiConversationHistory, isLoading, sendMessage, 
          clearConversation, handleAnalyzeConversation, sessionIdRef } = useVoiceConversation(conversationLevel, correctGrammar);
  
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
      role: msg.role as "user" | "assistant" | "system", 
      content: msg.content,
      translation: msg.translation
    }))
  );
  
  // Handle phrase click from conversation starters
  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        {/* Conversation Settings Card */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Conversation Level Selector */}
            <div className="flex items-center justify-between">
              <Label htmlFor="conversation-level" className="text-sm font-medium">
                {t("conversationLevel") || "Conversation Level"}
              </Label>
              <Select value={conversationLevel} onValueChange={handleLevelChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("selectLevel") || "Select level"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    {t("basicLevel") || "Basic (A1-A2)"}
                  </SelectItem>
                  <SelectItem value="intermediate">
                    {t("intermediateLevel") || "Intermediate (B1)"}
                  </SelectItem>
                  <SelectItem value="advanced">
                    {t("advancedLevel") || "Advanced (B2-C1)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grammar Correction Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="grammar-correction" className="text-sm font-medium">
                {t("correctGrammar") || "Grammar Correction"}
              </Label>
              <Switch
                id="grammar-correction"
                checked={correctGrammar}
                onCheckedChange={toggleGrammarCorrection}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <div className="flex justify-center mb-6">
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
            targetLanguage={practice}
          />
          
          <InformationCard />
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
