
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@11labs/react";
import { Mic, Play, Volume2, Pause, Check } from "lucide-react";
import TranscriptConversation from "./transcript/TranscriptConversation";
import { getLevelDescription } from "./utils/scoreUtils";

const testInstructions = `
Welcome to the Speaking and Listening Certification Test. 
This test will assess your Spanish language proficiency in the following areas:

1. Speaking Fluency
- Clear pronunciation
- Natural rhythm and intonation
- Appropriate speaking pace

2. Comprehension
- Understanding questions and instructions
- Responding appropriately to prompts
- Following complex conversations

3. Grammar and Vocabulary
- Correct use of verb tenses
- Appropriate word choice
- Complex sentence structures

4. Communication Effectiveness
- Clear expression of ideas
- Engaging in natural dialogue
- Handling unexpected topics

Some conversation starters you can use:
- Introduce yourself and your background
- Describe your daily routine
- Talk about your hobbies and interests
- Discuss your future plans and goals
- Share your opinion on current events

The test will last exactly 3 minutes. Are you ready to begin?
`;

const SpeakingListeningCertification = () => {
  // State management
  const [testState, setTestState] = useState<'idle' | 'instructions' | 'testing' | 'results' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewingDetails, setIsReviewingDetails] = useState(false);
  const [completedAttemptId, setCompletedAttemptId] = useState<string | undefined>(undefined);
  
  // Test data
  const [userTranscripts, setUserTranscripts] = useState<string[]>([]);
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState<{
    speaking: { level: string, score: number } | null,
    listening: { level: string, score: number } | null
  }>({
    speaking: null,
    listening: null
  });
  
  // Technical refs
  const { toast } = useToast();
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const endTestTimeout = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Conversation API setup
  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        setAiResponses(prev => [...prev, message.content]);
      } else if (message.type === "transcript") {
        setUserTranscripts(prev => [...prev, message.content]);
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

  // Initialize microphone access
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

  // Timer management
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (testState === 'testing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-end test when timer reaches zero
            if (endTestTimeout.current === null) {
              endTestTimeout.current = setTimeout(() => {
                handleEndTest();
                endTestTimeout.current = null;
              }, 100);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
      if (endTestTimeout.current) {
        clearTimeout(endTestTimeout.current);
        endTestTimeout.current = null;
      }
    };
  }, [testState, timeLeft]);

  // Instructions audio setup
  useEffect(() => {
    if (testState === 'instructions') {
      utteranceRef.current = new SpeechSynthesisUtterance(testInstructions);
      utteranceRef.current.lang = 'en-US';
      utteranceRef.current.rate = 0.9;
      
      utteranceRef.current.onend = () => {
        setIsAudioPlaying(false);
      };
      
      utteranceRef.current.onstart = () => {
        setIsAudioPlaying(true);
      };
    }
    
    return () => {
      if (testState !== 'instructions' && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      }
    };
  }, [testState]);

  // Analysis function to handle the conversation after test completion
  const analyzeConversation = () => {
    // We're not generating mock data anymore, but setting up the structure for user-provided analysis
    const mockFeedback = `
# Language Assessment Feedback

Please come back to this screen after copying the transcript and receiving feedback from ChatGPT. 
Then click on "Add Assessment Results" to add the feedback.
    `;
    
    setFeedback(mockFeedback);
    setScores({
      speaking: null,
      listening: null
    });
  };

  // Handler functions
  const handleStartTest = () => {
    setTestState('instructions');
  };

  const toggleAudioPlayback = () => {
    if (utteranceRef.current) {
      if (isAudioPlaying) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      } else {
        speechSynthesis.speak(utteranceRef.current);
      }
    }
  };

  const handleBeginTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to take the certification test.",
          variant: "destructive",
        });
        return;
      }
      
      // Cancel any playing audio
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      }
      
      setTestState('testing');
      setUserTranscripts([]);
      setAiResponses([]);
      setTimeLeft(180);
      
      // Start conversation session
      try {
        await conversation.startSession({
          agentId: "2rNEBxdJ814y7dcdZSOb", // ElevenLabs agent ID
        });
        
        toast({
          title: "Test Started",
          description: "The AI examiner will now assess your speaking and listening skills. You have 3 minutes.",
        });
      } catch (error) {
        console.error("Failed to start conversation session:", error);
        toast({
          title: "Failed to start test",
          description: "There was an error starting the conversation. Please try again.",
          variant: "destructive",
        });
        setTestState('idle');
      }
    } catch (error) {
      console.error("Error starting test:", error);
      toast({
        title: "Error",
        description: "Failed to start the test. Please try again.",
        variant: "destructive",
      });
      setTestState('idle');
    }
  };

  const handleEndTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setTestState('results');
    
    try {
      // End conversation session
      await conversation.endSession();
      
      // Check if we have conversation data
      if (userTranscripts.length === 0 && aiResponses.length === 0) {
        toast({
          title: "Test Incomplete",
          description: "We couldn't detect any speech. Please try again and make sure your microphone is working properly.",
          variant: "destructive",
        });
        setTestState('idle');
        setIsSubmitting(false);
        return;
      }
      
      // Set up for user to get external analysis
      analyzeConversation();
      
    } catch (error) {
      console.error("Error ending test:", error);
      toast({
        title: "Error",
        description: `An error occurred when ending the test: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResults = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Save speaking certification attempt
      const speakingResult = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking',
            score: 0, // Will be updated later with ChatGPT analysis
            level: "N/A", // Will be updated later with ChatGPT analysis
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ])
        .select();
      
      if (speakingResult.error) {
        throw speakingResult.error;
      }
      
      const speakingAttemptId = speakingResult.data[0]?.id;
      setCompletedAttemptId(speakingAttemptId); // Save the attempt ID
      
      // Save transcript data (without analysis yet)
      if (speakingAttemptId) {
        const transcriptData = {
          attempt_id: speakingAttemptId,
          user_id: user.id,
          user_transcripts: userTranscripts,
          ai_responses: aiResponses,
          analysis_data: {
            message: "Please click 'Add Assessment Results' after getting feedback from ChatGPT."
          }
        };
        
        const { error } = await supabase
          .from('certification_transcripts')
          .insert([transcriptData]);
          
        if (error) {
          console.error("Error saving transcript data:", error);
          throw error;
        }
      }

      toast({
        title: "Test Completed",
        description: "Your conversation has been saved. Now copy the transcript and paste it into ChatGPT to get an assessment.",
      });
      
      setTestState('completed');
    } catch (error) {
      console.error("Error submitting results:", error);
      toast({
        title: "Error",
        description: "Failed to save test results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render functions
  const renderIdleState = () => (
    <div className="space-y-4">
      <p className="text-gray-600">
        This test will assess both your speaking and listening skills through
        a conversation with an AI examiner. The test will last exactly 3 minutes.
      </p>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Requirements:</p>
        <ul className="list-disc list-inside text-sm text-gray-500">
          <li>Working microphone</li>
          <li>Quiet environment</li>
          <li>3 minutes of uninterrupted time</li>
        </ul>
      </div>
      <Button
        onClick={handleStartTest}
        disabled={!microphoneAccess}
        className="w-full sm:w-auto"
      >
        <Mic className="h-4 w-4 mr-2" />
        Start Test
      </Button>
    </div>
  );

  const renderTestingState = () => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-2">
          The AI examiner is listening. Speak clearly and answer the questions
          to the best of your ability.
        </p>
        <p className="text-lg font-semibold text-center">
          Time Remaining: {formatTime(timeLeft)}
        </p>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg mt-4">
        <h4 className="font-medium mb-2">Current Conversation:</h4>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {aiResponses.map((response, index) => (
              <React.Fragment key={`exchange-${index}`}>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm">{response}</p>
                  </div>
                </div>
                
                {userTranscripts[index] && (
                  <div className="flex gap-3 ml-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted shadow-sm">
                      <Mic className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm">{userTranscripts[index]}</p>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <Button
        ref={buttonRef}
        onClick={handleEndTest}
        variant="destructive"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "End Test"}
      </Button>
    </div>
  );

  const renderCompletedState = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Test Completed</h3>
        <p className="mb-4">
          Your speaking test is complete! Below is the transcript of your conversation.
          Copy this and paste it into ChatGPT for assessment, then return here to add the results.
        </p>
      </div>
      
      <div className="border border-gray-200 rounded-lg">
        <TranscriptConversation 
          userTranscripts={userTranscripts}
          aiResponses={aiResponses}
          analysisData={{
            message: "After getting ChatGPT's assessment, click 'Add Assessment Results' above to save your score."
          }}
          showCopyButton={true}
          attemptId={completedAttemptId}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        <Button 
          onClick={() => setTestState('idle')} 
          variant="outline"
        >
          Back
        </Button>
        <Button 
          onClick={handleBeginTest} 
          variant="default"
        >
          Take Test Again
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Speaking & Listening Certification Test</CardTitle>
        </CardHeader>
        <CardContent>
          {testState === 'idle' && renderIdleState()}
          {testState === 'testing' && renderTestingState()}
          {testState === 'completed' && renderCompletedState()}
        </CardContent>
      </Card>

      {/* Instructions Dialog */}
      <Dialog open={testState === 'instructions'} onOpenChange={(open) => !open && setTestState('idle')}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Speaking & Listening Test Instructions</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="whitespace-pre-line text-gray-700">
                {testInstructions}
              </div>
            </ScrollArea>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={toggleAudioPlayback}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isAudioPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Instructions
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Listen to Instructions
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setTestState('idle')}>
              Cancel
            </Button>
            <Button onClick={handleBeginTest}>
              Begin Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog 
        open={testState === 'results'} 
        onOpenChange={(open) => !open && !isSubmitting && setTestState('idle')}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Speaking & Listening Test Results</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Assessment Instructions</h3>
              <p className="text-gray-600">
                Your conversation has been recorded. Follow these steps to complete your assessment:
              </p>
            </div>
            
            <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
              <li>Click "Save & View Transcript" to save your test</li>
              <li>Use the "Copy for ChatGPT Assessment" button to copy your conversation</li>
              <li>Paste it into ChatGPT and ask for a detailed assessment of your Spanish speaking and listening skills</li>
              <li>Return to this page and use "Add Assessment Results" to enter ChatGPT's feedback</li>
              <li>Click "Apply Score" to save the assessment to your profile</li>
            </ol>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmitResults}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save & View Transcript
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpeakingListeningCertification;
