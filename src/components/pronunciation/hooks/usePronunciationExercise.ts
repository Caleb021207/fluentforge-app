
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import { Message } from "@/types/chat";
import { analyzePronunciation, PronunciationAnalysisResult } from "@/utils/pronunciationUtils";
import { useRealTimeTranscription } from "./useRealTimeTranscription";
import { getTargetLanguage } from "@/utils/languageConstants";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExercise, setShowExercise] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const { analyzeConversation } = useLanguageAnalysis();
  
  // Get the target language for practice
  const targetLanguage = getTargetLanguage(currentLanguage);
  
  // Language code mapping for transcription
  const getLanguageCode = (lang: string) => {
    const codes = {
      'spanish': 'es',
      'english': 'en',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'japanese': 'ja',
      'korean': 'ko',
      'mandarin': 'zh',
      'russian': 'ru',
      'arabic': 'ar',
      'hindi': 'hi'
    };
    return codes[lang] || 'en';
  };
  
  // Using real-time transcription for pronunciation practice
  const { 
    isListening: isRecording, 
    isInitializing,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useRealTimeTranscription({
    targetLanguage,
    onTranscriptComplete: async (finalTranscript) => {
      // Just log completion, don't auto-analyze
      console.log("Real-time transcription completed:", finalTranscript);
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
      console.log(`Generating new ${level} phrase in ${targetLanguage}...`);
      // Call the edge function to generate a phrase with timestamp for uniqueness
      const { data, error } = await supabase.functions.invoke("generate-pronunciation-phrase", {
        body: {
          targetLanguage: targetLanguage,
          level: level,
          nativeLanguage: currentLanguage,
          timestamp: Date.now() // Add timestamp for uniqueness
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

      console.log("Generated phrase:", data.phrase);

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
  }, [t, toast, targetLanguage, currentLanguage]);

  // Process the pronunciation feedback
  const processPronunciationFeedback = async (transcribed: string) => {
    if (!currentExercise) return;
    
    setIsAnalyzing(true);
    
    try {
      console.log(`Analyzing pronunciation for "${currentExercise.phrase}" vs "${transcribed}"`);
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
        setIsAnalyzing(false);
        return;
      }
      
      setMessages(prev => [...prev, userMessage]);
      
      // Get pronunciation analysis from our utility function
      const languageCode = getLanguageCode(targetLanguage);
      const nativeLanguageCode = getLanguageCode(currentLanguage);
      const analysisResult = await analyzePronunciation(
        currentExercise.phrase,
        transcribed,
        languageCode,
        nativeLanguageCode
      );
      
      console.log("Pronunciation analysis result:", analysisResult);
      setFeedback(analysisResult);
      
      // Persist pronunciation score to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: insertError } = await supabase
            .from('student_language_metrics')
            .insert({
              user_id: user.id,
              session_id: `pronunciation-${Date.now()}`,
              pronunciation_accuracy: analysisResult.accuracyScore,
              grammar_accuracy: null,
              conversation_complexity: null,
              message_count: 1
            });
          
          if (insertError) {
            console.error("Error saving pronunciation score:", insertError);
          }
        }
      } catch (error) {
        console.error("Error persisting pronunciation score:", error);
      }
      
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
      setIsAnalyzing(false);
    }
  };

  // Start a new exercise
  const handleStartExercise = useCallback(async () => {
    if (!complexity) return;
    
    setShowExercise(true);
    setFeedback(null);
    resetTranscript();
    
    const exercise = await generatePracticePhrase(complexity);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, [complexity, generatePracticePhrase]);

  // Start recording user's pronunciation
  const handleStartRecording = useCallback(() => {
    console.log("Starting pronunciation recording...");
    setFeedback(null);
    resetTranscript();
    setIsAnalyzing(false);
    startListening();
  }, [startListening, resetTranscript]);

  // Stop recording and get transcription/analysis
  const handleStopRecording = useCallback(() => {
    console.log("Stopping pronunciation recording...");
    stopListening();
  }, [stopListening]);

  // Submit pronunciation for analysis
  const handleSubmitPronunciation = useCallback(async () => {
    if (!transcript.trim()) {
      toast({
        title: t("noSpeechDetected"),
        description: t("pleaseTryAgain"),
        variant: "destructive",
      });
      return;
    }
    await processPronunciationFeedback(transcript);
  }, [transcript, processPronunciationFeedback, t, toast]);

  // Get a new phrase at the same complexity level
  const handleNextExercise = useCallback(async () => {
    if (!complexity) return;
    
    setFeedback(null);
    resetTranscript();
    
    const exercise = await generatePracticePhrase(complexity);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, [complexity, generatePracticePhrase]);

  // Try the same exercise again
  const handleTryAgain = useCallback(() => {
    console.log("Trying pronunciation exercise again...");
    setFeedback(null);
    resetTranscript();
    setIsAnalyzing(false);
  }, [resetTranscript]);

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
    isLoading: isAnalyzing, // Rename for clarity
    isRecording,
    isProcessing: false, // No longer needed with real-time transcription
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
  };
};
