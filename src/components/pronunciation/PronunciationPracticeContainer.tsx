
import React, { useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import ComplexityDropdown from "./ComplexityDropdown";
import PhraseDisplay from "./PhraseDisplay";
import RecordingControls from "./RecordingControls";
import PronunciationFeedback from "./PronunciationFeedback";
import PronunciationInstructions from "./PronunciationInstructions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, Volume2, Target, BookOpen, Headphones, Mic, Trophy, Sparkles, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { usePronunciationExercise } from "./hooks/usePronunciationExercise";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { motion } from "framer-motion";


const PronunciationPracticeContainer = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const [speechRate, setSpeechRate] = React.useState(1.0);
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
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palavox-teal/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="inline-flex items-center justify-center gap-3 mb-4"
            >
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-sm border border-primary/20">
                <Volume2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              {t("pronunciationPractice")}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground"
            >
              {t("improvePronunciationSkillsWith", { language: targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1) })}
            </motion.p>
          </div>
        </motion.div>

        {!showExercise ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className="glass border-primary/20 h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 hover:border-primary/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t("selectComplexityLevel")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("chooseDifficultyLevelBasedOn")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
              
              <ComplexityDropdown 
                selectedComplexity={complexity} 
                onSelect={setComplexity} 
              />
              
              {complexity && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6"
                >
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {levelDescriptions[complexity].title} - {levelDescriptions[complexity].actflLabel}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("levelDescription")}
                    </p>
                    <p className="text-sm">
                      {levelDescriptions[complexity].description}
                    </p>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleStartExercise}
                      disabled={isGenerating}
                      className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          {t("generatingExercise")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          {t("startExercise")}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {!complexity && (
                <p className="text-center text-muted-foreground py-8">
                  {t("selectLevelToStart")}
                </p>
              )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className="glass border-primary/20 h-full bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 hover:border-green-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-green-600" />
                    {t("pronunciationPracticeTips")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-4">
                    {[
                      { icon: Mic, text: t("listenCarefullyTip") },
                      { icon: Volume2, text: t("payAttentionToStressTip") },
                      { icon: RefreshCw, text: t("practiceDifficultSoundsTip") },
                      { icon: Mic, text: t("recordYourselfTip") },
                      { icon: Trophy, text: t("bePatientTip") }
                    ].map((tip, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent hover:from-green-500/20 transition-all group"
                      >
                        <tip.icon className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5" />
                        <span className="text-sm flex-1">{tip.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="mb-6 glass border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50 pointer-events-none" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 hover:bg-primary/20 transition-all"
                        onClick={handleBackToLevels}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </motion.div>
                    <span className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {t("practiceExercise")}
                    </span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur-sm"
                  >
                    {complexity}
                  </motion.span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-5 rounded-xl border border-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="speech-rate" className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      {t("speechRate")}
                    </Label>
                    <motion.span
                      key={speechRate}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full"
                    >
                      {speechRate.toFixed(1)}x
                    </motion.span>
                  </div>
                  <Slider
                    id="speech-rate"
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={[speechRate]}
                    onValueChange={(value) => setSpeechRate(value[0])}
                    className="w-full"
                  />
                </motion.div>

            {currentExercise && (
              <PhraseDisplay 
                phrase={currentExercise.phrase}
                translation={currentExercise.translation}
                topic={currentExercise.topic}
                speechRate={speechRate}
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

                <div className="flex justify-between gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button 
                      variant="outline" 
                      onClick={handleTryAgain}
                      disabled={isRecording || isLoading || isInitializing || isAnalyzing}
                      className="w-full py-6 text-base font-semibold border-2 hover:bg-primary/10 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {t("tryAgain")}
                      </span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button 
                      onClick={handleNextExercise}
                      disabled={isRecording || isLoading || isGenerating || isInitializing || isAnalyzing}
                      className="w-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          {t("generatingNewPhrase")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {t("newPhrase")}
                        </span>
                      )}
                    </Button>
                  </motion.div>
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
