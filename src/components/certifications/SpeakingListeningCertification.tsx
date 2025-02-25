
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@11labs/react";
import { Mic, MicOff } from "lucide-react";

const SpeakingListeningCertification = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      if (message.type === "llm_response") {
        setResponses(prev => [...prev, message.content]);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to take the speaking test.",
          variant: "destructive",
        });
      }
    };

    initMicrophone();
  }, [toast]);

  const startTest = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to take the certification test.",
          variant: "destructive",
        });
        return;
      }

      await conversation.startSession({
        agentId: "trained-examiner-id", // Replace with your trained examiner agent ID
      });
      setIsStarted(true);
      setResponses([]);
      
      toast({
        title: "Test Started",
        description: "The AI examiner will now assess your speaking and listening skills.",
      });
    } catch (error) {
      console.error("Error starting test:", error);
      toast({
        title: "Error",
        description: "Failed to start the test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateScore = (responses: string[]) => {
    // This is a simplified scoring algorithm
    // You should adjust these weights based on your requirements
    let totalScore = 0;
    let fluencyScore = 0;
    let comprehensionScore = 0;
    let grammarScore = 0;
    let vocabularyScore = 0;

    responses.forEach(response => {
      // Look for specific keywords in the AI's responses
      if (response.toLowerCase().includes("fluent") || response.toLowerCase().includes("natural")) {
        fluencyScore += 20;
      }
      if (response.toLowerCase().includes("understood") || response.toLowerCase().includes("correct response")) {
        comprehensionScore += 20;
      }
      if (response.toLowerCase().includes("grammar") || response.toLowerCase().includes("structure")) {
        grammarScore += 20;
      }
      if (response.toLowerCase().includes("vocabulary") || response.toLowerCase().includes("word choice")) {
        vocabularyScore += 20;
      }
    });

    // Calculate the total score (max 100)
    totalScore = Math.min(100, (fluencyScore + comprehensionScore + grammarScore + vocabularyScore) / 4);
    
    // Determine CEFR level based on score
    let level = "A1";
    if (totalScore >= 90) level = "C2";
    else if (totalScore >= 80) level = "C1";
    else if (totalScore >= 70) level = "B2";
    else if (totalScore >= 60) level = "B1";
    else if (totalScore >= 50) level = "A2";

    return { score: Math.round(totalScore), level };
  };

  const endTest = async () => {
    try {
      await conversation.endSession();
      setIsStarted(false);
      
      // Calculate the score based on the AI's responses
      const { score, level } = calculateScore(responses);

      // Save the test results
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking_listening',
            score,
            level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Test Completed",
        description: `You've completed the speaking and listening test. Score: ${score}% (${level})`,
      });
    } catch (error) {
      console.error("Error ending test:", error);
      toast({
        title: "Error",
        description: "Failed to save test results. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Speaking & Listening Certification Test</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              This test will assess both your speaking and listening skills through
              a conversation with an AI examiner. The AI will evaluate your
              pronunciation, fluency, comprehension, and ability to respond
              appropriately.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Requirements:</p>
              <ul className="list-disc list-inside text-sm text-gray-500">
                <li>Working microphone</li>
                <li>Quiet environment</li>
                <li>15-20 minutes of uninterrupted time</li>
              </ul>
            </div>
            <Button
              onClick={startTest}
              disabled={!microphoneAccess}
              className="w-full md:w-auto"
            >
              Start Test
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                The AI examiner is listening. Speak clearly and answer the questions
                to the best of your ability.
              </p>
            </div>
            <Button
              onClick={endTest}
              variant="destructive"
              className="w-full md:w-auto"
            >
              End Test
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeakingListeningCertification;

