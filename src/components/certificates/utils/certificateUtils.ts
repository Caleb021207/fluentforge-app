
import { CertificationAttempt } from "@/types/supabase";
import { ensureValidScore, determineLevel } from "@/components/certifications/utils/scoreUtils";

/**
 * Normalizes certification attempts to filter out invalid ones
 */
export const normalizeAttempts = (rawAttempts: CertificationAttempt[] | undefined) => {
  if (!rawAttempts) return [];
  
  const validAttempts = rawAttempts.filter(attempt => {
    // For fluency tests, consider them complete if they have a score > 0
    if (attempt.certification_type === 'fluency' || attempt.certification_type === 'conversation') {
      return attempt.score > 0;
    }
    // For other tests, require completed_at and score > 0
    return attempt.completed_at != null && attempt.score > 0;
  });
  
  return validAttempts;
};

/**
 * Calculates the highest scores for each certification type
 */
export const calculateHighestScores = (normalizedAttempts: CertificationAttempt[]) => {
  return normalizedAttempts.reduce((acc, attempt) => {
    const type = attempt.certification_type;
    const currentScore = ensureValidScore(attempt.score);
    
    if (!acc[type] || currentScore > ensureValidScore(acc[type].score)) {
      acc[type] = attempt;
    }
    return acc;
  }, {} as Record<string, CertificationAttempt>);
};

/**
 * Calculates the composite score based on the highest scores in each category
 */
export const calculateCompositeScore = (highestScores: Record<string, CertificationAttempt>) => {
  if (!highestScores) return null;

  const scoreTypes = ['reading', 'writing', 'speaking', 'listening'];
  const scores = scoreTypes.map(type => {
    const score = highestScores[type]?.score;
    return typeof score === 'number' ? score : 0;
  });
  
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

  return {
    score: averageScore,
    level: determineLevel(averageScore)
  };
};

/**
 * Checks if a certification attempt has a transcript
 */
export const checkForTranscript = async (attempt: CertificationAttempt, supabase: any) => {
  if (attempt.certification_type === 'speaking' || 
      attempt.certification_type === 'listening' || 
      attempt.certification_type === 'fluency') {
    try {
      const { data, error } = await supabase
        .from('certification_transcripts')
        .select('id')
        .eq('attempt_id', attempt.id)
        .maybeSingle();
        
      if (error) {
        if (!error.message.includes("permission denied for table users")) {
          console.error("Error checking transcript for attempt", attempt.id, error);
        }
      }
      
      return !!data;
    } catch (err) {
      console.error("Error in checkForTranscript for attempt", attempt.id, err);
      return false;
    }
  }
  return false;
};

/**
 * Fetch all transcripts for a set of certification attempts
 */
export const fetchTranscripts = async (attempts: CertificationAttempt[] | undefined, supabase: any) => {
  if (!attempts || attempts.length === 0) return {};
  
  const transcriptMap: Record<string, boolean> = {};
  
  for (const attempt of attempts) {
    transcriptMap[attempt.id] = await checkForTranscript(attempt, supabase);
  }
  
  console.log("Transcript map:", transcriptMap);
  return transcriptMap;
};
