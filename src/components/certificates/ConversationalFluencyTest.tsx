
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mic, MicOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversation } from "@11labs/react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";

const TEST_DURATION = 300; // 5 minutes in seconds
const ELEVEN_LABS_AGENT_ID = "gruprmRz1lZ5awx10Ejc"; // Updated to use the specific agent ID

const ConversationalFluencyTest = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      // Store messages for later assessment
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
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();

    // Check for microphone access
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

  // Timer for test duration
  useEffect(() => {
    if (isStarted && !isComplete && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
        if (timeRemaining === 1) {
          endTest();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStarted, isComplete, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startTest = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to take the conversational fluency test.",
        variant: "destructive",
      });
      return;
    }

    if (!microphoneAccess) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use the conversational test.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a certification attempt entry
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data: attempt, error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking',
            score: 0, // Will be updated after assessment
            level: 'A1', // Will be updated after assessment
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setAttemptId(attempt.id);
      setIsStarted(true);
      setTimeRemaining(TEST_DURATION);
      
      // Start the conversation with the specific ElevenLabs agent
      await conversation.startSession({
        agentId: ELEVEN_LABS_AGENT_ID, // Using the new agent ID
      });
      
      toast({
        title: "Test Started",
        description: "The conversational fluency test has begun. Speak clearly in Spanish.",
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
    if (!attemptId) return;
    
    try {
      // End the conversation
      if (conversation.status === "connected") {
        await conversation.endSession();
      }
      
      setIsStarted(false);
      setIsLoading(true);
      
      // Request assessment of the conversation
      const { data, error } = await supabase.functions.invoke('analyze-speaking', {
        body: { 
          attemptId: attemptId
        }
      });
      
      if (error) throw error;
      
      // Update certification attempt with score and level
      const { error: updateError } = await supabase
        .from('certification_attempts')
        .update({
          score: data.overallScore,
          level: determineLevel(data.overallScore),
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);
        
      if (updateError) throw updateError;
      
      setTestResult(data);
      setIsComplete(true);
      
      toast({
        title: "Test Complete",
        description: "Your conversational fluency has been assessed!",
      });
    } catch (error) {
      console.error("Error ending test:", error);
      toast({
        title: "Error",
        description: "Failed to complete the assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setIsStarted(false);
    setIsComplete(false);
    setTimeRemaining(TEST_DURATION);
    setTestResult(null);
    setAttemptId(null);
  };

  if (isComplete) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Conversation Assessment</CardTitle>
          <MessageSquare className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Your Results</h3>
              <div className="mb-2">
                <span className="font-medium">Score:</span> {testResult.overallScore}%
              </div>
              <div className="mb-2">
                <span className="font-medium">CEFR Level:</span> {determineLevel(testResult.overallScore)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Speaking</h3>
                <div className="flex justify-between mb-1">
                  <span>Pronunciation</span>
                  <span>{testResult.pronunciation}/10</span>
                </div>
                <Progress value={testResult.pronunciation * 10} className="h-2 mb-3" />
                
                <div className="flex justify-between mb-1">
                  <span>Fluency</span>
                  <span>{testResult.fluency}/10</span>
                </div>
                <Progress value={testResult.fluency * 10} className="h-2 mb-3" />
                
                <div className="flex justify-between mb-1">
                  <span>Grammar</span>
                  <span>{testResult.grammar}/10</span>
                </div>
                <Progress value={testResult.grammar * 10} className="h-2" />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Comprehension</h3>
                <div className="flex justify-between mb-1">
                  <span>Understanding</span>
                  <span>{testResult.understanding}/10</span>
                </div>
                <Progress value={testResult.understanding * 10} className="h-2 mb-3" />
                
                <div className="flex justify-between mb-1">
                  <span>Vocabulary</span>
                  <span>{testResult.vocabulary}/10</span>
                </div>
                <Progress value={testResult.vocabulary * 10} className="h-2 mb-3" />
                
                <div className="flex justify-between mb-1">
                  <span>Interaction</span>
                  <span>{testResult.interaction}/10</span>
                </div>
                <Progress value={testResult.interaction * 10} className="h-2" />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Feedback</h3>
              <p className="text-gray-700 mb-4">{testResult.feedback}</p>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Strengths:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {testResult.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Areas for Improvement:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {testResult.areasToImprove.map((area: string, i: number) => (
                    <li key={i} className="text-gray-700">{area}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <Button onClick={resetTest}>Take Test Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Conversational Fluency Test</CardTitle>
        <MessageSquare className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            The Conversational Fluency Test evaluates your ability to understand and respond to spoken Spanish in real-time conversations. This test assesses your listening comprehension, speaking skills, and ability to maintain a natural conversation flow.
          </p>
          
          {isStarted ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  {conversation.status === "connected" ? (
                    <Mic className="h-5 w-5 text-green-500 mr-2 animate-pulse" />
                  ) : (
                    <MicOff className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">
                    {conversation.status === "connected" 
                      ? "Speak in Spanish to the AI tutor" 
                      : "Connecting to AI tutor..."}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatTime(timeRemaining)}</div>
                  <div className="text-xs text-gray-500">remaining</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <h3 className="text-sm font-medium">Test Instructions</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
                  <li>Speak naturally in Spanish</li>
                  <li>Answer the tutor's questions</li>
                  <li>Try to keep the conversation flowing</li>
                  <li>Don't worry about making mistakes</li>
                </ul>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to end the test early?")) {
                      endTest();
                    }
                  }}
                >
                  End Test Early
                </Button>
                <div className="text-sm text-gray-500 pt-2">
                  Test will automatically end in {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">Ready to test your conversational Spanish skills?</p>
              <Button 
                onClick={startTest} 
                disabled={isLoading || !isLoggedIn || !microphoneAccess}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? "Processing..." : "Start Test"}
              </Button>
              {!isLoggedIn && (
                <p className="text-sm text-red-400 mt-3">Please login to take the test</p>
              )}
              {!microphoneAccess && (
                <p className="text-sm text-red-400 mt-3">Microphone access required</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalFluencyTest;
