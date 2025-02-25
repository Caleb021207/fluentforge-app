
import { Lesson } from "@/data/lessonData";
import LessonCard from "./LessonCard";

interface LessonGridProps {
  lessons: Lesson[];
  onStartLesson: (id: number) => void;
  isLoading: boolean;
}

const LessonGrid = ({ lessons, onStartLesson, isLoading }: LessonGridProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading lessons...</div>;
  }

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onStart={() => onStartLesson(lesson.id)}
        />
      ))}
    </div>
  );
};

export default LessonGrid;
