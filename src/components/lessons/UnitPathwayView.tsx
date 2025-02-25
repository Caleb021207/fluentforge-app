
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ChevronRight, BookOpen, MessageCircle, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Exercise {
  id: number;
  type: string;
  question: string;
  points: number;
}

interface LessonForUnit {
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
  lessons: LessonForUnit[];
  xpPoints: number;
}

interface UnitPathwayViewProps {
  unit: Unit;
  onClose: () => void;
  onStartLesson: (lessonIndex: number) => void;
}

const UnitPathwayView = ({ unit, onClose, onStartLesson }: UnitPathwayViewProps) => {
  // Determine which lesson icons to show based on exercise types
  const getLessonIcon = (lesson: LessonForUnit) => {
    const types = lesson.exercises.map(ex => ex.type);
    
    if (types.includes('vocabulary')) return <BookOpen className="h-5 w-5 text-green-500" />;
    if (types.includes('multiple-choice')) return <MessageCircle className="h-5 w-5 text-blue-500" />;
    return <Award className="h-5 w-5 text-yellow-500" />;
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
            Back to Units
          </Button>
          <div className="text-center pt-8">
            <CardTitle className="text-2xl font-bold">{unit.title}</CardTitle>
            <p className="text-muted-foreground mt-2">{unit.description}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm font-medium flex items-center">
                <Award className="h-4 w-4 text-yellow-500 mr-1" />
                {unit.xpPoints} XP
              </span>
              <span className="text-sm font-medium">
                {unit.lessons.length} Lessons
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Unit Vocabulary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {unit.vocabulary.slice(0, 6).map((word, index) => (
                <div key={index} className="text-sm bg-slate-50 p-2 rounded-md border border-slate-200">
                  {word}
                </div>
              ))}
              {unit.vocabulary.length > 6 && (
                <div className="text-sm bg-slate-50 p-2 rounded-md border border-slate-200 flex items-center justify-center">
                  +{unit.vocabulary.length - 6} more words
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lessons Pathway</h3>
            
            <div className="space-y-4">
              {unit.lessons.map((lesson, index) => (
                <div 
                  key={lesson.id} 
                  className="relative flex items-center bg-white rounded-lg border border-gray-200 p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    {getLessonIcon(lesson)}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-medium">Lesson {index + 1}: {lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="text-xs flex items-center text-yellow-600">
                        <Award className="h-3 w-3 mr-1" />
                        {lesson.xpReward} XP
                      </span>
                      <span className="text-xs flex items-center text-blue-600">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {lesson.exercises.length} exercises
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => onStartLesson(index)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitPathwayView;
