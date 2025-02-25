
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Award, ArrowLeft, Volume2, Clock, Star, Trophy, Check, X, Bookmark } from 'lucide-react';
import VocabularyLesson from './VocabularyLesson';
import MultipleChoiceExercise from './exercises/MultipleChoiceExercise';
import FillInBlanksExercise from './exercises/FillInBlanksExercise';
import WordMatchingExercise from './exercises/WordMatchingExercise';
import SentenceBuildingExercise from './exercises/SentenceBuildingExercise';
import ListenRepeatExercise from './exercises/ListenRepeatExercise';
import AudioTranscriptionExercise from './exercises/AudioTranscriptionExercise';
import TimedQuizExercise from './exercises/TimedQuizExercise';
import WordOrderingExercise from './exercises/WordOrderingExercise';
import ImageIdentificationExercise from './exercises/ImageIdentificationExercise';
import ShortAnswerExercise from './exercises/ShortAnswerExercise';
import SentenceCorrectionExercise from './exercises/SentenceCorrectionExercise';
import AIWritingPromptExercise from './exercises/AIWritingPromptExercise';
import SpeechToTextExercise from './exercises/SpeechToTextExercise';

interface Exercise {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer?: string | string[];
  image?: string;
  audio?: string;
  points: number;
  feedback?: {
    correct: string;
    incorrect: string;
  };
  timeLimit?: number; // in seconds
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
  xpReward: number;
}

interface Unit {
  id: number;
  title: string;
  description: string;
  vocabulary: string[];
  lessons: Lesson[];
  xpPoints: number;
}

interface LessonViewProps {
  onClose: () => void;
  onComplete: () => void;
  unit: Unit;
}

const LessonView = ({ unit, onClose, onComplete }: LessonViewProps) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { toast } = useToast();

  const currentLesson = unit.lessons[currentLessonIndex];
  const currentExercise = currentLesson?.exercises[currentExerciseIndex];
  
  // Reset timer when exercise changes
  useEffect(() => {
    if (currentExercise?.timeLimit) {
      setTimeLeft(currentExercise.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [currentExercise]);

  // Handle time running out
  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(false);
    }
  }, [timeLeft]);

  const calculateProgress = () => {
    const totalExercises = unit.lessons.reduce((acc, lesson) => acc + lesson.exercises.length, 0);
    const completedExercises = 
      unit.lessons.slice(0, currentLessonIndex).reduce((acc, lesson) => acc + lesson.exercises.length, 0) + 
      currentExerciseIndex;
    
    return (completedExercises / totalExercises) * 100;
  };

  const handleAnswer = (isCorrect: boolean) => {
    const pointsEarned = isCorrect ? currentExercise.points : 0;
    const newStreak = isCorrect ? streak + 1 : 0;

    // Bonus points for streaks
    const streakBonus = newStreak >= 5 ? Math.floor(newStreak / 5) * 10 : 0;
    const totalPoints = pointsEarned + streakBonus;

    setEarnedXP((prev) => prev + totalPoints);
    setStreak(newStreak);

    // Show feedback
    if (isCorrect) {
      setShowFeedback({
        isCorrect: true,
        message: currentExercise.feedback?.correct || "¡Correcto! 🎉"
      });
      
      if (streakBonus > 0) {
        toast({
          title: `${newStreak} Streak! 🔥`,
          description: `Bonus ${streakBonus} XP points earned!`,
        });
      }
    } else {
      setShowFeedback({
        isCorrect: false,
        message: currentExercise.feedback?.incorrect || "¡Inténtalo de nuevo! 💪"
      });
    }

    // Clear feedback after 2 seconds
    setTimeout(() => {
      setShowFeedback(null);
      moveToNextExercise();
    }, 2000);
  };

  const moveToNextExercise = () => {
    const newProgress = calculateProgress();
    setProgress(newProgress);

    if (currentExerciseIndex < currentLesson.exercises.length - 1) {
      // Move to next exercise in current lesson
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else if (currentLessonIndex < unit.lessons.length - 1) {
      // Move to next lesson
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentExerciseIndex(0);
      
      toast({
        title: "Lesson Complete! 🎉",
        description: `You've completed "${currentLesson.title}" and earned ${currentLesson.xpReward} XP!`,
      });
    } else {
      // Unit complete
      toast({
        title: "Unit Complete! 🏆",
        description: `Congratulations! You've earned a total of ${earnedXP} XP points!`,
      });
      onComplete();
    }
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    const commonProps = {
      exercise: currentExercise,
      onAnswer: handleAnswer,
      timeLeft: timeLeft
    };

    switch (currentExercise.type) {
      case 'multiple-choice':
        return <MultipleChoiceExercise {...commonProps} />;
      case 'fill-in-blanks':
        return <FillInBlanksExercise {...commonProps} />;
      case 'word-matching':
        return <WordMatchingExercise {...commonProps} />;
      case 'sentence-building':
        return <SentenceBuildingExercise {...commonProps} />;
      case 'listen-repeat':
        return <ListenRepeatExercise {...commonProps} />;
      case 'audio-transcription':
        return <AudioTranscriptionExercise {...commonProps} />;
      case 'timed-quiz':
        return <TimedQuizExercise {...commonProps} />;
      case 'word-ordering':
        return <WordOrderingExercise {...commonProps} />;
      case 'image-identification':
        return <ImageIdentificationExercise {...commonProps} />;
      case 'short-answer':
        return <ShortAnswerExercise {...commonProps} />;
      case 'sentence-correction':
        return <SentenceCorrectionExercise {...commonProps} />;
      case 'ai-writing-prompt':
        return <AIWritingPromptExercise {...commonProps} />;
      case 'speech-to-text':
        return <SpeechToTextExercise {...commonProps} />;
      case 'vocabulary':
        return <VocabularyLesson
                vocabulary={unit.vocabulary}
                onComplete={() => handleAnswer(true)}
              />;
      default:
        return <div>Exercise type not supported</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          <div className="text-center pt-8">
            <CardTitle className="text-2xl font-bold">{unit.title}</CardTitle>
            <p className="text-muted-foreground mt-2">{unit.description}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="text-sm font-medium">
                Lesson {currentLessonIndex + 1}/{unit.lessons.length}: {currentLesson?.title}
              </p>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">{earnedXP} XP</span>
              </div>
              {streak >= 3 && (
                <div className="flex items-center">
                  <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center">
                    <span>🔥</span> {streak}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {timeLeft !== null && (
            <div className="mt-2 flex items-center justify-end text-sm">
              <Clock className="h-4 w-4 mr-1 text-amber-500" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {showFeedback ? (
            <div className={`p-6 text-center rounded-lg mb-4 ${
              showFeedback.isCorrect 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              <div className="flex items-center justify-center mb-2">
                {showFeedback.isCorrect ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <X className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className="text-lg font-medium">{showFeedback.message}</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  Exercise {currentExerciseIndex + 1}/{currentLesson?.exercises.length}
                </h3>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{currentExercise?.points} points</span>
                </div>
              </div>
              
              {currentExercise && renderExercise()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonView;
