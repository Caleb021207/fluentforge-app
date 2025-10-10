
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "./types/reading";
import { READING_QUESTIONS } from "./data/readingQuestions";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { calculateScore, determineLevel, getLevelDescription } from "./utils/scoreUtils";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";
import { BookOpen } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const ReadingCertification = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [levelRecommendations, setLevelRecommendations] = useState<any | null>(null);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  const { level } = useParams<{ level?: string }>();
  const navigate = useNavigate();

  // Filter questions based on the selected level or default to showing all questions
  useEffect(() => {
    if (level) {
      // If a specific level is selected, filter questions by that level
      const levelQuestions = READING_QUESTIONS.filter(q => q.level.toLowerCase() === level.toLowerCase());
      // Limit to 15 questions max
      setTestQuestions(levelQuestions.slice(0, 15));
    } else {
      // Default behavior - show questions from all levels
      // This ensures backward compatibility
      setTestQuestions(READING_QUESTIONS);
    }
  }, [level]);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setIsComplete(false);
    setLevelRecommendations(null);
  };

  const handleAnswerSelect = (value: string) => {
    const numericValue = parseInt(value);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = numericValue;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompletion(selectedAnswers);
    }
  };

  const handleCompletion = async (answers: number[]) => {
    const score = calculateScore(answers, testQuestions);
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

  const getLevelTitle = () => {
    if (!level) return "Reading Certification Test";
    
    return `${level.toUpperCase()} Level Reading Test`;
  };

  const getTestDescription = () => {
    if (!level) {
      return "Test your English reading comprehension skills. You'll be presented with a series of passages and questions to assess your level.";
    }
    
    switch(level.toUpperCase()) {
      case 'A1':
        return "This test measures your basic English reading comprehension. You'll read simple sentences and answer questions about them.";
      case 'A2':
        return "This test measures your elementary English reading skills. You'll read short texts about everyday topics and answer questions.";
      case 'B1':
        return "This test measures your intermediate English reading skills. You'll read texts about familiar matters and answer questions.";
      case 'B2':
        return "This test measures your upper-intermediate English reading skills. You'll read complex texts and answer more challenging questions.";
      case 'C1':
        return "This test measures your advanced English reading skills. You'll read demanding texts and answer detailed questions.";
      case 'C2':
        return "This test measures your proficient English reading skills. You'll read highly complex texts and answer sophisticated questions.";
      default:
        return "Test your English reading comprehension skills. You'll be presented with a series of passages and questions to assess your level.";
    }
  };

  if (!isStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            {getLevelTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 text-base md:text-lg">
              {getTestDescription()}
            </p>
            {!level && (
              <div className="space-y-3 mb-6">
                <p className="font-medium text-base md:text-lg">Choose a specific level test:</p>
                <div className="flex flex-wrap gap-3">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((levelOption) => (
                    <Button 
                      key={levelOption}
                      variant="outline"
                      className="text-base md:text-lg px-6 py-4"
                      onClick={() => navigate(`/certificates/reading/${levelOption.toLowerCase()}`)}
                    >
                      {levelOption} Test
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={handleStart} className="text-lg md:text-xl px-8 py-6">
              Start {level ? `${level.toUpperCase()} Test` : "Test"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    const score = calculateScore(selectedAnswers, testQuestions);
    const achievedLevel = determineLevel(score);
    const levelDescription = getLevelDescription(achievedLevel);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Assessment Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-xl md:text-2xl mb-3">Your Results</h3>
              <div className="mb-3 text-base md:text-lg">
                <span className="font-medium">Score:</span> {score}%
              </div>
              <div className="mb-3 text-base md:text-lg">
                <span className="font-medium">CEFR Level:</span> {achievedLevel}
              </div>
              <p className="text-base md:text-lg text-gray-700 mt-3">{levelDescription}</p>
            </div>

            {levelRecommendations && (
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-xl md:text-2xl mb-4">Your Reading Profile</h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-lg md:text-xl mb-3">Strengths:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {levelRecommendations.strengths.map((strength: string, i: number) => (
                      <li key={i} className="text-gray-700 text-base md:text-lg">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-lg md:text-xl mb-3">Areas for Improvement:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {levelRecommendations.weaknesses.map((weakness: string, i: number) => (
                      <li key={i} className="text-gray-700 text-base md:text-lg">{weakness}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-lg md:text-xl mb-3">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {levelRecommendations.recommendations.map((recommendation: string, i: number) => (
                      <li key={i} className="text-gray-700 text-base md:text-lg">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button onClick={handleStart} className="text-lg md:text-xl px-6 py-4">Take Test Again</Button>
              <Button variant="outline" onClick={() => navigate('/certificates')} className="text-lg md:text-xl px-6 py-4">Back to Certificates</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {currentQuestion + 1} of {testQuestions.length}</CardTitle>
      </CardHeader>
      <CardContent>
        {testQuestions.length > 0 ? (
          <QuestionDisplay
            question={testQuestions[currentQuestion]}
            currentQuestionIndex={currentQuestion}
            totalQuestions={testQuestions.length}
            selectedAnswer={selectedAnswers[currentQuestion]}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
          />
        ) : (
          <div className="text-center py-4">
            <p>No questions available for this level.</p>
            <Button className="mt-4" onClick={() => navigate('/certificates/reading')}>
              Back to Reading Tests
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingCertification;
