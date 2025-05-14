
import { useState, useEffect, useCallback } from "react";
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
  grammar?: string;
  topic?: string;
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

export const usePronunciationExercise = () => {
  const [complexity, setComplexity] = useState<ComplexityLevel | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [practicedPhrases, setPracticedPhrases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { t } = useLocalization();
  const { toast } = useToast();
  const { analyzeConversation } = useLanguageAnalysis();
  
  const {
    isListening,
    transcript,
    toggleListening,
    handleSendTranscript,
    clearTranscript
  } = useVoiceSpeechRecognition({
    targetLanguage: "spanish",
    onTranscriptChange: () => {},
    onSendTranscript: () => {}
  });

  // Generate a phrase based on complexity
  const generatePracticePhrase = useCallback(async (level: ComplexityLevel) => {
    setIsLoading(true);
    try {
      // In a real implementation, we would call an API to generate phrases
      // For now, we'll use some predefined phrases based on level
      const phrases: Record<ComplexityLevel, Exercise[]> = {
        Novice: [
          { phrase: "Buenos días", translation: "Good morning" },
          { phrase: "¿Cómo estás?", translation: "How are you?" },
          { phrase: "Me llamo Juan", translation: "My name is Juan" },
          { phrase: "Gracias por tu ayuda", translation: "Thank you for your help" }
        ],
        Intermediate: [
          { phrase: "Me gustaría practicar mi español", translation: "I would like to practice my Spanish" },
          { phrase: "¿Podrías hablar más despacio?", translation: "Could you speak more slowly?" },
          { phrase: "Estoy aprendiendo un nuevo idioma", translation: "I am learning a new language" },
          { phrase: "No entiendo esta palabra", translation: "I don't understand this word" }
        ],
        Advanced: [
          { phrase: "La pronunciación es esencial para comunicarse eficazmente", translation: "Pronunciation is essential for effective communication" },
          { phrase: "Deberíamos considerar todas las opciones disponibles", translation: "We should consider all available options" },
          { phrase: "La práctica constante mejora la fluidez", translation: "Constant practice improves fluency" },
          { phrase: "Es importante entender el contexto cultural", translation: "It's important to understand the cultural context" }
        ],
        Superior: [
          { phrase: "La adquisición del lenguaje es un proceso cognitivo complejo que involucra múltiples regiones cerebrales", translation: "Language acquisition is a complex cognitive process involving multiple brain regions" },
          { phrase: "Las diferencias fonéticas entre idiomas pueden presentar desafíos significativos para los estudiantes", translation: "Phonetic differences between languages can present significant challenges for students" },
          { phrase: "El bilingüismo tiene efectos positivos en la plasticidad neuronal y las funciones ejecutivas", translation: "Bilingualism has positive effects on neuronal plasticity and executive functions" },
          { phrase: "La inmersión lingüística es generalmente considerada el método más eficaz para alcanzar la fluidez", translation: "Linguistic immersion is generally considered the most effective method to achieve fluency" }
        ]
      };

      // Filter out already practiced phrases
      const availablePhrases = phrases[level].filter(
        exercise => !practicedPhrases.includes(exercise.phrase)
      );

      // If all phrases have been practiced, reset and use all of them
      const phrasePool = availablePhrases.length > 0 ? availablePhrases : phrases[level];
      
      // Select a random phrase
      const randomPhrase = phrasePool[Math.floor(Math.random() * phrasePool.length)];
      
      // Add to practiced phrases
      setPracticedPhrases(prev => [...prev, randomPhrase.phrase]);
      
      // Track this as a message for metrics
      const systemMessage: Message = {
        role: "system",
        content: `Pronunciation exercise (${level}): ${randomPhrase.phrase}`
      };
      
      const assistantMessage: Message = {
        role: "assistant",
        content: randomPhrase.phrase
      };
      
      setMessages(prev => [...prev, systemMessage, assistantMessage]);
      
      return randomPhrase;
    } catch (error) {
      console.error("Error generating practice phrase:", error);
      toast({
        title: t("error"),
        description: t("failedToGeneratePhrase"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [t, toast, practicedPhrases]);

  // Set up a new exercise when complexity changes
  useEffect(() => {
    if (complexity) {
      generatePracticePhrase(complexity).then(exercise => {
        if (exercise) {
          setCurrentExercise(exercise);
          setFeedback(null);
        }
      });
    }
  }, [complexity, generatePracticePhrase]);

  // Start recording user's pronunciation
  const handleStartRecording = useCallback(() => {
    setFeedback(null);
    clearTranscript();
    toggleListening();
  }, [toggleListening, clearTranscript]);

  // Stop recording and analyze pronunciation
  const handleStopRecording = useCallback(async () => {
    if (!currentExercise || !transcript) return;
    
    toggleListening();
    setIsLoading(true);
    
    try {
      // Add user's attempt to messages for metrics
      const userMessage: Message = {
        role: "user",
        content: transcript
      };
      
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

  // Move to next exercise
  const handleNextExercise = useCallback(() => {
    if (complexity) {
      setFeedback(null);
      clearTranscript();
      generatePracticePhrase(complexity).then(exercise => {
        if (exercise) {
          setCurrentExercise(exercise);
        }
      });
    }
  }, [complexity, generatePracticePhrase, clearTranscript]);

  // Try the same exercise again
  const handleTryAgain = useCallback(() => {
    setFeedback(null);
    clearTranscript();
  }, [clearTranscript]);

  return {
    complexity,
    setComplexity,
    currentExercise,
    isLoading,
    isRecording: isListening,
    transcript,
    speechRate,
    setSpeechRate,
    feedback,
    messages,
    handleStartRecording,
    handleStopRecording,
    handleNextExercise,
    handleTryAgain
  };
};
