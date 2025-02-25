
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
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
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
        agentId: "2rNEBxdJ814y7dcdZSOb", // Replace with your actual agent ID
      });
      setIsStarted(true);
      
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

  const endTest = async () => {
    try {
      await conversation.endSession();
      setIsStarted(false);
      
      // Save the test results
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // You would need to implement the logic to calculate the score and level
      const score = 80; // This should be calculated based on the conversation
      const level = "B1"; // This should be determined based on the performance

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
        description: `You've completed the speaking and listening test. Score: ${score}%`,
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
