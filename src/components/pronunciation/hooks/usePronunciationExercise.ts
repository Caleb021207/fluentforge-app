import { useState, useCallback, useEffect } from "react";
import { useVoiceSpeechRecognition } from "@/hooks/useVoiceSpeechRecognition";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { Message } from "@/types/chat";

type ComplexityLevel = "Novice" | "Intermediate" | "Advanced" | "Superior";

interface Exercise {
  phrase: string;
  translation: string;
  topic?: string;
  level?: string;
}

interface WordFeedback {
  word: string;
  isCorrect: boolean;
  suggestion?: string;
}

interface PronunciationFeedback {
  accuracyScore: number;
  wordAnalysis: WordFeedback[];
  overallFeedback: string;
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
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExercise, setShowExercise] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { t } = useLocalization();
  const { toast } = useToast();
  const { analyzeConversation } = useLanguageAnalysis();
  
  const {
    isListening,
    isInitializing,
    transcript,
    toggleListening,
    clearTranscript
  } = useVoiceSpeechRecognition({
    targetLanguage: "spanish",
    onTranscriptChange: () => {},
    onSendTranscript: () => {}
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

  // Start a new exercise
  const handleStartExercise = useCallback(async () => {
    if (!complexity) return;
    
    setShowExercise(true);
    setFeedback(null);
    clearTranscript();
    
    const exercise = await generatePracticePhrase(complexity);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, [complexity, generatePracticePhrase, clearTranscript]);

  // Start recording user's pronunciation
  const handleStartRecording = useCallback(() => {
    setFeedback(null);
    clearTranscript();
    toggleListening();
  }, [toggleListening, clearTranscript]);

  // Stop recording and analyze pronunciation
  const handleStopRecording = useCallback(async () => {
    if (!currentExercise) return;
    
    toggleListening();
    setIsLoading(true);
    
    try {
      // Add user's attempt to messages for metrics
      const userMessage: Message = {
        role: "user",
        content: transcript
      };
      
      if (!transcript.trim()) {
        toast({
          title: t("noSpeechDetected"),
          description: t("pleaseTryAgain"),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setMessages(prev => [...prev, userMessage]);
      
      // In a real implementation, we would call an API to analyze pronunciation
      // For demonstration, we'll simulate feedback based on transcript similarity
      
      // Split both phrases into words and normalize
      const expectedWords = currentExercise.phrase
        .toLowerCase()
        .replace(/[.,!?;:]/g, '')
        .split(/\s+/);
        
      const transcribedWords = transcript
        .toLowerCase()
        .replace(/[.,!?;:]/g, '')
        .split(/\s+/);
      
      // Compare words
      const wordAnalysis: WordFeedback[] = expectedWords.map(expectedWord => {
        const isPresent = transcribedWords.some(word => 
          word === expectedWord || 
          word.includes(expectedWord) || 
          expectedWord.includes(word)
        );
        
        return {
          word: expectedWord,
          isCorrect: isPresent,
          suggestion: isPresent ? undefined : expectedWord
        };
      });
      
      // Calculate accuracy score
      const correctWords = wordAnalysis.filter(w => w.isCorrect).length;
      const accuracyScore = (correctWords / expectedWords.length) * 100;
      
      // Generate feedback based on score
      let overallFeedback = "";
      if (accuracyScore >= 80) {
        overallFeedback = t("excellentPronunciationFeedback");
      } else if (accuracyScore >= 60) {
        overallFeedback = t("goodPronunciationFeedback");
      } else if (accuracyScore >= 40) {
        overallFeedback = t("fairPronunciationFeedback");
      } else {
        overallFeedback = t("needsImprovementPronunciationFeedback");
      }
      
      const feedbackResult: PronunciationFeedback = {
        accuracyScore,
        wordAnalysis,
        overallFeedback
      };
      
      setFeedback(feedbackResult);
      
      // If we have enough messages, analyze the conversation for metrics
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
  }, [currentExercise, transcript, toggleListening, messages, t, toast, analyzeConversation]);

  // Get a new phrase at the same complexity level
  const handleNextExercise = useCallback(async () => {
    if (!complexity) return;
    
    setFeedback(null);
    clearTranscript();
    
    const exercise = await generatePracticePhrase(complexity);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, [complexity, generatePracticePhrase, clearTranscript]);

  // Try the same exercise again
  const handleTryAgain = useCallback(() => {
    setFeedback(null);
    clearTranscript();
  }, [clearTranscript]);

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
    isRecording: isListening,
    isInitializing,
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
