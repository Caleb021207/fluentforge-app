
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, CheckCircle, X } from "lucide-react";
import { Flashcard } from "./types";
import { shuffle } from "@/lib/utils";
import { calculateScore } from "@/components/certifications/utils/scoreUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // Save quiz result to user's progress
      saveQuizResult(finalScore);
    }
  };
  
  const saveQuizResult = async (score: number) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        setSaveError("Authentication error. You must be logged in to save quiz results.");
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save quiz results.",
          variant: "destructive",
        });
        return;
      }
      
      if (!userData || !userData.user) {
        setSaveError("Not logged in. Please log in to save your progress.");
        toast({
          title: "Not Logged In",
          description: "Please log in to save your progress.",
          variant: "destructive",
        });
        return;
      }
      
      const userId = userData.user.id;
      
      // Extract level from the setTitle (assuming format like "A1 - Basic Vocabulary")
      let level = "A1"; // Default level
      if (setTitle.startsWith("A1")) level = "A1";
      else if (setTitle.startsWith("A2")) level = "A2";
      else if (setTitle.startsWith("B1")) level = "B1";
      else if (setTitle.startsWith("B2")) level = "B2";
      else if (setTitle.startsWith("C1") || setTitle.startsWith("C2")) level = "C1-C2";
      
      console.log(`Saving vocabulary quiz result for user ${userId}, level ${level}, score ${score}`);
      
      // Save quiz attempt as a "vocabulary" certification
      const { data, error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            user_id: userId,
            certification_type: 'vocabulary',
            level: level,
            score: score,
            completed_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) {
        console.error("Error saving quiz result:", error);
        setSaveError(`Error saving progress: ${error.message}`);
        toast({
          title: "Error Saving Progress",
          description: "There was a problem saving your quiz results.",
          variant: "destructive",
        });
      } else {
        console.log("Quiz result saved successfully:", data);
        toast({
          title: "Progress Saved",
          description: `Your vocabulary quiz score of ${score}% has been saved.`,
        });
      }
    } catch (error) {
      console.error("Error in saveQuizResult:", error);
      setSaveError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to save your quiz results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
              
              {saveError && (
                <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded-md">
                  {saveError}
                </div>
              )}
              
              <Button 
                variant="default" 
                onClick={() => onComplete(score)}
                className="mt-4"
                disabled={isSaving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Complete Quiz"}
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
