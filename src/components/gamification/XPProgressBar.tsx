import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { getLevelInfo, getLevelColor } from "@/utils/levelSystem";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface XPProgressBarProps {
  totalXP: number;
  showDetails?: boolean;
}

const XPProgressBar = ({ totalXP, showDetails = false }: XPProgressBarProps) => {
  const levelInfo = getLevelInfo(totalXP);
  const colorGradient = getLevelColor(levelInfo.level);

  return (
    <div className="flex items-center gap-3">
      <motion.div 
        className={cn("flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br flex-shrink-0", colorGradient)}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <Star className="w-5 h-5 text-white" />
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold">Level {levelInfo.level}</span>
          {showDetails && (
            <span className="text-xs text-muted-foreground">
              {Math.floor(levelInfo.progressPercent)}% to Level {levelInfo.level + 1}
            </span>
          )}
        </div>
        <Progress 
          value={levelInfo.progressPercent} 
          className="h-2" 
          indicatorClassName="bg-gradient-to-r from-[#A3D5FF] to-[#57D8A1] transition-all duration-500"
        />
        {showDetails && (
          <p className="text-xs text-muted-foreground mt-1">
            {levelInfo.xpToNextLevel} XP to next level
          </p>
        )}
      </div>
    </div>
  );
};

export default XPProgressBar;
