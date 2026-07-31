import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import ConversationFeedbackCard from "@/components/practice/ConversationFeedbackCard";
import ScenarioPicker from "@/components/practice/ScenarioPicker";
import ScenarioChip from "@/components/practice/ScenarioChip";
import { useChatMessages, type DebriefFeedback } from "@/components/practice/hooks/useChatMessages";
import { getScenario } from "@/data/conversationScenarios";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
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

// Map CEFR levels (from placement or deep links) to conversation levels.
const cefrToLevel: Record<string, string> = {
  'A1': 'basic',
  'A2': 'basic',
  'B1': 'intermediate',
  'B2': 'advanced',
  'C1': 'advanced',
  'C2': 'advanced'
};

const Practice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();
  const [targetLanguage, setTargetLanguage] = useState<string>("english");
  const [conversationLevel, setConversationLevel] = useState<string>("intermediate");
  const [bilingualMode, setBilingualMode] = useState<boolean>(false);
  const { showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();
  const { showXPNotification, lastXPGain } = useXPNotification();
  
  // Read URL parameters for deep linking and scenario selection
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLevel = searchParams.get('level');
  const selectedScenario = getScenario(searchParams.get('scenario'));
  const scenarioId = selectedScenario?.id ?? null;

  useEffect(() => {
    const savedTargetLanguage = appStorage.get("targetLanguage");

    if (savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    } else if (currentLanguage !== "english") {
      // ESL default: learners whose native language isn't English learn English.
      setTargetLanguage("english");
    }
  }, [currentLanguage]);

  useEffect(() => {
    let cancelled = false;

    const applyLevel = (level: string) => {
      if (!cancelled) setConversationLevel(level);
    };

    const resolveLevel = async () => {
      if (urlLevel) {
        // Deep-link level parameter wins.
        const mappedLevel = cefrToLevel[urlLevel] || 'intermediate';
        applyLevel(mappedLevel);
        localStorage.setItem("conversationLevel", mappedLevel);
        return;
      }

      // Prefer the placement result stored on the learner's profile.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('placement_cefr')
            .eq('id', user.id)
            .maybeSingle();
          const placementCefr = !error && data?.placement_cefr ? data.placement_cefr : null;
          if (placementCefr) {
            const normalized = placementCefr.split('/')[0].replace('+', '').toUpperCase();
            if (cefrToLevel[normalized]) {
              applyLevel(cefrToLevel[normalized]);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Could not read placement level from profile:', error);
      }

      // Fall back to the existing local storage path.
      const storedLevel = localStorage.getItem("conversationLevel");
      if (storedLevel) {
        applyLevel(storedLevel);
      } else {
        // Fall back to the learner's placement quiz result.
        const placement = appStorage.get("placementLevel");
        if (placement && cefrToLevel[placement]) {
          applyLevel(cefrToLevel[placement]);
        }
      }
    };

    resolveLevel();
    return () => { cancelled = true; };
  }, [urlLevel]);
  
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
    toggleGrammarCorrection,
    requestDebrief
  } = useChatMessages(conversationLevel, scenarioId);

  // The conversation is intentionally kept when navigating away so a student
  // who taps into Review or a lesson doesn't lose their chat; they can clear
  // it explicitly with the Clear Conversation button.

  // ----- Scenario selection (stored in the "scenario" query param) -----
  const handleScenarioSelect = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('scenario', id);
    setSearchParams(next, { replace: true });
  };

  const handleScenarioClear = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('scenario');
    setSearchParams(next, { replace: true });
  };

  // ----- End-of-conversation feedback -----
  const [feedback, setFeedback] = useState<DebriefFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // A new scenario means a new conversation goal; drop stale feedback.
  useEffect(() => {
    setFeedback(null);
    setFeedbackError(null);
  }, [scenarioId]);

  const learnerMessageCount = messages.filter(msg => msg.role === "user").length;

  const handleEndConversation = async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);
    setFeedback(null);
    try {
      const result = await requestDebrief();
      setFeedback(result);
    } catch (error) {
      console.error('Debrief failed:', error);
      setFeedbackError("Could not make feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const dismissFeedback = () => {
    setFeedback(null);
    setFeedbackError(null);
  };

  const handleTalkAgain = async () => {
    dismissFeedback();
    await clearConversation();
  };

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
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="relative z-10 mx-auto max-w-4xl p-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PracticeHeader targetLanguage={targetLanguage} />
        </motion.div>
        
        {/* Scenario selection is the front door: until a conversation is
            chosen, the picker IS the page. The chat only exists once a
            scenario (including "Just talk") has been picked. */}
        <div className="mb-6">
          {selectedScenario ? (
            <ScenarioChip
              scenario={selectedScenario}
              onChange={handleScenarioClear}
            />
          ) : (
            <ScenarioPicker onSelect={handleScenarioSelect} />
          )}
        </div>

        {selectedScenario && (
        <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        >
          <PracticePromptButton
            onClick={sendLanguageLearningPrompt}
            isLoading={chatLoading}
            targetLanguage={targetLanguage}
          />

          <Button
            variant="ghost"
            onClick={clearConversation}
            className="gap-2 self-end text-muted-foreground hover:text-foreground sm:self-auto"
          >
            <Trash className="h-4 w-4" />
            {t("clearConversation")}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

        {(feedbackLoading || feedbackError || feedback) ? (
          <div className="mt-5">
            <ConversationFeedbackCard
              feedback={feedback}
              isLoading={feedbackLoading}
              error={feedbackError}
              onTalkAgain={handleTalkAgain}
              onKeepTalking={dismissFeedback}
            />
          </div>
        ) : learnerMessageCount >= 4 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 flex justify-center"
          >
            {/* Finishing is a positive step: it unlocks the feedback reward. */}
            <Button
              size="lg"
              onClick={handleEndConversation}
              className="w-full gap-2 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              End conversation
            </Button>
          </motion.div>
        ) : null}

        {/* Quiet settings — secondary to the conversation itself. */}
        <Card className="mt-6">
          <div className="divide-y divide-border/50 px-5 py-1">
            {/* Grammar Correction Toggle */}
            <div className="flex items-center justify-between gap-4 py-4">
              <Label
                htmlFor="grammar-correction"
                className="flex items-center gap-2.5 text-sm font-semibold"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                {t("correctGrammar") || "Grammar Correction"}
              </Label>
              <Switch
                id="grammar-correction"
                checked={correctGrammar}
                onCheckedChange={toggleGrammarCorrection}
              />
            </div>

            {/* Bilingual Mode Toggle */}
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <Label
                  htmlFor="bilingual-mode"
                  className="flex items-center gap-2.5 text-sm font-semibold"
                >
                  <Languages className="h-4 w-4 text-accent" />
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
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
         <PracticeGuide targetLanguage={targetLanguage} />
        </motion.div>
        </>
        )}
      </div>
    </div>
    </>
  );
};

export default Practice;