
import React from "react";
import CertificateScoreCard from "./CertificateScoreCard";
import { CertificationAttempt } from "@/types/supabase";

interface ScoreCardsProps {
  highestScores: Record<string, CertificationAttempt> | undefined;
}

const ScoreCards = ({ highestScores }: ScoreCardsProps) => {
  // Include reading, writing, speaking, listening, conversation skill types
  const skillTypes = ['reading', 'writing', 'speaking', 'listening', 'conversation'];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
