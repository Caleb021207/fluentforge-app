
import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const LevelSelector = ({ currentLevel, onLevelChange }: LevelSelectorProps) => {
  return (
    <div className="flex flex-col space-y-2 my-4">
      <Button
        variant={currentLevel === "beginner" ? "default" : "outline"}
        onClick={() => onLevelChange("beginner")}
        className="w-full"
      >
        Beginner (A1-A2)
      </Button>
      <Button
        variant={currentLevel === "intermediate" ? "default" : "outline"}
        onClick={() => onLevelChange("intermediate")}
        className="w-full"
      >
        Intermediate (B1-B2)
      </Button>
      <Button
        variant={currentLevel === "advanced" ? "default" : "outline"}
        onClick={() => onLevelChange("advanced")}
        className="w-full"
      >
        Advanced (C1-C2)
      </Button>
    </div>
  );
};

export default LevelSelector;

