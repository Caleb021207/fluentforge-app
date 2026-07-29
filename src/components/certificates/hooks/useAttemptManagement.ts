
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createCertificationAttempts, completeCertificationAttempts } from "@/utils/serverWrites";

export const useAttemptManagement = () => {
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const createAttempts = async (_userId: string) => {
    // Attempts are created server-side; the user is derived from the JWT so a
    // student cannot create an attempt for someone else.
    const attempts = await createCertificationAttempts([
      { certification_type: 'speaking', score: 0, level: 'A1' },
      { certification_type: 'listening', score: 0, level: 'A1' },
    ]);
    if (!attempts || attempts.length < 2) return null;

    const speaking = attempts.find((a: any) => a.certification_type === 'speaking');
    const listening = attempts.find((a: any) => a.certification_type === 'listening');
    if (!speaking || !listening) return null;

    setAttemptId(speaking.id);
    return { speakingAttemptId: speaking.id, listeningAttemptId: listening.id };
  };

  const updateAttempts = async (
    speakingAttemptId: string,
    listeningAttemptId: string,
    speakingScore: number,
    listeningScore: number,
    speakingLevel: string,
    listeningLevel: string
  ) => {
    try {
      // Scores are written by a service-role function that re-checks ownership.
      const result = await completeCertificationAttempts([
        { id: speakingAttemptId, score: speakingScore, level: speakingLevel },
        { id: listeningAttemptId, score: listeningScore, level: listeningLevel },
      ]);
      return !!result;
    } catch (error) {
      console.error("Error updating attempts:", error);
      return false;
    }
  };

  return {
    attemptId,
    createAttempts,
    updateAttempts
  };
};
