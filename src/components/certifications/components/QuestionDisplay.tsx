
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Question } from "../types/reading";

interface QuestionDisplayProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswerSelect: (value: string) => void;
  onNext: () => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="mb-4">{question.text}</p>
        <RadioGroup 
          onValueChange={onAnswerSelect}
          value={selectedAnswer?.toString()}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
        <Button 
          onClick={onNext}
          disabled={selectedAnswer === undefined}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
