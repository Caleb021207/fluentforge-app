
import { Award, Puzzle } from "lucide-react";

interface ChallengeListProps {
  challenges: string[];
}

const ChallengeList = ({ challenges }: ChallengeListProps) => {
  return (
    <div className="space-y-2">
      {challenges.map((challenge, idx) => (
        <div key={idx} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-green-500" />
            <span className="text-gray-700">{challenge}</span>
          </div>
          <span className="text-yellow-600 font-medium text-xs">XP</span>
        </div>
      ))}
    </div>
  );
};

export default ChallengeList;
