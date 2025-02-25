
import { Award, Puzzle } from "lucide-react";

interface Challenge {
  type: string;
  description: string;
  xpReward: number;
  timeLimit?: number;
  unlocked: boolean;
}

const ChallengeList = ({ challenges }: { challenges: Challenge[] }) => {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-gray-700">Challenges:</h4>
      <div className="space-y-1">
        {challenges.map((challenge, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {challenge.unlocked ? (
                <Puzzle className="h-3 w-3 text-green-500" />
              ) : (
                <Award className="h-3 w-3 text-gray-400" />
              )}
              <span className={`truncate ${challenge.unlocked ? "text-gray-700" : "text-gray-400"}`}>
                {challenge.description}
              </span>
            </div>
            <span className="text-yellow-600 font-medium shrink-0">+{challenge.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeList;
