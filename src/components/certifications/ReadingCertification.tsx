
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "./types/reading";
import { READING_QUESTIONS } from "./data/readingQuestions";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { calculateScore, determineLevel, getLevelDescription } from "./utils/scoreUtils";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";

const ReadingCertification = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [levelRecommendations, setLevelRecommendations] = useState<any | null>(null);
  const { toast } = useToast();

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setIsComplete(false);
    setLevelRecommendations(null);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    if (currentQuestion < READING_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompletion(newAnswers);
    }
  };

  const handleCompletion = async (answers: number[]) => {
    const score = calculateScore(answers, READING_QUESTIONS);
    const level = determineLevel(score);
    const recommendations = getRecommendationsForLevel('reading', level);
    
    setLevelRecommendations(recommendations);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your certification attempt.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'reading',
            score,
            level,
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: "Reading Assessment Complete",
        description: `You achieved a score of ${score}% at level ${level}`,
      });
    } catch (error) {
      console.error("Error submitting reading assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit reading assessment",
        variant: "destructive",
      });
    }
  };

  if (!isStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Certification Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your Spanish reading comprehension skills. You'll be presented with a series of
              passages and questions to assess your level.
            </p>
            <Button onClick={handleStart}>Start Test</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    const score = calculateScore(selectedAnswers, READING_QUESTIONS);
    const level = determineLevel(score);
    const levelDescription = getLevelDescription(level);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Assessment Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Your Results</h3>
              <div className="mb-2">
                <span className="font-medium">Score:</span> {score}%
              </div>
              <div className="mb-2">
                <span className="font-medium">CEFR Level:</span> {level}
              </div>
              <p className="text-sm text-gray-700 mt-2">{levelDescription}</p>
            </div>

            {levelRecommendations && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Your Reading Profile</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-md mb-2">Strengths:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {levelRecommendations.strengths.map((strength: string, i: number) => (
                      <li key={i} className="text-gray-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-md mb-2">Areas for Improvement:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {levelRecommendations.weaknesses.map((weakness: string, i: number) => (
                      <li key={i} className="text-gray-700">{weakness}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-2">
                  <h4 className="font-medium text-md mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {levelRecommendations.recommendations.map((recommendation: string, i: number) => (
                      <li key={i} className="text-gray-700">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <Button onClick={handleStart}>Take Test Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {currentQuestion + 1} of {READING_QUESTIONS.length}</CardTitle>
      </CardHeader>
      <CardContent>
        <QuestionDisplay
          question={READING_QUESTIONS[currentQuestion]}
          currentQuestionIndex={currentQuestion}
          totalQuestions={READING_QUESTIONS.length}
          onAnswerSelect={(answer) => handleAnswer(parseInt(answer))}
          onNext={() => {}}
        />
      </CardContent>
    </Card>
  );
};

export default ReadingCertification;
