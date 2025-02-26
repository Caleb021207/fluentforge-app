import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, CheckCircle, X } from "lucide-react";
import { Flashcard } from "./types";
import { shuffle } from "@/lib/utils";
import { calculateScore } from "@/components/certifications/utils/scoreUtils";

interface FlashcardQuizProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onBack: () => void;
  setTitle: string;
}

// Define question types for variety
type QuestionType = "multipleChoice" | "trueFalse" | "definition";

interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;
  flashcardId: string;
}

const FlashcardQuiz = ({ flashcards, onComplete, onBack, setTitle }: FlashcardQuizProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Generate quiz questions from flashcards
  useEffect(() => {
    const generatedQuestions: QuizQuestion[] = [];
    
    // Use a subset of flashcards (max 10) to keep the quiz manageable
    const quizFlashcards = shuffle([...flashcards]).slice(0, Math.min(10, flashcards.length));
    
    quizFlashcards.forEach((flashcard, index) => {
      // Create different question types based on index for variety
      const questionType: QuestionType = 
        index % 3 === 0 ? "trueFalse" : 
        index % 3 === 1 ? "definition" : "multipleChoice";
      
      // Get incorrect options from other flashcards
      const otherFlashcards = flashcards.filter(f => f.id !== flashcard.id);
      const incorrectOptions = shuffle(otherFlashcards).slice(0, 3).map(f => f.definition);
      
      let questionText = "";
      let options: string[] = [];
      let correctAnswerIndex = 0;
      
      switch (questionType) {
        case "multipleChoice":
          questionText = `What is the meaning of "${flashcard.term}"?`;
          options = shuffle([flashcard.definition, ...incorrectOptions]);
          correctAnswerIndex = options.indexOf(flashcard.definition);
          break;
          
        case "trueFalse":
          const isTrue = Math.random() > 0.5;
          const randomIncorrect = incorrectOptions[0];
          questionText = isTrue 
            ? `True or False: "${flashcard.term}" means "${flashcard.definition}".`
            : `True or False: "${flashcard.term}" means "${randomIncorrect}".`;
          options = ["True", "False"];
          correctAnswerIndex = isTrue ? 0 : 1;
          break;
          
        case "definition":
          questionText = `Which Spanish word means "${flashcard.definition}"?`;
          const incorrectTerms = shuffle(otherFlashcards).slice(0, 3).map(f => f.term);
          options = shuffle([flashcard.term, ...incorrectTerms]);
          correctAnswerIndex = options.indexOf(flashcard.term);
          break;
      }
      
      generatedQuestions.push({
        id: `quiz-${flashcard.id}-${index}`,
        type: questionType,
        question: questionText,
        options: options,
        correctAnswer: correctAnswerIndex,
        flashcardId: flashcard.id
      });
    });
    
    setQuestions(generatedQuestions);
  }, [flashcards]);

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    // Save the selected answer
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const finalScore = calculateScore(newAnswers, questions);
      setScore(finalScore);
      setQuizCompleted(true);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Preparing quiz questions...</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quiz Results: {setTitle}</h2>
          <Button variant="ghost" size="icon" onClick={() => onComplete(score)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-6xl font-bold text-green-600">{score}%</div>
              <p className="text-center">
                You answered {answers.filter((answer, index) => answer === questions[index].correctAnswer).length} out of {questions.length} questions correctly.
              </p>
              
              <Button 
                variant="default" 
                onClick={() => onComplete(score)}
                className="mt-4"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quiz: {setTitle}</h2>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mb-2">
        <Progress value={progress} className="h-2" />
        <div className="text-sm mt-1">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      
      <Card className="flex-grow">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">
            {currentQuestion.question}
          </h3>
          
          <div className="flex flex-col space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={`${currentQuestion.id}-option-${index}`}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`justify-start h-auto py-3 px-4 ${
                  selectedAnswer === index ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => handleSelectAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end pt-4">
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FlashcardQuiz;
