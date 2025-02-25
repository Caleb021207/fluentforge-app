
import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const LevelSelector = ({ currentLevel, onLevelChange }: LevelSelectorProps) => {
  return (
    <div className="flex space-x-4 my-4">
      <Button
        variant={currentLevel === "beginner" ? "default" : "outline"}
        onClick={() => onLevelChange("beginner")}
      >
        Beginner (A1-A2)
      </Button>
      <Button
        variant={currentLevel === "intermediate" ? "default" : "outline"}
        onClick={() => onLevelChange("intermediate")}
      >
        Intermediate (B1-B2)
      </Button>
      <Button
        variant={currentLevel === "advanced" ? "default" : "outline"}
        onClick={() => onLevelChange("advanced")}
      >
        Advanced (C1-C2)
      </Button>
    </div>
  );
};

export default LevelSelector;
