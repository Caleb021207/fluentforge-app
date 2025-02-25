
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

  // Use all questions instead of filtering by level
  const questions = READING_QUESTIONS;

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
    if (currentQuestionIndex < questions.length - 1) {
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

      const score = calculateScore(selectedAnswers, questions);
      // Determine level based on all questions, starting from A1
      const level = determineLevel(score, 'A1', questions);

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

  const renderCEFRRubric = () => {
    const levels = [
      { level: 'C2', range: '90-100%', description: 'Mastery' },
      { level: 'C1', range: '80-89%', description: 'Advanced' },
      { level: 'B2', range: '70-79%', description: 'Upper Intermediate' },
      { level: 'B1', range: '60-69%', description: 'Intermediate' },
      { level: 'A2', range: '50-59%', description: 'Elementary' },
      { level: 'A1', range: '40-49%', description: 'Beginner' },
    ];

    return (
      <div className="mt-8 border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">CEFR Level Rubric</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="font-medium">Level</div>
          <div className="font-medium">Score Range</div>
          <div className="font-medium">Description</div>
          {levels.map((level) => (
            <React.Fragment key={level.level}>
              <div className="py-2">{level.level}</div>
              <div className="py-2">{level.range}</div>
              <div className="py-2">{level.description}</div>
            </React.Fragment>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Note: Your level is determined proportionally based on your performance across all questions. 
          Every 5 questions represent one CEFR level, starting from A1 (questions 1-5) up to C2 (questions 26-30).
        </p>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Reading Certification Test - All Levels (A1-C2)</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your Spanish reading comprehension skills across all CEFR levels (A1-C2). 
              Questions will progressively get more challenging. Your final level will be determined 
              based on your overall performance.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleStart}>Start Test</Button>
            </div>
            {renderCEFRRubric()}
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test completed! Check your results below.
            </p>
            <Button onClick={handleStart}>Take Test Again</Button>
            {renderCEFRRubric()}
          </div>
        ) : (
          <QuestionDisplay
            question={questions[currentQuestionIndex]}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
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
