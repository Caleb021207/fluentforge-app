import { useState, useEffect, useCallback } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  score: number;
  responses: string[];
  transcript: string;
}

interface UseConversationTestProps {
  onTestComplete?: () => void;
}

export const useConversationTest = ({ onTestComplete }: UseConversationTestProps = {}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTranscript, setConversationTranscript] = useState<string>("");
  const { t } = useLocalization();
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.role === "llm") {
        setTestResult(prevResult => ({
          ...prevResult,
          responses: [...(prevResult?.responses || []), message.text]
        }));
      }
    },
    onError: (error) => {
      console.error("Error in conversation test:", error);
      toast({
        title: t("error"),
        description: error?.toString() || String(error),
        variant: "destructive"
      });
    },
  });

  const endTest = useCallback(async () => {
    setIsStarted(false);
    setIsComplete(true);
    try {
      await conversation.endSession();
      const transcript = await conversation.getTranscript();
      setConversationTranscript(transcript);
      
      // Basic scoring logic (can be improved)
      const numResponses = transcript.split("User:").length - 1;
      const score = Math.min(numResponses * 5, 100); // Example scoring
      
      setTestResult({
        score: score,
        responses: [],
        transcript: transcript
      });
      
      if (onTestComplete) {
        onTestComplete();
      }
    } catch (error) {
      console.error("Error ending conversation:", error);
      toast({
        title: t("error"),
        description: "Failed to finalize test results.",
        variant: "destructive"
      });
    }
  }, [conversation, onTestComplete, t, toast]);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setIsLoading(false);
    };
    checkAuth();

    supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access denied:", error);
        setMicrophoneAccess(false);
      }
    };

    checkMicrophoneAccess();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isStarted && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (isStarted && timeRemaining === 0) {
      endTest();
    }

    return () => clearInterval(intervalId);
  }, [isStarted, timeRemaining, endTest]);

  const startTest = useCallback(async () => {
    setIsStarted(true);
    setIsComplete(false);
    setTimeRemaining(60);
    setTestResult(null);

    try {
      await conversation.startSession({
        agentId: 'AOv9JDhkEdMmiU61vHg9',
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: t("error"),
        description: t("failedToStartSession"),
        variant: "destructive"
      });
      setIsStarted(false);
    }
  }, [conversation, t, toast]);

  const resetTest = () => {
    setIsStarted(false);
    setIsComplete(false);
    setTimeRemaining(60);
    setTestResult(null);
  };

  return {
    isStarted,
    isComplete,
    timeRemaining,
    isLoggedIn,
    microphoneAccess,
    testResult,
    isLoading,
    conversation,
    startTest: () => {}, // Placeholder
    endTest,
    resetTest: () => {}, // Placeholder
    conversationTranscript
  };
};
