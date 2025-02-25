
import LevelSelector from "./LevelSelector";

interface LessonHeaderProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const LessonHeader = ({ currentLevel, onLevelChange }: LessonHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Spanish Lessons</h1>
      <LevelSelector currentLevel={currentLevel} onLevelChange={onLevelChange} />
    </div>
  );
};

export default LessonHeader;
