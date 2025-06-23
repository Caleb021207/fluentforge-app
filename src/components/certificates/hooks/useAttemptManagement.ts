
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAttemptManagement = () => {
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const createAttempts = async (userId: string) => {
    try {
      const { data: speakingAttempt, error: speakingError } = await supabase
        .from('certification_attempts')
        .insert([{
          certification_type: 'speaking',
          score: 0,
          level: 'A1',
          user_id: userId,
        }])
        .select()
        .single();

      if (speakingError) throw speakingError;

      const { data: listeningAttempt, error: listeningError } = await supabase
        .from('certification_attempts')
        .insert([{
          certification_type: 'listening',
          score: 0,
          level: 'A1',
          user_id: userId,
        }])
        .select()
        .single();

      if (listeningError) throw listeningError;

      setAttemptId(speakingAttempt.id);
      return {
        speakingAttemptId: speakingAttempt.id,
        listeningAttemptId: listeningAttempt.id
      };
    } catch (error) {
      console.error("Error creating attempts:", error);
      return null;
    }
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
      const updates = [];
      
      updates.push(supabase
        .from('certification_attempts')
        .update({
          score: speakingScore,
          level: speakingLevel,
          completed_at: new Date().toISOString()
        })
        .eq('id', speakingAttemptId)
      );
      
      updates.push(supabase
        .from('certification_attempts')
        .update({
          score: listeningScore,
          level: listeningLevel,
          completed_at: new Date().toISOString()
        })
        .eq('id', listeningAttemptId)
      );
      
      await Promise.all(updates);
      return true;
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
