
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
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Challenges:</h4>
      <div className="space-y-2">
        {challenges.map((challenge, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {challenge.unlocked ? (
                <Puzzle className="h-4 w-4 text-green-500" />
              ) : (
                <Award className="h-4 w-4 text-gray-400" />
              )}
              <span className={challenge.unlocked ? "text-gray-700" : "text-gray-400"}>
                {challenge.description}
              </span>
            </div>
            <span className="text-yellow-600 font-medium">+{challenge.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeList;
