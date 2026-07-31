import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveCard } from "@/components/ui/card";
import { Trash, Sparkles, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TranslationType } from "@/components/practice/hooks/useTranslationHandler";
import { appStorage } from "@/utils/security/storage";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import XPNotification from "@/components/ui/xp-notification";
import LevelUpModal from "@/components/gamification/LevelUpModal";
import { useGamification } from "@/hooks/useGamification";
import { useXPNotification } from "@/contexts/XPNotificationContext";

// Create an interface that matches the Message structure from useChatMessages
interface MessageWithTranslationType {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
}

const Practice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();
  const [targetLanguage, setTargetLanguage] = useState<string>("english");
  const [conversationLevel, setConversationLevel] = useState<string>("intermediate");
  const [bilingualMode, setBilingualMode] = useState<boolean>(false);
  const { showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();
  const { showXPNotification, lastXPGain } = useXPNotification();
  
  // Read URL parameters for deep linking
  const searchParams = new URLSearchParams(window.location.search);
  const urlLevel = searchParams.get('level');
  const urlTopic = searchParams.get('topic');
  const urlFocus = searchParams.get('focus');
  
  useEffect(() => {
    const savedTargetLanguage = appStorage.get("targetLanguage");

    if (savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    } else if (currentLanguage !== "english") {
      // ESL default: learners whose native language isn't English learn English.
      setTargetLanguage("english");
    }

    const cefrToLevel: Record<string, string> = {
      'A1': 'basic',
      'A2': 'basic',
      'B1': 'intermediate',
      'B2': 'advanced',
      'C1': 'advanced',
      'C2': 'advanced'
    };

    if (urlLevel) {
      // Deep-link level parameter wins.
      const mappedLevel = cefrToLevel[urlLevel] || 'intermediate';
      setConversationLevel(mappedLevel);
      localStorage.setItem("conversationLevel", mappedLevel);
    } else {
      const storedLevel = localStorage.getItem("conversationLevel");
      if (storedLevel) {
        setConversationLevel(storedLevel);
      } else {
        // Fall back to the learner's placement quiz result.
        const placement = appStorage.get("placementLevel");
        if (placement && cefrToLevel[placement]) {
          setConversationLevel(cefrToLevel[placement]);
        }
      }
    }
  }, [currentLanguage, urlLevel]);
  
  // Load bilingual mode preference
  useEffect(() => {
    const savedBilingualMode = localStorage.getItem('bilingualMode');
    if (savedBilingualMode) {
      setBilingualMode(savedBilingualMode === 'true');
    }
  }, []);
  
  const handleLevelChange = (newLevel: string) => {
    setConversationLevel(newLevel);
    localStorage.setItem("conversationLevel", newLevel);
    
    const levelNames = {
      basic: t("basicLevel") || "Basic (A1-A2)",
      intermediate: t("intermediateLevel") || "Intermediate (B1)", 
      advanced: t("advancedLevel") || "Advanced (B2-C1)"
    };
    
    toast({
      title: t("conversationLevelUpdated") || "Conversation Level Updated",
      description: `${t("levelSetTo") || "Level set to"} ${levelNames[newLevel as keyof typeof levelNames]}`,
      variant: "default",
    });
  };
  
  const toggleBilingualMode = () => {
    const newValue = !bilingualMode;
    setBilingualMode(newValue);
    localStorage.setItem('bilingualMode', String(newValue));
    
    toast({
      title: newValue ? (t("bilingualModeEnabled") || "Bilingual mode enabled") : (t("bilingualModeDisabled") || "Bilingual mode disabled"),
      description: newValue 
        ? (t("showBothLanguagesDescription") || "AI responses will show both target and native language")
        : "AI responses will show target language with translation dropdown",
      variant: "default",
    });
  };
  
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
  } = useChatMessages(conversationLevel);
  
  // The conversation is intentionally kept when navigating away so a student
  // who taps into Review or a lesson doesn't lose their chat; they can clear
  // it explicitly with the Clear Conversation button.

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  // Convert messages to ensure compatibility with ChatContainer
  const compatibleMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    // Convert complex translation objects to strings if needed
    translation: typeof msg.translation === 'string' ? 
      msg.translation : 
      msg.translation ? JSON.stringify(msg.translation) : undefined
  }));

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
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 select-none" onContextMenu={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()}>
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PracticeHeader targetLanguage={targetLanguage} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
        >
          <InteractiveCard className="mb-6 glass overflow-hidden bg-gradient-to-br from-card/50 via-card to-card/50 border-primary/20">
            <div className="p-6 space-y-4">
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
              
              {/* Bilingual Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="bilingual-mode" className="text-base font-semibold flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    {t("bilingualMode") || "Bilingual Mode"}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {t("showBothLanguagesDescription") || "Display both target and native language in responses"}
                  </span>
                </div>
                <Switch
                  id="bilingual-mode"
                  checked={bilingualMode}
                  onCheckedChange={toggleBilingualMode}
                />
              </div>
            </div>
          </InteractiveCard>
        </motion.div>
      
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-4 gap-4"
        >
          <motion.div 
            className="flex space-x-3 items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PracticePromptButton
              onClick={sendLanguageLearningPrompt}
              isLoading={chatLoading}
              targetLanguage={targetLanguage}
            />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={clearConversation}
              className="flex items-center gap-3 px-6 py-6 text-lg hover:shadow-xl hover:border-primary/50 transition-all bg-gradient-to-r from-card/80 to-card"
              size="lg"
            >
              <Trash className="h-5 w-5" />
              {t("clearConversation")}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ChatContainer
            messages={compatibleMessages}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={chatLoading}
            getPlaceholderText={getPlaceholderText}
            targetLanguage={targetLanguage}
            bilingualMode={bilingualMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
         <PracticeGuide targetLanguage={targetLanguage} />
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Practice;