
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import ComplexityDropdown from "./ComplexityDropdown";
import SpeechRateControl from "./SpeechRateControl";
import PhraseDisplay from "./PhraseDisplay";
import RecordingControls from "./RecordingControls";
import PronunciationFeedback from "./PronunciationFeedback";
import PronunciationInstructions from "./PronunciationInstructions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft } from "lucide-react";
import { usePronunciationExercise } from "./hooks/usePronunciationExercise";
import ViewLanguageMetricsButton from "@/components/voice-chat/ViewLanguageMetricsButton";

const PronunciationPracticeContainer = () => {
  const { t } = useLocalization();
  const {
    complexity,
    setComplexity,
    currentExercise,
    isLoading,
    isRecording,
    transcript,
    speechRate,
    setSpeechRate,
    feedback,
    messages,
    showExercise,
    handleStartExercise,
    handleStartRecording,
    handleStopRecording,
    handleNextExercise,
    handleTryAgain,
    handleBackToLevels,
    isGenerating,
    levelDescriptions
  } = usePronunciationExercise();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pronunciationPractice")}</h1>
          <p className="text-muted-foreground">{t("improvePronunciationSkillsWith", { language: "Spanish" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <SpeechRateControl 
            speechRate={speechRate} 
            setSpeechRate={setSpeechRate} 
          />
          {messages.length >= 4 && <ViewLanguageMetricsButton messages={messages} />}
        </div>
      </div>

      {!showExercise ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("selectComplexityLevel")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("chooseDifficultyLevelBasedOn")}
              </p>
              
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
            </CardContent>
          </Card>
          
          <PronunciationInstructions />
        </div>
      ) : (
        <Card className="mb-6">
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
                speechRate={speechRate}
                topic={currentExercise.topic}
              />
            )}

            <RecordingControls
              isRecording={isRecording}
              transcript={transcript}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />

            {feedback && (
              <PronunciationFeedback feedback={feedback} />
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTryAgain}
                disabled={isRecording || isLoading}
              >
                {t("tryAgain")}
              </Button>
              <Button 
                onClick={handleNextExercise}
                disabled={isRecording || isLoading || isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isGenerating ? t("generatingNewPhrase") : t("newPhrase")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PronunciationPracticeContainer;
