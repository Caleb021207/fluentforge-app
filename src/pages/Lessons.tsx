
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Book, BookOpen, BookOpenCheck, Layers, MessageSquare, Mic, Pencil, Play, School, Zap } from 'lucide-react';
import LessonCard from '@/components/lessons/LessonCard';
import LessonView from '@/components/lessons/LessonView';
import ProgressDashboard from '@/components/lessons/ProgressDashboard';
import LevelSelector from '@/components/lessons/LevelSelector';
import { basicUnit, numbersAndColorsUnit, foodAndBeveragesUnit, travelUnit } from '@/data/lessonUnits';

const Lessons = () => {
  const { toast } = useToast();
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [showLessonView, setShowLessonView] = useState(false);
  const [currentCEFRLevel, setCurrentCEFRLevel] = useState<string>("A1");

  const units = [basicUnit, numbersAndColorsUnit, foodAndBeveragesUnit, travelUnit];
  
  // Filter units based on CEFR level
  const filteredUnits = units.filter(unit => unit.cefrLevel === currentCEFRLevel);

  const handleStartLesson = (unitId: number) => {
    setSelectedUnit(unitId);
    setShowLessonView(true);
  };

  const handleCompleteLessons = () => {
    setShowLessonView(false);
    toast({
      title: "Unit Completed!",
      description: "You've completed all lessons in this unit.",
    });
  };

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Spanish Learning Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressDashboard />
          </CardContent>
        </Card>

        <div className="mb-6">
          <LevelSelector 
            currentLevel={currentCEFRLevel} 
            onLevelChange={setCurrentCEFRLevel}
          />
        </div>

        {/* Render lesson units */}
        {filteredUnits.map((unit, index) => (
          <div key={unit.id} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{unit.title}</h2>
            <p className="text-gray-600 mb-6">{unit.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unit.lessons.map((lesson) => (
                <LessonCard 
                  key={lesson.id}
                  lesson={lesson}
                  onStart={(lessonId) => handleStartLesson(unit.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showLessonView && selectedUnit !== null && (
        <LessonView 
          unit={units.find(u => u.id === selectedUnit)!} 
          onClose={() => setShowLessonView(false)}
          onComplete={handleCompleteLessons}
        />
      )}
    </div>
  );
};

export default Lessons;
