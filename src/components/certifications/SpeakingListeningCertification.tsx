
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

  // Mock analysis function (in a real app, this would be an API call)
  const analyzeConversation = () => {
    // This is a mock function that simulates analyzing the conversation
    // In a real implementation, this would call an API or use a more sophisticated analysis
    
    // Generate random scores for demo purposes
    const speakingLevel = ["A1", "A2", "B1", "B2", "C1", "C2"][Math.floor(Math.random() * 6)];
    const listeningLevel = ["A1", "A2", "B1", "B2", "C1", "C2"][Math.floor(Math.random() * 6)];
    
    const speakingScore = Math.floor(Math.random() * 30) + 70; // 70-99
    const listeningScore = Math.floor(Math.random() * 30) + 70; // 70-99
    
    const mockFeedback = `
# Language Assessment Results

## Speaking: ${speakingLevel} (${speakingScore}%)
${getLevelDescription(speakingLevel)}

### Strengths:
- Good vocabulary usage in everyday topics
- Clear pronunciation of most common words
- Effective communication of basic ideas

### Areas for Improvement:
- Work on verb conjugation in past tenses
- Practice more complex sentence structures
- Expand vocabulary in specialized topics

## Listening: ${listeningLevel} (${listeningScore}%)
${getLevelDescription(listeningLevel)}

### Strengths:
- Good comprehension of direct questions
- Ability to follow conversations at a moderate pace
- Understanding of common idioms and expressions

### Areas for Improvement:
- Practice listening to different accents
- Work on understanding fast speech
- Improve comprehension of complex grammatical structures
    `;
    
    setScores({
      speaking: { level: speakingLevel, score: speakingScore },
      listening: { level: listeningLevel, score: listeningScore }
    });
    
    setFeedback(mockFeedback);
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
      
      // Analyze conversation and generate scores
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
      
      if (!scores.speaking || !scores.listening) {
        throw new Error("Missing score data");
      }
      
      // Save speaking certification
      const speakingResult = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking',
            score: scores.speaking.score,
            level: scores.speaking.level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ])
        .select();
      
      if (speakingResult.error) {
        throw speakingResult.error;
      }
      
      const speakingAttemptId = speakingResult.data[0]?.id;
      
      // Save listening certification
      const listeningResult = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'listening',
            score: scores.listening.score,
            level: scores.listening.level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ])
        .select();
      
      if (listeningResult.error) {
        throw listeningResult.error;
      }
      
      // Save transcript data
      if (speakingAttemptId) {
        const transcriptData = {
          attempt_id: speakingAttemptId,
          user_id: user.id,
          user_transcripts: userTranscripts,
          ai_responses: aiResponses,
          analysis_data: {
            speakingLevel: scores.speaking.level,
            speakingScore: scores.speaking.score,
            listeningLevel: scores.listening.level,
            listeningScore: scores.listening.score,
            analysis: feedback
          }
        };
        
        const { error } = await supabase
          .from('certification_transcripts')
          .insert([transcriptData]);
          
        if (error) {
          console.error("Error saving transcript data:", error);
          toast({
            title: "Partial Success",
            description: "Your scores were saved, but we couldn't store your conversation transcript.",
            variant: "default",
          });
        }
      }

      toast({
        title: "Test Completed",
        description: `Results saved successfully. Speaking: ${scores.speaking.score}% (${scores.speaking.level}), Listening: ${scores.listening.score}% (${scores.listening.level})`,
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
          You can copy this and paste it into ChatGPT for additional feedback if desired.
        </p>
      </div>
      
      <div className="border border-gray-200 rounded-lg">
        <TranscriptConversation 
          userTranscripts={userTranscripts}
          aiResponses={aiResponses}
          analysisData={{
            speakingLevel: scores.speaking?.level,
            speakingScore: scores.speaking?.score,
            listeningLevel: scores.listening?.level,
            listeningScore: scores.listening?.score,
            analysis: feedback
          }}
          showCopyButton={true}
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
          
          {isReviewingDetails ? (
            <div className="py-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="whitespace-pre-line text-gray-700 prose prose-sm max-w-none">
                  {feedback}
                </div>
              </ScrollArea>
              
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => setIsReviewingDetails(false)}
                  variant="outline"
                >
                  Back to Results Summary
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Congratulations!</h3>
                <p className="text-gray-600">You've completed the Speaking & Listening certification test.</p>
              </div>
              
              {scores.speaking && scores.listening && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Speaking</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{scores.speaking.level}</span>
                      <span className="text-lg">{scores.speaking.score}%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-800 mb-2">Listening</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{scores.listening.level}</span>
                      <span className="text-lg">{scores.listening.score}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Summary:</p>
                <p className="text-gray-800">
                  Your speaking skills are at {scores.speaking?.level} level and your listening skills are at {scores.listening?.level} level.
                  Click "Review Detailed Feedback" for suggestions on how to improve.
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => setIsReviewingDetails(true)}
                  variant="outline"
                >
                  Review Detailed Feedback
                </Button>
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
                      Submit Results
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpeakingListeningCertification;
