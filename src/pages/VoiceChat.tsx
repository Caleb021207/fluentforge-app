
import React from "react";
import { InteractiveCard } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { Sparkles } from "lucide-react";
import XPNotification from "@/components/ui/xp-notification";
import LevelUpModal from "@/components/gamification/LevelUpModal";
import { useGamification } from "@/hooks/useGamification";
import { useXPNotification } from "@/contexts/XPNotificationContext";

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
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsCheckingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Read URL parameters for deep linking
  const searchParams = new URLSearchParams(window.location.search);
  const urlLevel = searchParams.get('level');
  
  // Load saved preferences
  useEffect(() => {
    // Map URL level parameter to conversation level
    if (urlLevel) {
      const levelMap: Record<string, string> = {
        'A1': 'basic',
        'A2': 'basic',
        'B1': 'intermediate',
        'B2': 'advanced',
        'C1': 'advanced',
        'C2': 'advanced'
      };
      const mappedLevel = levelMap[urlLevel] || 'intermediate';
      setConversationLevel(mappedLevel);
      localStorage.setItem("conversationLevel", mappedLevel);
    } else {
      const storedLevel = localStorage.getItem("conversationLevel");
      if (storedLevel) {
        setConversationLevel(storedLevel);
      }
    }
    
    const savedCorrectGrammar = localStorage.getItem('correctGrammar');
    if (savedCorrectGrammar) {
      setCorrectGrammar(savedCorrectGrammar === 'true');
    }
  }, [urlLevel]);

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
          clearConversation, handleAnalyzeConversation, sessionIdRef, hasAnalyzedConversation } = useVoiceConversation(conversationLevel, correctGrammar);
  
  const { showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();
  const { showXPNotification, lastXPGain } = useXPNotification();
  
  const { speakWithAzureTTS, isSpeaking } = useVoiceTTS({ practiceLanguage: practice });
  
  const { isListening, isTranscribing, transcript, toggleListening, handleSendTranscript } = useVoiceSpeechRecognition({
    targetLanguage: practice,
    onSendTranscript: (text) => sendMessage(text, speakWithAzureTTS),
    useWhisper: true,
    multilingualMode: true
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
  
  // Auto-clear conversation on unmount
  useEffect(() => {
    return () => {
      clearConversation();
    };
  }, []);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">{t("loading") || "Loading..."}</p>
      </div>
    );
  }

  // Show auth prompt if not logged in
  if (!user) {
    return <AuthRequiredPrompt />;
  }

  return (
    <>
      <XPNotification show={showXPNotification} amount={lastXPGain} />
      {levelUpData && (
        <LevelUpModal
          open={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          totalXP={progression?.total_xp || 0}
        />
      )}
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VoiceChatHeader />
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Conversation Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <InteractiveCard className="glass overflow-hidden bg-gradient-to-br from-card/50 via-card to-card/50 border-primary/20">
              <CardContent className="p-6 space-y-4">
                {/* Grammar Correction Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="grammar-correction" className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t("correctGrammar") || "Grammar Correction"}
                  </Label>
                  <Switch
                    id="grammar-correction"
                    checked={correctGrammar}
                    onCheckedChange={toggleGrammarCorrection}
                  />
                </div>
              </CardContent>
            </InteractiveCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.005 }}
          >
            <InteractiveCard className="p-6 glass overflow-hidden bg-gradient-to-br from-card/50 via-card to-card/50 border-primary/20 shadow-xl">
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
          
          <TranscriptDisplay 
            transcript={transcript} 
            isListening={isListening}
            isTranscribing={isTranscribing}
          />

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
            isAnalyzing={isAnalyzing}
            hasAnalyzed={hasAnalyzedConversation}
            />
          </InteractiveCard>
        </motion.div>

        {/* Language Metrics Panel */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LanguageMetricsPanel
              metrics={metrics}
              isExpanded={isExpanded}
              onToggle={togglePanel}
              isLoading={isAnalyzing}
              onAnalyze={analyzeCurrentConversation}
            />
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <ConversationStarters 
            onPhraseClick={handlePhraseClick}
            targetLanguage={practice}
            isLoading={isLoading}
            hasMessages={conversationHistory.length > 0}
          />
          
          <InformationCard />
        </motion.div>
        </div>
      </div>
    </div>
    </>
  );
};

export default VoiceChat;
