
import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const LevelSelector = ({ currentLevel, onLevelChange }: LevelSelectorProps) => {
  return (
    <div className="flex space-x-4 my-4">
      <Button
        variant={currentLevel === "A1" ? "default" : "outline"}
        onClick={() => onLevelChange("A1")}
      >
        Beginner (A1-A2)
      </Button>
      <Button
        variant={currentLevel === "B1" ? "default" : "outline"}
        onClick={() => onLevelChange("B1")}
      >
        Intermediate (B1-B2)
      </Button>
      <Button
        variant={currentLevel === "C1" ? "default" : "outline"}
        onClick={() => onLevelChange("C1")}
      >
        Advanced (C1-C2)
      </Button>
    </div>
  );
};

export default LevelSelector;
