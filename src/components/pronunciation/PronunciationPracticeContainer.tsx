
import React, { useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import ComplexityDropdown from "./ComplexityDropdown";
import PhraseDisplay from "./PhraseDisplay";
import RecordingControls from "./RecordingControls";
import PronunciationFeedback from "./PronunciationFeedback";
import PronunciationInstructions from "./PronunciationInstructions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, Volume2 } from "lucide-react";
import { usePronunciationExercise } from "./hooks/usePronunciationExercise";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { motion } from "framer-motion";


const PronunciationPracticeContainer = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const {
    complexity,
    setComplexity,
    currentExercise,
    isLoading,
    isRecording,
    isProcessing,
    isInitializing,
    isAnalyzing,
    transcript,
    feedback,
    messages,
    showExercise,
    handleStartExercise,
    handleStartRecording,
    handleStopRecording,
    handleSubmitPronunciation,
    handleNextExercise,
    handleTryAgain,
    handleBackToLevels,
    isGenerating,
    levelDescriptions,
    targetLanguage
  } = usePronunciationExercise();
  
  // Read URL parameters for deep linking
  const searchParams = new URLSearchParams(window.location.search);
  const urlLevel = searchParams.get('level');
  
  useEffect(() => {
    // Map URL level parameter to complexity
    if (urlLevel) {
      const levelMap: Record<string, string> = {
        'A1': 'novice',
        'A2': 'novice',
        'B1': 'intermediate',
        'B2': 'advanced',
        'C1': 'advanced',
        'C2': 'superior'
      };
      const mappedComplexity = levelMap[urlLevel];
      if (mappedComplexity) {
        setComplexity(mappedComplexity as any);
      }
    }
  }, [urlLevel, setComplexity]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
              <Volume2 className="w-10 h-10 md:w-12 md:h-12" />
              {t("pronunciationPractice")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              {t("improvePronunciationSkillsWith", { language: targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1) })}
            </p>
          </div>
        </motion.div>

        {!showExercise ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="glass">
            <CardHeader>
              <CardTitle>{t("selectComplexityLevel")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("chooseDifficultyLevelBasedOn")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <ComplexityDropdown 
                selectedComplexity={complexity} 
                onSelect={setComplexity} 
              />
              
              {complexity && (
                <div className="mt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {levelDescriptions[complexity].title} - {levelDescriptions[complexity].actflLabel}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("levelDescription")}
                    </p>
                    <p>
                      {levelDescriptions[complexity].description}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleStartExercise}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? t("generatingExercise") : t("startExercise")}
                  </Button>
                </div>
              )}

              {!complexity && (
                <p className="text-center text-muted-foreground py-8">
                  {t("selectLevelToStart")}
                </p>
              )}
            </CardContent>
          </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>{t("pronunciationPracticeTips")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• {t("listenCarefullyTip")}</li>
                <li>• {t("payAttentionToStressTip")}</li>
                <li>• {t("practiceDifficultSoundsTip")}</li>
                <li>• {t("recordYourselfTip")}</li>
                <li>• {t("bePatientTip")}</li>
              </ul>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6 glass">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleBackToLevels}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{t("practiceExercise")}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {complexity}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentExercise && (
              <PhraseDisplay 
                phrase={currentExercise.phrase}
                translation={currentExercise.translation}
                topic={currentExercise.topic}
              />
            )}

            <RecordingControls
              isRecording={isRecording}
              isProcessing={isProcessing}
              isInitializing={isInitializing}
              isAnalyzing={isAnalyzing}
              transcript={transcript}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onSubmitPronunciation={handleSubmitPronunciation}
            />

            {feedback && (
              <PronunciationFeedback feedback={feedback} />
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTryAgain}
                disabled={isRecording || isLoading || isInitializing || isAnalyzing}
              >
                {t("tryAgain")}
              </Button>
              <Button 
                onClick={handleNextExercise}
                disabled={isRecording || isLoading || isGenerating || isInitializing || isAnalyzing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isGenerating ? t("generatingNewPhrase") : t("newPhrase")}
              </Button>
            </div>
            </CardContent>
          </Card>
        </motion.div>
        )}
      </div>
    </div>
  );
};

export default PronunciationPracticeContainer;
