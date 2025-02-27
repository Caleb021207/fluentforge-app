
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@11labs/react";
import { Mic, MicOff, Play, Volume2, Check } from "lucide-react";

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
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Message received:", message);
      if (message.type === "llm_response") {
        setResponses(prev => [...prev, message.content]);
      } else if (message.type === "transcript") {
        setUserTranscript(prev => [...prev, message.content]);
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

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const handleStartTest = () => {
    setShowInstructions(true);
    // Start TTS for instructions
    const instructionsConversation = useConversation({
      overrides: {
        tts: {
          voiceId: "Charlie" // Using Charlie's voice for instructions
        }
      }
    });
    
    instructionsConversation.startSession({
      agentId: "2rNEBxdJ814y7dcdZSOb", // Using your actual agent ID
    }).then(() => {
      // Send the instructions text to be read
      instructionsConversation.onMessage({
        type: "llm_response",
        content: testInstructions
      });
    });
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

      setShowInstructions(false);
      await conversation.startSession({
        agentId: "2rNEBxdJ814y7dcdZSOb", // Using your actual agent ID
      });
      setIsStarted(true);
      setResponses([]);
      setUserTranscript([]);
      setFeedback("");
      setShowFeedback(false);
      setTimeLeft(180); // Reset timer to 3 minutes
      
      toast({
        title: "Test Started",
        description: "The AI examiner will now assess your speaking and listening skills. You have 3 minutes.",
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

  const analyzeTranscript = async (transcript: string[]) => {
    try {
      // Create a combined transcript string
      const fullTranscript = transcript.join(" ");
      
      // If the transcript is too short, return default feedback
      if (fullTranscript.length < 10) {
        return "The transcript was too short to provide detailed feedback.";
      }

      const prompt = `
        You are a Spanish language teacher and examiner. 
        Analyze the following transcript from a Spanish speaking test:
        
        "${fullTranscript}"
        
        Provide a detailed assessment covering:
        1. Fluency and pronunciation
        2. Grammar usage
        3. Vocabulary range
        4. Comprehension of questions
        5. Overall communication effectiveness
        
        End with specific suggestions for improvement and assign a CEFR level (A1, A2, B1, B2, C1, or C2).
        
        Format your response as a structured assessment with clear sections.
      `;

      // For this example, we're using a simplified analysis algorithm based on the transcript length and content
      // In a real implementation, you would connect to an LLM API for a proper analysis
      
      // Simplified analysis based on word count and complexity
      const wordCount = fullTranscript.split(/\s+/).length;
      let mockFeedback = "";

      if (wordCount < 30) {
        mockFeedback = `
          ## Speaking Assessment
          
          ### Fluency and Pronunciation
          Your responses were brief, which makes it difficult to fully assess your fluency. Try to speak in complete sentences.
          
          ### Grammar Usage
          Limited examples of grammatical structures were observed. Consider practicing basic present tense conjugations.
          
          ### Vocabulary Range
          Basic vocabulary was used. Work on expanding your everyday vocabulary.
          
          ### Comprehension
          You appear to understand simple questions but may need more practice with complex topics.
          
          ### Overall Communication
          You can communicate basic ideas but need more practice for fluent expression.
          
          ### Suggestions for Improvement
          - Practice speaking for longer periods
          - Use complete sentences rather than single words
          - Review basic verb conjugations
          - Build your vocabulary with flashcards
          
          ### CEFR Level: A1 (Beginner)
        `;
      } else if (wordCount < 60) {
        mockFeedback = `
          ## Speaking Assessment
          
          ### Fluency and Pronunciation
          You can form basic sentences with some hesitation. Work on linking your ideas more smoothly.
          
          ### Grammar Usage
          You show understanding of present tense but may struggle with past tenses or more complex structures.
          
          ### Vocabulary Range
          You have sufficient vocabulary for familiar topics but may struggle with specialized areas.
          
          ### Comprehension
          You understand most questions with occasional need for clarification.
          
          ### Overall Communication
          You can express yourself on familiar topics with some preparation.
          
          ### Suggestions for Improvement
          - Practice past tense verbs
          - Try speaking about a wider range of topics
          - Listen to Spanish media to improve comprehension
          - Join a conversation group for practical practice
          
          ### CEFR Level: A2 (Elementary)
        `;
      } else {
        mockFeedback = `
          ## Speaking Assessment
          
          ### Fluency and Pronunciation
          You speak with good rhythm and reasonable fluency. Your pronunciation is generally clear with a few non-native sounds.
          
          ### Grammar Usage
          You use a variety of tenses correctly, though you occasionally make errors with subjunctive or conditional forms.
          
          ### Vocabulary Range
          You demonstrate a good range of vocabulary appropriate for everyday and some specialized topics.
          
          ### Comprehension
          You understand questions well and respond appropriately to most prompts.
          
          ### Overall Communication
          You communicate effectively on familiar topics and can handle some unexpected questions.
          
          ### Suggestions for Improvement
          - Practice more complex grammar structures
          - Expand vocabulary in professional or academic contexts
          - Work on expressing nuanced opinions and hypothetical situations
          - Practice speaking without preparation on unfamiliar topics
          
          ### CEFR Level: B1 (Intermediate)
        `;
      }

      return mockFeedback;
    } catch (error) {
      console.error("Error analyzing transcript:", error);
      return "An error occurred while analyzing your speaking performance. Please try again later.";
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
      setIsSubmitting(true);
      await conversation.endSession();
      setIsStarted(false);
      setTimeLeft(180); // Reset timer
      
      // Generate feedback based on the transcript
      const analysisResult = await analyzeTranscript(userTranscript);
      setFeedback(analysisResult);
      setShowFeedback(true);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                a conversation with an AI examiner. The AI will evaluate your
                pronunciation, fluency, comprehension, and ability to respond
                appropriately. The test will last exactly 3 minutes.
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
                className="w-full md:w-auto"
              >
                Start Test
              </Button>
            </div>
          ) : showFeedback ? (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Speaking Assessment Feedback</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-line">
                  {feedback}
                </div>
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
              </div>
              <Button
                onClick={endTest}
                variant="destructive"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Analyzing your speech...</>
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
          <div className="py-4 space-y-4">
            <div className="whitespace-pre-line text-gray-700">
              {testInstructions}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInstructions(false)}>
              No, cancel
            </Button>
            <Button onClick={startTest}>
              Yes, begin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpeakingListeningCertification;

