
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      
      const response = await fetch("/api/functions/v1/grade-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          essay,
          prompt: currentPrompt.prompt,
          targetLevel: currentPrompt.level,
        }),
      });

      const { score, level, feedback } = await response.json();

      // Save the certification attempt
      const { error } = await supabase
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

      if (error) throw error;

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
                  Submit
                </Button>
              </div>
            </div>

            {feedback && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Feedback:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WritingCertification;

