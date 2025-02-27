
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
    listening: 0,  // Added the listening property
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
    listening: 0,  // Added the listening property
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
        listening: 0,  // Added the listening property
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

  // Generate personalized feedback based on assessment metrics and real-time feedback
  const generateDetailedFeedback = (
    transcript: string[], 
    metrics: AssessmentMetricsType,
    realTimeAssessments: string[]
  ): string => {
    // Generate the CEFR level based on the overall score
    const overallScore = metrics.overall;
    const cefrLevel = determineLevel(overallScore);
    
    // Extract strengths and weaknesses from real-time assessments
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze the metrics to identify strong and weak areas
    const metricEntries = Object.entries(metrics).filter(([key]) => key !== 'overall');
    const avgScore = metricEntries.reduce((sum, [_, value]) => sum + value, 0) / metricEntries.length;
    
    metricEntries.forEach(([key, value]) => {
      const metricName = key.charAt(0).toUpperCase() + key.slice(1);
      
      // If score is significantly above average, it's a strength
      if (value >= avgScore + 10) {
        strengths.push(`Strong ${metricName}: Your ${key} skills are well-developed.`);
      } 
      // If score is significantly below average, it's a weakness
      else if (value <= avgScore - 10) {
        weaknesses.push(`${metricName} needs improvement: Your ${key} skills could use more practice.`);
      }
    });
    
    // Add specific strengths and weaknesses based on real-time assessments
    realTimeAssessments.forEach(assessment => {
      const lowerAssessment = assessment.toLowerCase();
      
      if (
        lowerAssessment.includes("excellent") || 
        lowerAssessment.includes("good") || 
        lowerAssessment.includes("strong") ||
        lowerAssessment.includes("well done")
      ) {
        strengths.push(assessment);
      } 
      else if (
        lowerAssessment.includes("difficulty") || 
        lowerAssessment.includes("struggled") || 
        lowerAssessment.includes("needs improvement") ||
        lowerAssessment.includes("work on") ||
        lowerAssessment.includes("improve")
      ) {
        weaknesses.push(assessment);
      }
    });
    
    // If we didn't extract enough strengths/weaknesses, add generic ones based on scores
    if (strengths.length === 0) {
      if (metrics.pronunciation > 60) strengths.push("Your pronunciation is generally clear and understandable.");
      if (metrics.fluency > 60) strengths.push("You speak with good rhythm and natural flow.");
      if (metrics.grammar > 60) strengths.push("Your grammar usage is generally accurate.");
      if (metrics.vocabulary > 60) strengths.push("You use a good range of vocabulary.");
      if (metrics.comprehension > 60) strengths.push("You demonstrate good listening comprehension.");
      if (metrics.listening > 60) strengths.push("Your listening and response skills are well-developed.");
    }
    
    if (weaknesses.length === 0) {
      if (metrics.pronunciation < 60) weaknesses.push("Work on clearer pronunciation of Spanish sounds.");
      if (metrics.fluency < 60) weaknesses.push("Practice speaking more smoothly with fewer pauses.");
      if (metrics.grammar < 60) weaknesses.push("Focus on improving your grammar accuracy.");
      if (metrics.vocabulary < 60) weaknesses.push("Expand your vocabulary in everyday topics.");
      if (metrics.comprehension < 60) weaknesses.push("Practice listening to understand more complex Spanish.");
      if (metrics.listening < 60) weaknesses.push("Work on understanding and responding to spoken Spanish.");
    }
    
    // Generate personalized recommendations based on identified weaknesses
    if (weaknesses.some(w => w.toLowerCase().includes("pronunciation"))) {
      recommendations.push("Practice specific Spanish sounds you find difficult, especially vowels and trilled 'r'.");
      recommendations.push("Listen and repeat exercises focusing on pronunciation are highly effective.");
    }
    
    if (weaknesses.some(w => w.toLowerCase().includes("fluency") || w.toLowerCase().includes("pauses"))) {
      recommendations.push("Record yourself speaking Spanish and focus on reducing pauses and hesitations.");
      recommendations.push("Practice speaking on familiar topics without preparation to build fluency.");
    }
    
    if (weaknesses.some(w => w.toLowerCase().includes("grammar"))) {
      recommendations.push("Focus on the specific grammar points where you made mistakes during the conversation.");
      recommendations.push("Regular practice with structured grammar exercises will help reinforce patterns.");
    }
    
    if (weaknesses.some(w => w.toLowerCase().includes("vocabulary"))) {
      recommendations.push("Create a personalized vocabulary list from words you struggled with during the conversation.");
      recommendations.push("Use spaced repetition apps to review and practice new vocabulary regularly.");
    }
    
    if (weaknesses.some(w => w.toLowerCase().includes("comprehension") || w.toLowerCase().includes("understanding"))) {
      recommendations.push("Practice listening to a variety of Spanish accents through podcasts and videos.");
      recommendations.push("Start with slower, clearer Spanish content and gradually move to more natural speech.");
    }
    
    if (weaknesses.some(w => w.toLowerCase().includes("listening"))) {
      recommendations.push("Do focused listening exercises where you need to respond to what you hear.");
      recommendations.push("Practice with Spanish language podcasts or audio content designed for your level.");
    }
    
    // Add general recommendations based on CEFR level if we don't have enough specific ones
    if (recommendations.length < 3) {
      switch(cefrLevel) {
        case 'A1':
          recommendations.push("Focus on learning basic vocabulary for everyday situations.");
          recommendations.push("Practice basic greetings and simple conversations.");
          break;
        case 'A2':
          recommendations.push("Start describing your daily activities and routine in Spanish.");
          recommendations.push("Practice past tense to talk about completed actions.");
          break;
        case 'B1':
          recommendations.push("Practice expressing opinions and explaining your reasoning.");
          recommendations.push("Expand vocabulary by topic areas relevant to your interests.");
          break;
        case 'B2':
          recommendations.push("Work on discussing hypothetical situations and conditional forms.");
          recommendations.push("Practice more nuanced expressions of opinion and debate skills.");
          break;
        case 'C1':
          recommendations.push("Focus on professional vocabulary in your field of interest.");
          recommendations.push("Practice subtle differences in meaning and connotation.");
          break;
        case 'C2':
          recommendations.push("Work on mastering regional expressions and colloquialisms.");
          recommendations.push("Practice nuanced communication like humor, irony, and persuasion.");
          break;
      }
    }
    
    // Create comprehensive feedback with all our gathered insights
    const detailedFeedback = `
## Speaking Assessment Results

### Overall Proficiency: ${cefrLevel} (${overallScore}/100)

### Metrics Breakdown:
- Pronunciation: ${metrics.pronunciation}/100
- Fluency: ${metrics.fluency}/100
- Grammar: ${metrics.grammar}/100
- Vocabulary: ${metrics.vocabulary}/100
- Comprehension: ${metrics.comprehension}/100
- Listening: ${metrics.listening}/100

### Your Strengths:
${strengths.map(s => `- ${s}`).join('\n')}

### Areas for Improvement:
${weaknesses.map(w => `- ${w}`).join('\n')}

### Personalized Recommendations:
${recommendations.map(r => `- ${r}`).join('\n')}
`;
    
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
              listening_score: assessmentMetricsRef.current.listening,
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
                    <div className="flex justify-between text-sm">
                      <span>Listening</span>
                      <span>{assessmentMetrics.listening}%</span>
                    </div>
                    <Progress value={assessmentMetrics.listening} className="h-2" />
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
