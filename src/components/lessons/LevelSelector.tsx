
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const LevelSelector = ({ currentLevel, onLevelChange }: LevelSelectorProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="flex flex-col space-y-2 my-4">
      <Button
        variant={currentLevel === "beginner" ? "default" : "outline"}
        onClick={() => onLevelChange("beginner")}
        className="w-full"
      >
        {t("beginner")} (A1-A2)
      </Button>
      <Button
        variant={currentLevel === "intermediate" ? "default" : "outline"}
        onClick={() => onLevelChange("intermediate")}
        className="w-full"
      >
        {t("intermediate")} (B1-B2)
      </Button>
      <Button
        variant={currentLevel === "advanced" ? "default" : "outline"}
        onClick={() => onLevelChange("advanced")}
        className="w-full"
      >
        {t("advanced")} (C1-C2)
      </Button>
    </div>
  );
};

export default LevelSelector;
