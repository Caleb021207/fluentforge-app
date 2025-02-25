
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
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
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
