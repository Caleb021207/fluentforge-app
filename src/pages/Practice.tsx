
import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";
import SpeechRateControl from "@/components/practice/SpeechRateControl";
import LanguageMetricsPanel from "@/components/practice/LanguageMetricsPanel";
import { useLanguageMetricsPanel } from "@/components/practice/hooks/useLanguageMetricsPanel";
import LocalizationDebug from "@/components/practice/LocalizationDebug";

// For development use - set to false in production
const SHOW_DEBUG_PANEL = true;

const Practice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { currentLanguage, t } = useLocalization();
  const [targetLanguage, setTargetLanguage] = useState<string>("spanish");
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  
  useEffect(() => {
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    const savedSpeechRate = localStorage.getItem("speechRate");
    
    if (savedNativeLanguage && savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    } else {
      if (currentLanguage === "english") {
        setTargetLanguage("spanish");
      } else {
        setTargetLanguage("english");
      }
    }
    
    if (savedSpeechRate) {
      setSpeechRate(parseFloat(savedSpeechRate));
    }
    
    // Debug for language initialization
    console.debug('Practice component initialized with language:', {
      currentLanguage,
      targetLanguage: savedTargetLanguage || (currentLanguage === "english" ? "spanish" : "english")
    });
  }, [currentLanguage]);

  // Save speech rate to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("speechRate", speechRate.toString());
  }, [speechRate]);
  
  const {
    messages,
    input,
    setInput,
    isLoading: chatLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    clearConversation,
    getPlaceholderText,
    correctGrammar,
    toggleGrammarCorrection
  } = useChatMessages();
  
  // Add language metrics panel integration
  const {
    isExpanded,
    togglePanel,
    metrics,
    isAnalyzing,
    analyzeCurrentConversation
  } = useLanguageMetricsPanel(messages);
  
  const {
    startVoiceConversation,
    endVoiceConversation,
    isConversationActive
  } = useVoiceChat();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  // Debug for message display
  console.debug('Practice component rendering with language:', {
    messageCount: messages.length,
    hasTranslations: messages.filter(m => m.translation).length,
    currentLanguage
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PracticeHeader targetLanguage={targetLanguage} />
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4 items-center">
          <PracticePromptButton
            onClick={sendLanguageLearningPrompt}
            isLoading={chatLoading}
            targetLanguage={targetLanguage}
          />
          
          <div className="flex items-center space-x-2">
            <Switch
              id="grammar-correction"
              checked={correctGrammar}
              onCheckedChange={toggleGrammarCorrection}
            />
            <Label htmlFor="grammar-correction" className="text-sm">
              {t("correctGrammar") || "Correct my grammar"}
            </Label>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={clearConversation}
          className="flex items-center gap-2"
        >
          <Trash className="h-4 w-4" />
          {t("clearConversation") || "Clear conversation"}
        </Button>
      </div>
      
      <div className="mb-4">
        <SpeechRateControl 
          speechRate={speechRate} 
          onChange={(value) => setSpeechRate(value)} 
        />
      </div>

      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={chatLoading}
        getPlaceholderText={getPlaceholderText}
        targetLanguage={targetLanguage}
        speechRate={speechRate}
      />

      {/* Add Language Metrics Panel */}
      <LanguageMetricsPanel
        metrics={metrics}
        isLoading={isAnalyzing}
        isExpanded={isExpanded}
        onToggle={togglePanel}
        onAnalyze={analyzeCurrentConversation}
      />

      <PracticeGuide targetLanguage={targetLanguage} />
      
      {/* Display debug panel in development */}
      {SHOW_DEBUG_PANEL && (
        <LocalizationDebug />
      )}
    </div>
  );
};

export default Practice;
