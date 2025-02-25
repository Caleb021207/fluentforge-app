
import { Puzzle } from "lucide-react";

interface ChallengeListProps {
  challenges: string[];
}

const ChallengeList = ({ challenges }: ChallengeListProps) => {
  return (
    <div className="space-y-1.5">
      {challenges.map((challenge, idx) => (
        <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Puzzle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <span className="text-gray-700 line-clamp-1">{challenge}</span>
          </div>
          <span className="text-yellow-600 font-medium text-xs whitespace-nowrap">XP</span>
        </div>
      ))}
    </div>
  );
};

export default ChallengeList;
