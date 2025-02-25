
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
    <div className="mx-auto" style={{ maxWidth: "33%" }}>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={{
              ...lesson,
              icon: lesson.icon as JSX.Element
            }}
            onStart={() => onStartLesson(lesson.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonGrid;
