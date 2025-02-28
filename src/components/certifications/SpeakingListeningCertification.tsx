import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@11labs/react";
import { Mic, MicOff, Play, Volume2, Check, Pause } from "lucide-react";
import { getLevelDescription } from "./utils/scoreUtils";
import ConversationItem from "./transcript/ConversationItem";
import TranscriptConversation from "./transcript/TranscriptConversation";

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
  const [isStarted, setIsStarted] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);
  const [userTranscript, setUserTranscript] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<{level: string, score: number} | null>(null);
  const [listeningScore, setListeningScore] = useState<{level: string, score: number} | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isReviewingResults, setIsReviewingResults] = useState(false);
  const [attemptIds, setAttemptIds] = useState<{speaking: string | null, listening: string | null}>({
    speaking: null, 
    listening: null
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const { toast } = useToast();
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const endTestTimeout = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      if (message.type === "llm_response") {
        console.log("AI response received:", message.content);
        setResponses(prev => [...prev, message.content]);
      } else if (message.type === "transcript") {
        console.log("User transcript received:", message.content);
        setUserTranscript(prev => [...prev, message.content]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setSessionError(`Conversation error: ${error.message}`);
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
        console.log("Microphone access granted");
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log("Timer reached zero, auto-ending test...");
            clearInterval(timer);
            if (endTestTimeout.current === null) {
              endTestTimeout.current = setTimeout(() => {
                if (buttonRef.current) {
                  console.log("Auto-clicking end test button");
                  buttonRef.current.click();
                } else {
                  console.log("Button ref not available, manually calling endTest");
                  endTest();
                }
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
  }, [isStarted, timeLeft]);

  useEffect(() => {
    if (showInstructions) {
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
      if (!showInstructions && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      }
    };
  }, [showInstructions]);

  useEffect(() => {
    if (isStarted) {
      console.log("Current conversation data:", {
        transcripts: userTranscript,
        responses: responses,
        sessionStarted: sessionStarted
      });
    }
  }, [userTranscript, responses, isStarted, sessionStarted]);

  const handleStartTest = () => {
    setShowInstructions(true);
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

      console.log("Starting test for user:", user.id);

      setSessionError(null);
      
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      }

      setShowInstructions(false);
      
      console.log("Starting conversation session...");
      
      setIsStarted(true);
      setResponses([]);
      setUserTranscript([]);
      setFeedback("");
      setShowFeedback(false);
      setSpeakingScore(null);
      setListeningScore(null);
      setTimeLeft(180);
      setAttemptIds({ speaking: null, listening: null });
      
      try {
        await conversation.startSession({
          agentId: "2rNEBxdJ814y7dcdZSOb",
        });
        console.log("Conversation session started successfully");
        setSessionStarted(true);
        
        toast({
          title: "Test Started",
          description: "The AI examiner will now assess your speaking and listening skills. You have 3 minutes.",
        });
      } catch (error) {
        console.error("Failed to start conversation session:", error);
        setSessionError(`Failed to start conversation: ${error.message}`);
        toast({
          title: "Failed to start test",
          description: "There was an error starting the conversation. Please try again.",
          variant: "destructive",
        });
      }
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
      console.log("🔴 End Test button clicked");
      if (isSubmitting) {
        console.log("Test submission already in progress, ignoring duplicate call");
        return;
      }
      
      setIsSubmitting(true);
      console.log("Ending test and session...");
      
      setIsStarted(false);
      setTimeLeft(0);
      
      const conversationData = {
        userTranscripts: userTranscript,
        aiResponses: responses
      };
      
      console.log("Ending test. Conversation data to analyze:", conversationData);
      
      try {
        await conversation.endSession();
        console.log("✅ Conversation session ended successfully");
      } catch (endSessionError) {
        console.error("⚠️ Error ending conversation session:", endSessionError);
      }
      
      if (userTranscript.length === 0 && responses.length === 0) {
        console.warn("No conversation data detected!");
        toast({
          title: "Test Incomplete",
          description: "We couldn't detect any speech. Please try again and make sure your microphone is working properly.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      setShowFeedback(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error ending test:", error);
      toast({
        title: "Error",
        description: `An error occurred when ending the test: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const submitResults = async () => {
    try {
      setIsSubmitting(true);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Saving test results for user:", user.id);
      
      if (!speakingScore || !listeningScore) {
        throw new Error("Missing score data");
      }
      
      const speakingResult = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking',
            score: speakingScore.score,
            level: speakingScore.level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ])
        .select();
      
      if (speakingResult.error) {
        console.error("Error saving speaking score:", speakingResult.error);
        throw speakingResult.error;
      }
      
      console.log("Speaking score saved successfully:", speakingResult.data);
      const speakingAttemptId = speakingResult.data[0]?.id;
      setAttemptIds(prev => ({ ...prev, speaking: speakingAttemptId }));
      
      const listeningResult = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'listening',
            score: listeningScore.score,
            level: listeningScore.level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ])
        .select();
      
      if (listeningResult.error) {
        console.error("Error saving listening score:", listeningResult.error);
        throw listeningResult.error;
      }
      
      console.log("Listening score saved successfully:", listeningResult.data);
      const listeningAttemptId = listeningResult.data[0]?.id;
      setAttemptIds(prev => ({ ...prev, listening: listeningAttemptId }));
      
      if (speakingAttemptId) {
        const transcriptData = {
          attempt_id: speakingAttemptId,
          user_id: user.id,
          user_transcripts: userTranscript,
          ai_responses: responses,
          analysis_data: {
            speakingLevel: speakingScore.level,
            speakingScore: speakingScore.score,
            listeningLevel: listeningScore.level,
            listeningScore: listeningScore.score,
            analysis: feedback
          }
        };
        
        const { data, error } = await supabase
          .from('certification_transcripts')
          .insert([transcriptData]);
          
        if (error) {
          console.error("Error saving transcript data:", error);
          toast({
            title: "Partial Success",
            description: "Your scores were saved, but we couldn't store your conversation transcript.",
            variant: "default",
          });
        } else {
          console.log("Transcript data saved successfully");
        }
      }

      toast({
        title: "Test Completed",
        description: `Results saved successfully. Speaking: ${speakingScore.score}% (${speakingScore.level}), Listening: ${listeningScore.score}% (${listeningScore.level})`,
      });
      
      setShowResults(false);
      setShowFeedback(true);
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

  const handleReviewDetails = () => {
    setIsReviewingResults(true);
  };

  const handleBackToResults = () => {
    setIsReviewingResults(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    console.log("showResults state changed:", showResults);
  }, [showResults]);

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Speaking & Listening Certification Test</CardTitle>
        </CardHeader>
        <CardContent>
          {!isStarted && !showFeedback ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                This test will assess both your speaking and listening skills through
                a conversation with an AI examiner. The AI will generate the transcript 
                that you can copy and paste into ChatGPT for assessment. The test will 
                last exactly 3 minutes.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Requirements:</p>
                <ul className="list-disc list-inside text-sm text-gray-500">
                  <li>Working microphone</li>
                  <li>Quiet environment</li>
                  <li>3 minutes of uninterrupted time</li>
                  <li>Access to ChatGPT for assessment</li>
                </ul>
              </div>
              <Button
                onClick={handleStartTest}
                disabled={!microphoneAccess}
                className="w-full md:w-auto"
              >
                Start Test
              </Button>
            </div>
          ) : showFeedback ? (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Test Completed</h3>
                <p className="mb-4">
                  Your speaking test is complete! Please copy your conversation transcript below 
                  and paste it into ChatGPT to receive an assessment of your speaking and 
                  listening skills.
                </p>
                <p className="text-sm text-gray-600">
                  The transcript includes instructions for ChatGPT to evaluate your language skills 
                  according to the CEFR scale (A1-C2).
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg">
                <TranscriptConversation 
                  userTranscripts={userTranscript}
                  aiResponses={responses}
                  analysisData={null}
                  showCopyButton={true}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button 
                  onClick={() => setShowFeedback(false)} 
                  variant="outline"
                >
                  Back
                </Button>
                <Button 
                  onClick={startTest} 
                  variant="default"
                >
                  Take Test Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">
                  The AI examiner is listening. Speak clearly and answer the questions
                  to the best of your ability.
                </p>
                <p className="text-lg font-semibold text-center">
                  Time Remaining: {formatTime(timeLeft)}
                </p>
                {sessionError && (
                  <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-md">
                    <p className="text-sm font-medium">Error: {sessionError}</p>
                    <p className="text-xs mt-1">You can try ending the test anyway or restart.</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Current Conversation:</h4>
                <TranscriptConversation
                  userTranscripts={userTranscript}
                  aiResponses={responses}
                  analysisData={null}
                />
              </div>
              
              <Button
                ref={buttonRef}
                onClick={endTest}
                variant="destructive"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>End Test</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
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
            <Button variant="outline" onClick={() => setShowInstructions(false)}>
              Cancel
            </Button>
            <Button onClick={startTest}>
              Begin Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showResults} 
        onOpenChange={(open) => !isSubmitting && setShowResults(open)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Speaking & Listening Test Results</DialogTitle>
          </DialogHeader>
          
          {isReviewingResults ? (
            <div className="py-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="whitespace-pre-line text-gray-700 prose prose-sm max-w-none">
                  {feedback}
                </div>
              </ScrollArea>
              
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={handleBackToResults}
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
              
              {speakingScore && listeningScore && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Speaking</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{speakingScore.level}</span>
                      <span className="text-lg">{speakingScore.score}%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-800 mb-2">Listening</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{listeningScore.level}</span>
                      <span className="text-lg">{listeningScore.score}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Summary:</p>
                <p className="text-gray-800">
                  {speakingScore && listeningScore ? (
                    `Your speaking skills are at ${speakingScore.level} level and your listening skills are at ${listeningScore.level} level. Click "Review Detailed Feedback" for suggestions on how to improve.`
                  ) : (
                    "Your results have been analyzed. Review the detailed feedback for insights on your performance."
                  )}
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={handleReviewDetails}
                  variant="outline"
                >
                  Review Detailed Feedback
                </Button>
                <Button 
                  onClick={submitResults}
                  variant="success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Submit Results"}
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
