
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Question = {
  text: string;
  options: string[];
  correctAnswer: number;
};

const SAMPLE_QUESTIONS: Question[] = [
  {
    text: "María disfruta mucho de su trabajo como profesora. Todos los días se levanta temprano para preparar sus clases. Sus estudiantes la aprecian porque explica todo con mucha paciencia y claridad. ¿Cuál es la profesión de María?",
    options: [
      "Doctora",
      "Profesora",
      "Ingeniera",
      "Abogada"
    ],
    correctAnswer: 1
  },
  {
    text: "Juan va al supermercado todos los sábados. Siempre compra frutas, verduras y pan fresco. Le gusta cocinar comidas saludables para su familia. ¿Qué día va Juan al supermercado?",
    options: [
      "Lunes",
      "Miércoles",
      "Viernes",
      "Sábados"
    ],
    correctAnswer: 3
  }
];

const ReadingCertification = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

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
    if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === SAMPLE_QUESTIONS[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / SAMPLE_QUESTIONS.length) * 100);
  };

  const completeTest = async () => {
    const score = calculateScore();
    const level = score >= 80 ? 'B1' : score >= 60 ? 'A2' : 'A1';

    try {
      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'reading',
            score,
            level,
            completed_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Certification Completed!",
        description: `You scored ${score}%. Level achieved: ${level}`,
      });

      setIsCompleted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save certification result",
        variant: "destructive",
      });
    }
  };

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Reading Certification Test</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your Spanish reading comprehension skills. You'll be presented with
              text passages and questions to answer. Your responses will determine
              your CEFR level.
            </p>
            <Button onClick={handleStart}>Start Test</Button>
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test completed! Check your results below.
            </p>
            <Button onClick={handleStart}>Take Test Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="mb-4">{currentQuestion.text}</p>
              <RadioGroup 
                onValueChange={handleAnswerSelect}
                value={selectedAnswers[currentQuestionIndex]?.toString()}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length}
              </div>
              <Button 
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
              >
                {currentQuestionIndex === SAMPLE_QUESTIONS.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingCertification;
