
import React from "react";
import { Lesson } from "./types";
import LessonCard from "./LessonCard";

interface LessonsListProps {
  lessons: Lesson[];
  onSelectLesson: (lessonId: number) => void;
  isLoading: boolean;
}

const LessonsList: React.FC<LessonsListProps> = ({ 
  lessons, 
  onSelectLesson, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-4xl mx-auto">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onStart={() => onSelectLesson(lesson.id)}
        />
      ))}
    </div>
  );
};

export default LessonsList;
