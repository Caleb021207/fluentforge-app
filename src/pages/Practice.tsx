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
import { Trash, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TranslationType } from "@/components/practice/hooks/useTranslationHandler";
import { secureStorage } from "@/utils/security/dataEncryption";
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
  const [targetLanguage, setTargetLanguage] = useState<string>("spanish");
  const [conversationLevel, setConversationLevel] = useState<string>("intermediate");
  const { showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();
  const { showXPNotification, lastXPGain } = useXPNotification();
  
  // Read URL parameters for deep linking
  const searchParams = new URLSearchParams(window.location.search);
  const urlLevel = searchParams.get('level');
  const urlTopic = searchParams.get('topic');
  const urlFocus = searchParams.get('focus');
  
  useEffect(() => {
    const savedTargetLanguage = secureStorage.getItem("targetLanguage");
    const savedNativeLanguage = secureStorage.getItem("nativeLanguage");
    
    if (savedNativeLanguage && savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    } else {
      if (currentLanguage === "english") {
        setTargetLanguage("spanish");
      } else {
        setTargetLanguage("english");
      }
    }
    
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
      // Initialize conversation level from localStorage
      const storedLevel = localStorage.getItem("conversationLevel");
      if (storedLevel) {
        setConversationLevel(storedLevel);
      }
    }
    
    // Debug for Thai language - Fix the comparison to use lowercase comparison
    if (currentLanguage.toLowerCase() === 'thai') {
      console.log('Practice component initialized with Thai language:', {
        currentLanguage,
        targetLanguage: savedTargetLanguage || (currentLanguage === "english" ? "spanish" : "english"),
        urlLevel,
        urlTopic,
        urlFocus
      });
    }
  }, [currentLanguage, urlLevel]);
  
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
  
  // Auto-clear conversation on unmount
  useEffect(() => {
    return () => {
      clearConversation();
    };
  }, []);

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

  // Additional debug for Thai messages - fix the comparison to use lowercase comparison
  if (currentLanguage.toLowerCase() === 'thai') {
    console.log('Practice component rendering with Thai:', {
      messageCount: messages.length,
      hasTranslations: messages.filter(m => m.translation).length,
      currentLanguage
    });
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