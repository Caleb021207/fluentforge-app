
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { READING_QUESTIONS } from "./data/readingQuestions";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { calculateScore, determineLevel } from "./utils/scoreUtils";

const ReadingCertification = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState<string>('A1');

  const questionsForLevel = READING_QUESTIONS.filter(q => q.level === currentLevel);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsCompleted(false);
  };

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsForLevel.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = async () => {
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

      const score = calculateScore(selectedAnswers, questionsForLevel);
      const level = determineLevel(score, currentLevel, READING_QUESTIONS);

      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'reading',
            score,
            level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Certification Completed!",
        description: `You scored ${score}%. Level achieved: ${level}`,
      });

      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting reading certification:', error);
      toast({
        title: "Error",
        description: "Failed to save certification result",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Reading Certification Test - Level {currentLevel}</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your Spanish reading comprehension skills. You'll be presented with
              various types of questions to determine your CEFR level.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleStart}>Start Test</Button>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test completed! Check your results below.
            </p>
            <Button onClick={handleStart}>Take Test Again</Button>
          </div>
        ) : (
          <QuestionDisplay
            question={questionsForLevel[currentQuestionIndex]}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questionsForLevel.length}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingCertification;
