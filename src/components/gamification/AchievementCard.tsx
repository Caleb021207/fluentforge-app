import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const AchievementCard = ({
  name,
  description,
  icon,
  xpReward,
  unlocked,
  unlockedAt,
}: AchievementCardProps) => {
  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md",
        unlocked ? "border-primary/50" : "opacity-60 grayscale"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "text-4xl flex-shrink-0",
            !unlocked && "opacity-40"
          )}
        >
          {unlocked ? icon : <Lock className="w-8 h-8" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-1">{name}</h4>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-primary font-medium">+{xpReward} XP</span>
            {unlocked && unlockedAt && (
              <span className="text-muted-foreground">
                • Unlocked {new Date(unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AchievementCard;
