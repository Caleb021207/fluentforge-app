
import React, { useEffect } from "react";
import CertificateScoreCard from "./CertificateScoreCard";
import { CertificationAttempt } from "@/types/supabase";

interface ScoreCardsProps {
  highestScores: Record<string, CertificationAttempt> | undefined;
}

const ScoreCards = ({ highestScores }: ScoreCardsProps) => {
  // Only include these four skill types - no conversation/fluency
  const skillTypes = ['reading', 'writing', 'speaking', 'listening'];
  
  // Debug log to verify the data is correctly passed
  useEffect(() => {
    console.log("ScoreCards received highestScores:", highestScores);
  }, [highestScores]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
