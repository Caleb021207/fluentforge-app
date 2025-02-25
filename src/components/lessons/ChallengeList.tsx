
import { Puzzle } from "lucide-react";

interface ChallengeListProps {
  challenges: string[];
}

const ChallengeList = ({ challenges }: ChallengeListProps) => {
  return (
    <div className="space-y-1">
      {challenges.map((challenge, idx) => (
        <div key={idx} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Puzzle className="h-3 w-3 text-green-500" />
            <span className="text-gray-700 truncate max-w-[180px]">{challenge}</span>
          </div>
          <span className="text-yellow-600 font-medium text-xs">XP</span>
        </div>
      ))}
    </div>
  );
};

export default ChallengeList;
