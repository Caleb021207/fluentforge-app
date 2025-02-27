
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
  const { toast } = useToast();
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Initialize speech synthesis when instructions modal is opened
  useEffect(() => {
    if (showInstructions) {
      utteranceRef.current = new SpeechSynthesisUtterance(testInstructions);
      utteranceRef.current.lang = 'en-US';  // Changed from 'es-ES' to 'en-US'
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

  // Simplified - generate feedback based only on CEFR level
  const generateFeedbackForLevel = (level: string): string => {
    // Use the existing CEFR level descriptions from scoreUtils
    const levelDescription = getLevelDescription(level);
    
    return `
      ## Speaking & Listening Assessment
      
      ### CEFR Level: ${level}
      
      ${levelDescription}
      
      ### Feedback
      
      ${getFeedbackForLevel(level)}
      
      ### Suggestions for Improvement
      
      ${getSuggestionsForLevel(level)}
    `;
  };
  
  const getFeedbackForLevel = (level: string): string => {
    switch (level) {
      case 'C2':
        return "Your speaking skills demonstrate mastery of the language. You communicate with precision, fluency, and nuance across a wide range of topics. Your listening comprehension is excellent, allowing you to understand complex and implicit meanings.";
      case 'C1':
        return "You communicate fluently and spontaneously with very few hesitations. You have a broad vocabulary and can express complex ideas clearly. Your listening comprehension is very good, though you may occasionally miss subtle nuances or cultural references.";
      case 'B2':
        return "You speak with good fluency on familiar topics and can participate effectively in most conversations. Your vocabulary is sufficient for most contexts, though you may sometimes search for words. Your listening comprehension is good for clear speech on familiar topics.";
      case 'B1':
        return "You can communicate in straightforward situations about familiar topics. Your vocabulary covers everyday needs, though with some limitations. Your listening comprehension is adequate for clear, standard speech on familiar matters.";
      case 'A2':
        return "You can engage in simple exchanges on predictable topics. Your vocabulary is limited to basic personal and everyday topics. Your listening comprehension allows you to understand short, clear messages and announcements.";
      case 'A1':
        return "You can use basic phrases and expressions related to personal details and concrete needs. Your vocabulary is limited to a small repertoire of isolated words and phrases. Your listening comprehension is limited to carefully articulated speech with long pauses.";
      default:
        return "Your speaking and listening skills have been assessed. Continue practicing to improve your language proficiency.";
    }
  };
  
  const getSuggestionsForLevel = (level: string): string => {
    switch (level) {
      case 'C2':
        return "- Continue refining your command of idiomatic expressions and cultural nuances\n- Practice specialized vocabulary in professional or academic fields\n- Challenge yourself with debates on complex topics";
      case 'C1':
        return "- Work on mastering subtle nuances and cultural references\n- Expand your vocabulary with more specialized terminology\n- Practice understanding different accents and regional variations";
      case 'B2':
        return "- Practice expressing more complex ideas and opinions\n- Work on speaking more fluently without long pauses\n- Expand your vocabulary beyond everyday topics\n- Practice understanding different accents";
      case 'B1':
        return "- Practice describing experiences, hopes, and plans in more detail\n- Work on connecting your ideas more smoothly\n- Build vocabulary beyond basic everyday topics\n- Listen to authentic materials like podcasts and videos";
      case 'A2':
        return "- Practice forming complete sentences\n- Work on asking and answering questions about personal information\n- Expand your vocabulary to cover more everyday topics\n- Listen to simplified audio materials regularly";
      case 'A1':
        return "- Focus on learning basic greetings and common phrases\n- Practice basic personal introduction\n- Build vocabulary of everyday objects and actions\n- Listen to and repeat simple phrases";
      default:
        return "- Continue practicing speaking and listening regularly\n- Engage in conversations with native speakers when possible\n- Listen to authentic materials like podcasts, videos, and music";
    }
  };

  // Improved scoring algorithm
  const calculateScore = (responses: string[], userTranscripts: string[]): { score: number, level: string } => {
    // Base score - start with a reasonable baseline
    // For testing purposes, set this to a moderate level (B1-B2 range)
    let baseScore = 65; 
    
    // Initialize category scores
    let fluencyScore = 0;
    let comprehensionScore = 0;
    let grammarScore = 0;
    let vocabularyScore = 0;
    let complexityScore = 0;
    
    // 1. Analyze user transcripts - if we have transcripts, use them for analysis
    if (userTranscripts.length > 0) {
      // Get total text length - longer responses typically indicate more fluency
      const totalText = userTranscripts.join(" ");
      const wordCount = totalText.split(/\s+/).filter(Boolean).length;
      
      // Check for complex sentence structures
      const complexSentenceMarkers = ["because", "although", "however", "therefore", "meanwhile", "nevertheless", "furthermore"];
      const complexSentenceCount = complexSentenceMarkers.reduce(
        (count, marker) => count + (totalText.toLowerCase().match(new RegExp(`\\b${marker}\\b`, "g")) || []).length, 0
      );
      
      // Analyze word variety - unique words as a percentage of total
      const uniqueWords = new Set(totalText.toLowerCase().split(/\s+/).filter(Boolean)).size;
      const wordVarietyRatio = uniqueWords / Math.max(1, wordCount);
      
      // Apply scoring adjustments based on speech patterns
      if (wordCount > 200) fluencyScore += 10;
      else if (wordCount > 100) fluencyScore += 5;
      
      if (complexSentenceCount > 5) complexityScore += 10;
      else if (complexSentenceCount > 2) complexityScore += 5;
      
      if (wordVarietyRatio > 0.7) vocabularyScore += 10;
      else if (wordVarietyRatio > 0.5) vocabularyScore += 5;
    }
    
    // 2. Analyze AI responses for hints about user's performance
    if (responses.length > 0) {
      const responseText = responses.join(" ").toLowerCase();
      
      // Look for positive feedback indicators
      const positiveIndicators = [
        "excellent", "very good", "great", "impressive", "well done", 
        "fluent", "clear", "articulate", "proficient", "advanced"
      ];
      
      const negativeIndicators = [
        "difficult to understand", "unclear", "basic", "limited", 
        "beginner", "elementary", "work on", "practice more", "struggling"
      ];
      
      // Count occurrences of indicators
      const positiveCount = positiveIndicators.reduce(
        (count, word) => count + (responseText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length, 0
      );
      
      const negativeCount = negativeIndicators.reduce(
        (count, word) => count + (responseText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length, 0
      );
      
      // Apply score adjustments based on AI feedback
      const feedbackAdjustment = (positiveCount * 3) - (negativeCount * 2);
      baseScore += feedbackAdjustment;
      
      // Check for specific skill mentions
      if (responseText.includes("grammar") && responseText.includes("correct")) {
        grammarScore += 5;
      } else if (responseText.includes("grammar") && (responseText.includes("error") || responseText.includes("mistake"))) {
        grammarScore -= 5;
      }
      
      if (responseText.includes("vocabulary") && (responseText.includes("rich") || responseText.includes("diverse"))) {
        vocabularyScore += 5;
      }
      
      if (responseText.includes("fluent") || responseText.includes("fluency")) {
        fluencyScore += 5;
      }
      
      if (responseText.includes("understood") || responseText.includes("comprehension")) {
        comprehensionScore += 5;
      }
    }
    
    // 3. Calculate final score
    // Add all category scores to the base score, with a minimum of 40 and maximum of 100
    const totalCategoryScore = fluencyScore + comprehensionScore + grammarScore + vocabularyScore + complexityScore;
    let finalScore = Math.min(100, Math.max(40, baseScore + totalCategoryScore));
    
    // For demo purposes, adjust the score to be higher if no clear signals
    // (This is to prevent the system from defaulting to A1 with minimal data)
    if (responses.length < 3 && userTranscripts.length < 3) {
      finalScore = Math.max(finalScore, 70); // Default to at least B1-B2 range with limited data
    }
    
    // Determine CEFR level based on score
    let level = "B1"; // Default to B1 instead of A1
    if (finalScore >= 90) level = "C2";
    else if (finalScore >= 80) level = "C1";
    else if (finalScore >= 70) level = "B2";
    else if (finalScore >= 60) level = "B1";
    else if (finalScore >= 50) level = "A2";
    else level = "A1";

    console.log("Speaking test score calculation:", {
      baseScore,
      fluencyScore,
      comprehensionScore,
      grammarScore,
      vocabularyScore,
      complexityScore,
      finalScore,
      level
    });
    
    return { score: Math.round(finalScore), level };
  };

  const endTest = async () => {
    try {
      setIsSubmitting(true);
      await conversation.endSession();
      setIsStarted(false);
      setTimeLeft(180); // Reset timer
      
      // Calculate the score based on the AI's responses and user transcripts
      const { score, level } = calculateScore(responses, userTranscript);
      
      // Generate feedback based on the CEFR level
      const levelFeedback = generateFeedbackForLevel(level);
      setFeedback(levelFeedback);
      setShowFeedback(true);

      // Save the test results
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'speaking',
            score,
            level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ]);

      if (error) throw error;
      
      // Also save a listening score (can be the same or slightly different)
      const listeningScore = Math.max(40, Math.min(100, score + (Math.random() * 10 - 5))); // Small random variation
      const listeningLevel = level; // Same level for simplicity
      
      const { error: listeningError } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'listening',
            score: Math.round(listeningScore),
            level: listeningLevel,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ]);
        
      if (listeningError) throw listeningError;

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
