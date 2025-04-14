
import { useState, useEffect } from "react";
import { ELEVEN_LABS_AGENT_ID } from "@/utils/constants";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@11labs/react";
import { supabase } from "@/integrations/supabase/client";
import { 
  analyzeSpeakingComplexity,
  calculateEnhancedScore,
  determineLevel,
  generateDetailedFeedback
} from "@/components/certifications/utils/scoreUtils";
import { useTestState } from "./useTestState";
import { useAttemptManagement } from "./useAttemptManagement";
import { useConversationTranscript } from "./useConversationTranscript";

export interface UseConversationTestProps {
  onTestComplete?: (() => void) | undefined;
}

export const useConversationTest = ({ onTestComplete }: UseConversationTestProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "transcription") {
        transcript.addUserMessage(message);
      } else if (message.type === "llm_response") {
        transcript.addAIResponse(message);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testState = useTestState();
  const attemptManager = useAttemptManagement();
  const transcript = useConversationTranscript(attemptManager.attemptId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkAuth();

    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use the conversational test.",
          variant: "destructive",
        });
      }
    };
    initMicrophone();
  }, [toast]);

  const startTest = async () => {
    if (!isLoggedIn || !microphoneAccess) return;
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Could not identify current user");
      }

      const attempts = await attemptManager.createAttempts(user.id);
      if (!attempts) throw new Error("Failed to create attempts");

      sessionStorage.setItem('speakingAttemptId', attempts.speakingAttemptId);
      sessionStorage.setItem('listeningAttemptId', attempts.listeningAttemptId);

      await conversation.startSession({
        agentId: ELEVEN_LABS_AGENT_ID,
      });

      testState.startTest();
      
      toast({
        title: "Test Started",
        description: "Begin speaking with the AI tutor",
      });
    } catch (error: any) {
      console.error("Error starting test:", error);
      toast({
        title: "Error",
        description: "Failed to start the test: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endTest = async () => {
    if (conversation.status === "connected") {
      try {
        await conversation.endSession();
      } catch (convError) {
        console.error("Error ending conversation session:", convError);
      }
    }

    setIsLoading(true);
    
    try {
      const speakingAttemptId = sessionStorage.getItem('speakingAttemptId');
      const listeningAttemptId = sessionStorage.getItem('listeningAttemptId');
      
      if (!speakingAttemptId || !listeningAttemptId) {
        throw new Error("Could not find attempt IDs");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (transcript.transcriptState.userMessages.length < 2) {
        throw new Error("The conversation was too short to evaluate properly");
      }

      const userMessages = transcript.transcriptState.userMessages;
      const messageCount = userMessages.length;
      const totalWords = userMessages.reduce((count, msg) => 
        count + (msg.content?.split(/\s+/).length || 0), 0);
      const avgWordsPerResponse = messageCount > 0 ? Math.round(totalWords / messageCount) : 0;
      const speechComplexity = analyzeSpeakingComplexity(userMessages);
      
      const speakingScore = calculateEnhancedScore(speechComplexity, messageCount);
      const listeningScore = Math.max(50, Math.round(speakingScore * 0.95));
      const speakingLevel = determineLevel(speakingScore);
      const listeningLevel = determineLevel(listeningScore);

      const feedbackData = generateDetailedFeedback(
        speechComplexity,
        messageCount,
        avgWordsPerResponse,
        speakingLevel
      );

      const result = {
        speaking: {
          overallScore: speakingScore,
          level: speakingLevel,
          pronunciation: Math.max(4, Math.min(10, Math.round(speechComplexity))),
          fluency: Math.max(4, Math.min(10, Math.round(speechComplexity))),
          grammar: Math.max(4, Math.round(speechComplexity - 1))
        },
        listening: {
          overallScore: listeningScore,
          level: listeningLevel,
          understanding: Math.max(4, Math.min(10, Math.round(speechComplexity))),
          vocabulary: Math.max(4, Math.round(speechComplexity - 0.5)),
          interaction: Math.max(4, Math.min(10, Math.round(speechComplexity)))
        },
        feedback: feedbackData.feedback,
        strengths: feedbackData.strengths,
        areasToImprove: feedbackData.areasToImprove
      };

      await transcript.saveTranscript(user.id, result);
      await attemptManager.updateAttempts(
        speakingAttemptId,
        listeningAttemptId,
        speakingScore,
        listeningScore,
        speakingLevel,
        listeningLevel
      );

      testState.completeTest(result);
      
      if (onTestComplete) {
        onTestComplete();
      }

      window.dispatchEvent(new CustomEvent('fluency-test-completed'));
      
      toast({
        title: "Test Complete",
        description: `Speaking: ${speakingLevel} (${speakingScore}%), Listening: ${listeningLevel} (${listeningScore}%)`,
      });
    } catch (error: any) {
      console.error("Error ending test:", error);
      toast({
        title: "Error",
        description: error.message || "There was an issue saving your results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isStarted: testState.isStarted,
    isComplete: testState.isComplete,
    timeRemaining: testState.timeRemaining,
    isLoggedIn,
    microphoneAccess,
    testResult: testState.testResult,
    isLoading,
    conversation,
    startTest,
    endTest,
    resetTest: testState.resetTest
  };
};
