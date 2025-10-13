import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { READING_QUESTIONS } from "@/components/certifications/data/readingQuestions";
import { QuestionDisplay } from "@/components/certifications/components/QuestionDisplay";
import { determineLevel, getLevelDescription } from "@/components/certifications/utils/scoreUtils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Award, BookOpen } from "lucide-react";

const PlacementQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizState, setQuizState] = useState<"intro" | "quiz" | "results">("intro");
  const [quizQuestions, setQuizQuestions] = useState<typeof READING_QUESTIONS>([]);
  
  useEffect(() => {
    // Select 2 questions from each level (A1, A2, B1, B2, C1, C2) to create a balanced quiz
    const selectedQuestions = [];
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    
    for (const level of levels) {
      const levelQuestions = READING_QUESTIONS.filter(q => q.level === level);
      // Select 2 random questions from each level
      const randomQuestions = levelQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      selectedQuestions.push(...randomQuestions);
    }
    
    // Shuffle the combined questions
    setQuizQuestions(selectedQuestions.sort(() => 0.5 - Math.random()));
  }, []);

  const progress = quizQuestions.length 
    ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 
    : 0;

  const handleAnswerSelect = (value: string) => {
    const numericValue = parseInt(value);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = numericValue;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    setQuizState("results");
  };

  const getScore = () => {
    if (selectedAnswers.length === 0 || quizQuestions.length === 0) return 0;
    
    // Count correct answers
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === quizQuestions[index].correctAnswer
    ).length;
    
    return Math.round((correctAnswers / quizQuestions.length) * 100);
  };

  const getRecommendedLevel = () => {
    const score = getScore();
    return determineLevel(score);
  };

  const getStartingLevel = () => {
    const recommendedLevel = getRecommendedLevel();
    // CEFR levels in ascending order
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const currentLevelIndex = levels.indexOf(recommendedLevel);
    
    // If the recommended level is A1 (or invalid), keep them at A1
    if (currentLevelIndex <= 0) {
      return "a1";
    }
    
    // Otherwise, return one level below the recommended level
    return levels[currentLevelIndex - 1].toLowerCase();
  };

  const startQuiz = () => {
    setQuizState("quiz");
  };

  const goToLessons = () => {
    // Use the starting level (one below recommended) instead of the recommended level
    const level = getStartingLevel();
    navigate(`/lessons?level=${level}`);
  };

  if (quizState === "intro") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-lingua-primary to-lingua-secondary text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Language Placement Quiz</CardTitle>
              <CardDescription className="text-white opacity-90">
                Discover your current language proficiency level
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="space-y-6">
                <p className="text-lg">
                  This quiz will help determine your current language level according to the Common European Framework of Reference (CEFR).
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-lg flex gap-3">
                    <div className="mt-1">
                      <BookOpen className="h-5 w-5 text-lingua-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Quiz Format</h3>
                      <p className="text-sm text-gray-600">
                        12 multiple-choice questions covering different proficiency levels
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg flex gap-3">
                    <div className="mt-1">
                      <Award className="h-5 w-5 text-lingua-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Results</h3>
                      <p className="text-sm text-gray-600">
                        Receive your CEFR level (A1-C2) and personalized learning recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <Button onClick={startQuiz} className="w-full md:w-auto">
                Start Placement Quiz
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (quizState === "quiz" && quizQuestions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-lingua-text">Placement Quiz</h1>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <QuestionDisplay
                question={quizQuestions[currentQuestionIndex]}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={quizQuestions.length}
                selectedAnswer={selectedAnswers[currentQuestionIndex]}
                onAnswerSelect={handleAnswerSelect}
                onNext={handleNext}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (quizState === "results") {
    const recommendedLevel = getRecommendedLevel();
    const startingLevel = getStartingLevel().toUpperCase();
    const levelDescription = getLevelDescription(recommendedLevel);
    const startingLevelDescription = getLevelDescription(startingLevel);
    
    return (
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-lingua-primary to-lingua-secondary text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Your Results</CardTitle>
              <CardDescription className="text-white opacity-90">
                Based on your answers to the placement quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-lingua-primary text-white text-4xl font-bold mb-4">
                    {recommendedLevel}
                  </div>
                  <h2 className="text-xl font-bold mb-2">Your level: {recommendedLevel}</h2>
                  <p className="text-center text-gray-600 max-w-md">{levelDescription}</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Next Steps</h3>
                  <p className="mb-4">
                    To ensure a solid foundation, we'll start you at level {startingLevel}, which is one level below your 
                    assessed proficiency. This will help you build confidence while reviewing important concepts.
                  </p>
                  {startingLevel !== recommendedLevel && (
                    <p className="p-3 bg-blue-50 rounded border border-blue-100 text-sm">
                      <strong>Starting level ({startingLevel}):</strong> {startingLevelDescription}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <Button onClick={goToLessons} className="w-full md:w-auto">
                Start Learning
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="max-w-4xl mx-auto p-4 flex justify-center items-center min-h-[50vh]">
      <p>Loading quiz questions...</p>
    </div>
  );
};

export default PlacementQuiz;
