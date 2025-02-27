
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";
import { determineLevel } from "./utils/scoreUtils";

const WRITING_PROMPTS = [
  {
    level: "B1",
    prompt: "Describe your favorite holiday or vacation. Where did you go? What did you do? Why was it memorable?",
    minWords: 100,
    maxWords: 200
  },
  {
    level: "B1",
    prompt: "Write about a person who has influenced your life. Who are they? How did they influence you?",
    minWords: 100,
    maxWords: 200
  }
];

const WritingCertification = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [detailedFeedback, setDetailedFeedback] = useState<any | null>(null);
  const { toast } = useToast();

  // Randomly select a prompt when starting the test
  const [currentPrompt] = useState(() => 
    WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]
  );

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your certification attempt.",
          variant: "destructive",
        });
        return;
      }

      const wordCount = countWords(essay);
      if (wordCount < currentPrompt.minWords) {
        toast({
          title: "Too Short",
          description: `Please write at least ${currentPrompt.minWords} words. Current: ${wordCount} words.`,
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      
      const { data: gradeResult, error: gradeError } = await supabase.functions.invoke('grade-writing', {
        body: {
          essay,
          prompt: currentPrompt.prompt,
          targetLevel: currentPrompt.level,
        },
      });

      if (gradeError) throw gradeError;

      // Extract score and make sure to use our rubric to determine level
      let { score, feedback } = gradeResult;
      
      // Use our own determineLevel function to ensure consistency with the rubric
      const level = determineLevel(score);
      
      // Get CEFR recommendations for the achieved level
      const levelRecommendations = getRecommendationsForLevel('writing', level);
      
      // Set the detailed feedback
      setDetailedFeedback({
        score,
        level,
        generalFeedback: feedback,
        recommendations: levelRecommendations
      });

      // Save the certification attempt
      const { error: saveError } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'writing',
            score,
            level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ]);

      if (saveError) throw saveError;

      setFeedback(feedback);
      toast({
        title: "Writing Assessment Complete",
        description: `You achieved a score of ${score}% at level ${level}`,
      });
    } catch (error) {
      console.error("Error submitting writing:", error);
      toast({
        title: "Error",
        description: "Failed to submit writing assessment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setEssay("");
    setFeedback(null);
    setDetailedFeedback(null);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Writing Certification Test</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your Spanish writing skills. You'll be given a prompt to write about.
              Your response will be evaluated based on grammar, vocabulary, and overall proficiency.
            </p>
            <Button onClick={handleStart}>Start Test</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Writing Prompt:</h3>
              <p className="mb-4">{currentPrompt.prompt}</p>
              <p className="text-sm text-gray-600">
                Write between {currentPrompt.minWords} and {currentPrompt.maxWords} words.
              </p>
            </div>

            <Textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write your response here..."
              className="min-h-[200px]"
            />

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Words: {countWords(essay)}
              </div>
              <div className="space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleStart()}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || countWords(essay) < currentPrompt.minWords}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>

            {detailedFeedback && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Your Results</h3>
                  <div className="mb-2">
                    <span className="font-medium">Score:</span> {detailedFeedback.score}%
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">CEFR Level:</span> {detailedFeedback.level}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Feedback on Your Writing</h3>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{feedback}</p>
                </div>

                {detailedFeedback.recommendations && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">Your Writing Profile</h3>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-md mb-2">Strengths:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {detailedFeedback.recommendations.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-gray-700">{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-md mb-2">Areas for Improvement:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {detailedFeedback.recommendations.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="text-gray-700">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="font-medium text-md mb-2">Recommendations:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {detailedFeedback.recommendations.recommendations.map((recommendation: string, i: number) => (
                          <li key={i} className="text-gray-700">{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WritingCertification;
