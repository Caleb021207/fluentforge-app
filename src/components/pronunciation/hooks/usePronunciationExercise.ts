
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import { Message } from "@/types/chat";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { transcribeAudio, analyzePronunciation, PronunciationAnalysisResult } from "@/utils/pronunciationUtils";

type ComplexityLevel = "Novice" | "Intermediate" | "Advanced" | "Superior";

interface Exercise {
  phrase: string;
  translation: string;
  topic?: string;
  level?: string;
}

interface LevelDescription {
  title: string;
  description: string;
  actflLabel: string;
}

export const usePronunciationExercise = () => {
  const [complexity, setComplexity] = useState<ComplexityLevel | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationAnalysisResult | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExercise, setShowExercise] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const { t } = useLocalization();
  const { toast } = useToast();
  const { analyzeConversation } = useLanguageAnalysis();
  
  // Using our new audio recording hook
  const { 
    isRecording, 
    isProcessing, 
    base64Audio, 
    startRecording, 
    stopRecording 
  } = useAudioRecording({
    onRecordingComplete: async (audioData) => {
      if (currentExercise) {
        try {
          const transcribed = await transcribeAudio(audioData);
          setTranscript(transcribed);
          await processPronunciationFeedback(transcribed);
        } catch (error) {
          console.error("Error processing audio:", error);
          toast({
            title: t("error"),
            description: t("failedToProcessAudio"),
            variant: "destructive",
          });
        }
      }
    }
  });

  // Level descriptions mapping
  const levelDescriptions: Record<ComplexityLevel, LevelDescription> = {
    Novice: {
      title: t("novice"),
      description: t("noviceLevelDescription"),
      actflLabel: "ACTFL Novice"
    },
    Intermediate: {
      title: t("intermediate"),
      description: t("intermediateLevelDescription"),
      actflLabel: "ACTFL Intermediate"
    },
    Advanced: {
      title: t("advanced"),
      description: t("advancedLevelDescription"),
      actflLabel: "ACTFL Advanced"
    },
    Superior: {
      title: t("superior"),
      description: t("superiorLevelDescription"),
      actflLabel: "ACTFL Superior"
    }
  };

  // Generate a phrase based on complexity using the edge function
  const generatePracticePhrase = useCallback(async (level: ComplexityLevel) => {
    setIsGenerating(true);
    try {
      // Call the edge function to generate a phrase
      const { data, error } = await supabase.functions.invoke("generate-pronunciation-phrase", {
        body: {
          targetLanguage: "spanish", // This should come from user's language settings
          level: level
        }
      });

      if (error || !data) {
        console.error("Error generating practice phrase:", error);
        toast({
          title: t("error"),
          description: t("failedToGeneratePhrase"),
          variant: "destructive",
        });
        return null;
      }

      // Track this as a message for metrics
      const systemMessage: Message = {
        role: "system",
        content: `Pronunciation exercise (${level}): ${data.phrase}`
      };
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.phrase
      };
      
      setMessages(prev => [...prev, systemMessage, assistantMessage]);
      
      return data as Exercise;
    } catch (error) {
      console.error("Error generating practice phrase:", error);
      toast({
        title: t("error"),
        description: t("failedToGeneratePhrase"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [t, toast]);

  // Process the pronunciation feedback
  const processPronunciationFeedback = async (transcribed: string) => {
    if (!currentExercise) return;
    
    setIsLoading(true);
    
    try {
      // Add user's attempt to messages for metrics
      const userMessage: Message = {
        role: "user",
        content: transcribed
      };
      
      if (!transcribed.trim()) {
        toast({
          title: t("noSpeechDetected"),
          description: t("pleaseTryAgain"),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setMessages(prev => [...prev, userMessage]);
      
      // Get pronunciation analysis from our utility function
      const analysisResult = await analyzePronunciation(
        currentExercise.phrase,
        transcribed
      );
      
      setFeedback(analysisResult);
      
      // Analyze conversation for metrics if enough messages
      if (messages.length >= 4) {
        await analyzeConversation([...messages, userMessage], {
          sessionId: `pronunciation-${Date.now()}`,
          silent: true
        });
      }
      
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      toast({
        title: t("error"),
        description: t("failedToAnalyzePronunciation"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new exercise
  const handleStartExercise = useCallback(async () => {
    if (!complexity) return;
    
    setShowExercise(true);
    setFeedback(null);
    setTranscript("");
    
    const exercise = await generatePracticePhrase(complexity);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, [complexity, generatePracticePhrase]);

  // Start recording user's pronunciation
  const handleStartRecording = useCallback(() => {
    setFeedback(null);
    setTranscript("");
    startRecording();
  }, [startRecording]);

  // Stop recording and get transcription/analysis
  const handleStopRecording = useCallback(() => {
    stopRecording();
    // Transcription and analysis happens in the onRecordingComplete callback
  }, [stopRecording]);

  // Get a new phrase at the same complexity level
  const handleNextExercise = useCallback(async () => {
    if (!complexity) return;
    
    setFeedback(null);
    setTranscript("");
    
    const exercise = await generatePracticePhrase(complexity);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, [complexity, generatePracticePhrase]);

  // Try the same exercise again
  const handleTryAgain = useCallback(() => {
    setFeedback(null);
    setTranscript("");
  }, []);

  // Reset to level selection
  const handleBackToLevels = useCallback(() => {
    setShowExercise(false);
    setCurrentExercise(null);
    setFeedback(null);
  }, []);

  return {
    complexity,
    setComplexity,
    currentExercise,
    isLoading,
    isRecording,
    isProcessing,
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
  };
};
