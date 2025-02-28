
import React from "react";
import CertificateScoreCard from "./CertificateScoreCard";
import { CertificationAttempt } from "@/types/supabase";

interface ScoreCardsProps {
  highestScores: Record<string, CertificationAttempt> | undefined;
}

const ScoreCards = ({ highestScores }: ScoreCardsProps) => {
  // Only include reading and writing skill types
  const skillTypes = ['reading', 'writing'];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skillTypes.map((type) => (
        <CertificateScoreCard 
          key={type} 
          type={type} 
          attempt={highestScores?.[type]} 
        />
      ))}
    </div>
  );
};

export default ScoreCards;
