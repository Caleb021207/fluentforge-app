
import React from "react";
import CertificateScoreCard from "./CertificateScoreCard";
import { CertificationAttempt } from "@/types/supabase";

interface ScoreCardsProps {
  highestScores: Record<string, CertificationAttempt> | undefined;
}

const ScoreCards = ({ highestScores }: ScoreCardsProps) => {
  // Include reading, writing, and speaking skill types
  const skillTypes = ['reading', 'writing', 'speaking'];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
