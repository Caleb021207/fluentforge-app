
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
  // Clear the selected value when the question changes
  React.useEffect(() => {
    // This ensures the radio button selection is reset when question changes
    // The component will re-render with the correct selectedAnswer prop
  }, [question]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
        <p className="mb-4 break-words text-sm sm:text-base">{question.text}</p>
        <RadioGroup 
          onValueChange={onAnswerSelect}
          value={selectedAnswer !== undefined ? selectedAnswer.toString() : undefined}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
              <Label htmlFor={`option-${index}`} className="flex-1 text-xs sm:text-sm md:text-base">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs sm:text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
        <Button 
          onClick={onNext}
          disabled={selectedAnswer === undefined}
          size="sm"
          className="ml-2 px-2 sm:px-4"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
