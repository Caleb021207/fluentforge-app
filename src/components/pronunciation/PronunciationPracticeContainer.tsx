
import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import ComplexityDropdown from "./ComplexityDropdown";
import SpeechRateControl from "./SpeechRateControl";
import PhraseDisplay from "./PhraseDisplay";
import RecordingControls from "./RecordingControls";
import PronunciationFeedback from "./PronunciationFeedback";
import PronunciationInstructions from "./PronunciationInstructions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, RefreshCw } from "lucide-react";
import { usePronunciationExercise } from "../pronunciation/hooks/usePronunciationExercise";
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
    handleStartRecording,
    handleStopRecording,
    handleNextExercise,
    handleTryAgain
  } = usePronunciationExercise();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pronunciationPractice")}</h1>
          <p className="text-muted-foreground">{t("improvePronunciationSkills")}</p>
        </div>
        <div className="flex items-center gap-2">
          <SpeechRateControl 
            speechRate={speechRate} 
            setSpeechRate={setSpeechRate} 
          />
          {messages.length >= 4 && <ViewLanguageMetricsButton messages={messages} />}
        </div>
      </div>

      <ComplexityDropdown 
        selectedComplexity={complexity} 
        onSelect={setComplexity} 
      />

      {currentExercise && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{t("practiceExercise")}</span>
              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {complexity}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <PhraseDisplay 
              phrase={currentExercise.phrase}
              translation={currentExercise.translation}
              speechRate={speechRate}
            />

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
                disabled={isRecording || isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t("newPhrase")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentExercise && !complexity && (
        <PronunciationInstructions />
      )}
    </div>
  );
};

export default PronunciationPracticeContainer;
