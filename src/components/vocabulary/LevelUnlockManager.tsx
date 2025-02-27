
import { useState, useEffect } from "react";
import { isLevelUnlocked } from "@/components/vocabulary/utils/levelUnlockUtils";

interface LevelUnlockManagerProps {
  userId?: string;
  onLevelsLoaded: (unlockedLevels: Record<string, boolean>) => void;
}

const LevelUnlockManager = ({ userId, onLevelsLoaded }: LevelUnlockManagerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkUnlockedLevels = async () => {
      const levels = ["A1", "A2", "B1", "B2", "C1-C2", "Grammar"];
      const unlocked: Record<string, boolean> = {};
      
      // A1 is ALWAYS unlocked, set it first
      unlocked["A1"] = true;
      unlocked["Grammar"] = true;
      
      for (const lvl of levels) {
        // A1 and Grammar are always unlocked, skip the check
        if (lvl === "A1" || lvl === "Grammar") {
          continue;
        }
        unlocked[lvl] = await isLevelUnlocked(lvl, userId);
      }
      
      onLevelsLoaded(unlocked);
      setIsLoading(false);
    };
    
    checkUnlockedLevels();
  }, [userId, onLevelsLoaded]);
  
  return null; // This is a logical component with no UI
};

export default LevelUnlockManager;
