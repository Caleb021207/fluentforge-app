
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@11labs/react";
import { Mic, MicOff, Play, Volume2, Check, Pause, Loader2 } from "lucide-react";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { Progress } from "@/components/ui/progress";
import { 
  AssessmentMetricsType, 
  AssessmentResultType, 
  ConversationMessageType 
} from "@/components/certifications/types/speaking";

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
  const [assessmentMetrics, setAssessmentMetrics] = useState<AssessmentMetricsType>({
    pronunciation: 0,
    fluency: 0,
    grammar: 0,
    vocabulary: 0,
    comprehension: 0,
    overall: 0
  });
  const [realTimeAssessment, setRealTimeAssessment] = useState<string[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessageType[]>([]);
  const { toast } = useToast();
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const assessmentMetricsRef = useRef<AssessmentMetricsType>({
    pronunciation: 0,
    fluency: 0,
    grammar: 0,
    vocabulary: 0,
    comprehension: 0,
    overall: 0
  });

  // Create ElevenLabs conversation with client tools for assessment
  const conversation = useConversation({
    clientTools: {
      recordAssessment: (parameters: { 
        metricType: keyof AssessmentMetricsType, 
        score: number, 
        feedback: string 
      }) => {
        const { metricType, score, feedback } = parameters;
        
        // Update the assessment metrics
        const updatedMetrics = { ...assessmentMetricsRef.current };
        updatedMetrics[metricType] = score;
        
        // Calculate the overall score as an average of all metrics
        const metricsSum = Object.values(updatedMetrics).reduce((sum, value, index) => {
          // Skip the overall value in the calculation
          if (index < Object.values(updatedMetrics).length - 1) {
            return sum + value;
          }
          return sum;
        }, 0);
        
        const metricCount = Object.keys(updatedMetrics).length - 1; // Subtract 1 for 'overall'
        updatedMetrics.overall = Math.round(metricsSum / metricCount);
        
        // Update the ref and state
        assessmentMetricsRef.current = updatedMetrics;
        setAssessmentMetrics(updatedMetrics);
        
        // Add the feedback to real-time assessment
        setRealTimeAssessment(prev => [...prev, feedback]);
        
        return `Assessment recorded: ${metricType}: ${score}/100 - ${feedback}`;
      }
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      
      if (message.type === "llm_response") {
        setResponses(prev => [...prev, message.content]);
        
        // Add to conversation messages
        setConversationMessages(prev => [
          ...prev, 
          { type: 'assistant', content: message.content }
        ]);
      } else if (message.type === "transcript") {
        setUserTranscript(prev => [...prev, message.content]);
        
        // Add to conversation messages
        setConversationMessages(prev => [
          ...prev, 
          { type: 'user', content: message.content }
        ]);
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
    
    // Cleanup function for the conversation
    return () => {
      if (isStarted) {
        conversation.endSession().catch(console.error);
      }
    };
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

  // Initialize speech synthesis when instructions modal is opened
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
    
    // Clean up speech synthesis when dialog is closed
    return () => {
      if (!showInstructions && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      }
    };
  }, [showInstructions]);

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

      // Stop the audio if it's still playing
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
      }

      setShowInstructions(false);
      
      // Reset assessment metrics
      const initialMetrics: AssessmentMetricsType = {
        pronunciation: 0,
        fluency: 0,
        grammar: 0,
        vocabulary: 0,
        comprehension: 0,
        overall: 0
      };
      
      setAssessmentMetrics(initialMetrics);
      assessmentMetricsRef.current = initialMetrics;
      
      // Start the conversation session with the specialized assessment agent
      await conversation.startSession({
        agentId: "2rNEBxdJ814y7dcdZSOb", // Using the assessment agent ID
      });
      
      setIsStarted(true);
      setResponses([]);
      setUserTranscript([]);
      setRealTimeAssessment([]);
      setConversationMessages([]);
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

  const generateDetailedFeedback = (
    transcript: string[], 
    metrics: AssessmentMetricsType,
    realTimeAssessments: string[]
  ): string => {
    // Generate the CEFR level based on the overall score
    const overallScore = metrics.overall;
    const cefrLevel = determineLevel(overallScore);
    
    // Create a comprehensive feedback
    let detailedFeedback = `
## Speaking Assessment Results

### Overall Proficiency: ${cefrLevel} (${overallScore}/100)

### Metrics Breakdown:
- Pronunciation: ${metrics.pronunciation}/100
- Fluency: ${metrics.fluency}/100
- Grammar: ${metrics.grammar}/100
- Vocabulary: ${metrics.vocabulary}/100
- Comprehension: ${metrics.comprehension}/100

### Detailed Feedback:

`;

    // Add the real-time assessments if available
    if (realTimeAssessments.length > 0) {
      detailedFeedback += `#### Observations during the test:\n`;
      realTimeAssessments.forEach((assessment, index) => {
        detailedFeedback += `- ${assessment}\n`;
      });
    }
    
    // Add recommendations based on the CEFR level
    detailedFeedback += `\n### Recommendations for ${cefrLevel} level:\n`;
    
    // Custom recommendations based on the CEFR level
    switch(cefrLevel) {
      case 'A1':
        detailedFeedback += `
- Focus on building basic vocabulary and simple sentence structures
- Practice common greetings and everyday expressions
- Work on pronunciation of Spanish vowels and consonants
- Use language learning apps for daily practice
- Consider joining a beginner Spanish conversation group
`;
        break;
      case 'A2':
        detailedFeedback += `
- Expand vocabulary to include more daily situations
- Practice forming past and future tenses
- Work on connecting ideas with conjunctions
- Listen to slow, clear Spanish recordings or podcasts
- Try to have simple conversations about familiar topics
`;
        break;
      case 'B1':
        detailedFeedback += `
- Focus on more complex grammar structures like subjunctive
- Expand vocabulary to include more abstract concepts
- Work on expressing opinions and explaining your reasoning
- Watch Spanish media with subtitles
- Practice speaking about unfamiliar topics to challenge yourself
`;
        break;
      case 'B2':
        detailedFeedback += `
- Work on more nuanced expression and idiomatic language
- Practice hypothetical situations using conditional forms
- Focus on reducing your accent and improving natural rhythm
- Engage in debates and discussions in Spanish
- Read Spanish literature and news to expand vocabulary
`;
        break;
      case 'C1':
        detailedFeedback += `
- Focus on professional and academic language
- Perfect your use of connectors and discourse markers
- Work on expressing subtle differences in meaning
- Immerse yourself in native Spanish content without subtitles
- Practice explaining complex topics in Spanish
`;
        break;
      case 'C2':
        detailedFeedback += `
- Continue refining your near-native fluency
- Focus on cultural and regional expressions
- Perfect your command of idioms and colloquialisms
- Work on humor, irony, and other advanced language functions
- Consider professional or academic contexts for using Spanish
`;
        break;
      default:
        detailedFeedback += `
- Continue practicing regularly
- Use a variety of resources to improve your Spanish
- Seek conversation partners for real practice
- Set specific goals for improvement
`;
    }
    
    return detailedFeedback;
  };

  const endTest = async () => {
    try {
      setIsSubmitting(true);
      
      // End the conversation session
      await conversation.endSession();
      setIsStarted(false);
      setTimeLeft(180); // Reset timer
      
      // Generate detailed feedback based on the assessment metrics and conversation
      const detailedFeedback = generateDetailedFeedback(
        userTranscript, 
        assessmentMetricsRef.current,
        realTimeAssessment
      );
      
      setFeedback(detailedFeedback);
      setShowFeedback(true);
      
      // Get the CEFR level and overall score
      const overallScore = assessmentMetricsRef.current.overall;
      const cefrLevel = determineLevel(overallScore);
      
      // Save the test results
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // First save the basic certification attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking',
            score: overallScore,
            level: cefrLevel,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ])
        .select();

      if (attemptError) throw attemptError;
      
      // If we have the attempt data, save the detailed speaking assessment
      if (attemptData && attemptData.length > 0) {
        const attemptId = attemptData[0].id;
        
        // Save detailed assessment metrics
        const { error: detailsError } = await supabase
          .from('speaking_assessments')
          .insert([
            {
              attempt_id: attemptId,
              pronunciation_score: assessmentMetricsRef.current.pronunciation,
              fluency_score: assessmentMetricsRef.current.fluency,
              grammar_score: assessmentMetricsRef.current.grammar,
              vocabulary_score: assessmentMetricsRef.current.vocabulary,
              comprehension_score: assessmentMetricsRef.current.comprehension,
              feedback: detailedFeedback,
              conversation_data: JSON.stringify(conversationMessages),
              created_at: new Date().toISOString(),
            }
          ]);
          
        if (detailsError) {
          console.error("Error saving detailed assessment:", detailsError);
        }
      }

      toast({
        title: "Test Completed",
        description: `You've completed the speaking and listening test. Score: ${overallScore}% (${cefrLevel})`,
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
                <p className="text-lg font-semibold text-center mb-4">
                  Time Remaining: {formatTime(timeLeft)}
                </p>
                
                {/* Real-time assessment metrics */}
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pronunciation</span>
                      <span>{assessmentMetrics.pronunciation}%</span>
                    </div>
                    <Progress value={assessmentMetrics.pronunciation} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fluency</span>
                      <span>{assessmentMetrics.fluency}%</span>
                    </div>
                    <Progress value={assessmentMetrics.fluency} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Grammar</span>
                      <span>{assessmentMetrics.grammar}%</span>
                    </div>
                    <Progress value={assessmentMetrics.grammar} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vocabulary</span>
                      <span>{assessmentMetrics.vocabulary}%</span>
                    </div>
                    <Progress value={assessmentMetrics.vocabulary} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Comprehension</span>
                      <span>{assessmentMetrics.comprehension}%</span>
                    </div>
                    <Progress value={assessmentMetrics.comprehension} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Overall</span>
                      <span>{assessmentMetrics.overall}%</span>
                    </div>
                    <Progress value={assessmentMetrics.overall} className="h-3" />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={endTest}
                variant="destructive"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing your speech...
                  </div>
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
    </>
  );
};

export default SpeakingListeningCertification;
