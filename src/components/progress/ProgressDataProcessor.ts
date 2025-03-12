
import { CertificationAttempt } from "@/types/supabase";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";

export interface ChartData {
  date: string;
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
}

export const processAttemptsByDate = (attempts: CertificationAttempt[] | null): ChartData[] => {
  if (!attempts || attempts.length === 0) return [];

  console.log("Processing attempts for chart:", attempts);
  
  // Create a map to accumulate scores by date
  const dataMap = new Map<string, ChartData>();
  
  // First, initialize the map with all dates and zero values
  attempts.forEach(attempt => {
    if ((!attempt.completed_at && !attempt.created_at)) {
      return;
    }
    
    const date = new Date(attempt.completed_at || attempt.created_at || '').toISOString().split('T')[0];
    
    if (!dataMap.has(date)) {
      dataMap.set(date, {
        date,
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0
      });
    }
  });
  
  // Sort dates chronologically to ensure proper data continuity
  const sortedDates = Array.from(dataMap.keys()).sort();
  
  // Now process each attempt and update the highest scores
  attempts.forEach(attempt => {
    if ((!attempt.completed_at && !attempt.created_at)) {
      console.log(`Skipping attempt with invalid date:`, attempt);
      return;
    }
    
    // Skip incomplete attempts - updated to handle fluency tests
    const isComplete = attempt.certification_type === "fluency" || attempt.certification_type === "conversation" 
      ? attempt.score > 0  // For fluency, just check score > 0
      : attempt.completed_at !== null && attempt.score > 0; // For others, need completed_at and score
      
    if (!isComplete) {
      console.log(`Skipping incomplete attempt:`, attempt);
      return;
    }
    
    const date = new Date(attempt.completed_at || attempt.created_at || '').toISOString().split('T')[0];
    const existing = dataMap.get(date)!;
    
    const type = attempt.certification_type;
    
    if (type === 'fluency') {
      console.log(`Processing fluency attempt #${attempt.id} with score ${attempt.score}`);
      
      // Update both speaking and listening from fluency test
      const currentSpeakingScore = existing.speaking;
      if (attempt.score > currentSpeakingScore) {
        existing.speaking = attempt.score;
      }
      
      const currentListeningScore = existing.listening;
      if (attempt.score > currentListeningScore) {
        existing.listening = attempt.score;
      }
    } 
    else if (type === 'reading' || type === 'writing' || type === 'speaking' || 
            type === 'listening') {
      console.log(`Processing ${type} attempt #${attempt.id} with score ${attempt.score}`);
      
      // Use type assertion to access properties safely
      const propertyName = type as keyof Omit<ChartData, 'date'>;
      const currentScore = existing[propertyName] as number;
      
      if (attempt.score > currentScore) {
        existing[propertyName] = attempt.score;
      }
    } else {
      console.log(`Ignoring unknown certification type: ${type}`);
    }
    
    dataMap.set(date, existing);
  });
  
  // Now create a continuous data series with carried forward values
  const result: ChartData[] = [];
  let previousData: ChartData | null = null;
  
  for (const date of sortedDates) {
    const currentData = dataMap.get(date)!;
    
    // If we have previous data, carry forward any higher scores
    if (previousData) {
      currentData.reading = Math.max(currentData.reading, previousData.reading);
      currentData.writing = Math.max(currentData.writing, previousData.writing);
      currentData.speaking = Math.max(currentData.speaking, previousData.speaking);
      currentData.listening = Math.max(currentData.listening, previousData.listening);
    }
    
    result.push(currentData);
    previousData = {...currentData}; // Clone to avoid reference issues
  }
  
  console.log("Processed chart data:", result);
  return result;
};

export const generateRecommendations = (attempts: CertificationAttempt[]) => {
  if (!attempts || attempts.length === 0) return [];
  
  console.log("Generating recommendations from attempts:", attempts);
  const skills = ['reading', 'writing', 'speaking', 'listening'];
  const highestScores: Record<string, number> = {};
  
  skills.forEach(skill => {
    // For each skill, find the highest score from direct attempts
    const directAttempts = attempts.filter(a => {
      // For fluency tests, we need to check if they're complete (score > 0)
      if (a.certification_type === skill) {
        return a.score > 0; // Just check if the score is valid
      }
      // For other tests, ensure they have a completed_at and valid score
      return a.certification_type === skill && a.completed_at !== null && a.score > 0;
    });
    
    // For speaking and listening, also check fluency tests which count for both skills
    const fluencyAttempts = (skill === 'speaking' || skill === 'listening') 
      ? attempts.filter(a => a.certification_type === 'fluency' && a.score > 0)
      : [];
    
    const skillAttempts = [...directAttempts, ...fluencyAttempts];
    
    if (skillAttempts.length > 0) {
      highestScores[skill] = Math.max(...skillAttempts.map(a => a.score));
    } else {
      highestScores[skill] = 0;
    }
  });

  console.log("Highest scores for recommendations:", highestScores);
  
  const recommendations = skills.map(skill => {
    const score = highestScores[skill] || 0;
    const level = determineLevel(score);
    const recommendation = getRecommendationsForLevel(skill, level);
    
    if (recommendation) {
      return {
        ...recommendation,
        currentLevel: level,
        lastScore: score
      };
    }
    return null;
  }).filter(Boolean);

  return recommendations;
};

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
