// Level system calculations for gamification

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
}

/**
 * Calculate XP required for a specific level
 * Formula: 100 * level^1.5 (exponential growth)
 */
export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
};

/**
 * Calculate current level from total XP
 */
export const calculateLevelFromXP = (xp: number): number => {
  let level = 1;
  while (getXPForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
};

/**
 * Get complete level information from total XP
 */
export const getLevelInfo = (totalXP: number): LevelInfo => {
  const level = calculateLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpToNextLevel: xpForNextLevel - totalXP,
    progressPercent: Math.min(progressPercent, 100),
  };
};

/**
 * Get XP reward based on activity type and difficulty
 */
export const getXPReward = (
  activityType: 'lesson' | 'certification' | 'voice' | 'streak' | 'quest' | 
                'text_message' | 'voice_message' | 'pronunciation' | 
                'conversation_analysis' | 'exam_analysis' | 'premium_voice' | 'realtime_ai',
  metadata?: { 
    score?: number; 
    difficulty?: string; 
    minutes?: number;
    complexity?: number;
    grammarAccuracy?: number;
    examScore?: number;
    certificationScores?: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
    };
  }
): number => {
  const baseRewards = {
    lesson: 50,
    certification: 0,          // Changed to 0, will be calculated dynamically
    voice: 30,
    streak: 25,
    quest: 100,
    text_message: 5,           // NEW: 5 XP per text message
    voice_message: 5,          // NEW: 5 XP per voice message
    pronunciation: 0,          // NEW: Dynamic 5-25 based on score
    conversation_analysis: 0,  // NEW: Dynamic based on quality
    exam_analysis: 0,          // NEW: Dynamic up to 250 points
    premium_voice: 17,         // NEW: Same as realtime_ai
    realtime_ai: 17,           // NEW: Per message
  };

  let xp = baseRewards[activityType];

  // Pronunciation Practice XP - 5 to 25 based on score
  if (activityType === 'pronunciation' && metadata?.score !== undefined) {
    // Score is 0-100, award 5-25 XP scaled to score
    xp = Math.max(5, Math.min(25, Math.floor(5 + (metadata.score / 100) * 20)));
  }

  // Conversation Analysis XP - based on complexity and grammar
  if (activityType === 'conversation_analysis' && metadata) {
    const complexityXP = (metadata.complexity || 50) / 2; // 0-50 XP for complexity
    const grammarXP = (metadata.grammarAccuracy || 50) / 2; // 0-50 XP for grammar
    xp = Math.floor(complexityXP + grammarXP); // 0-100 XP total
  }

  // Exam Analysis XP - up to 250 points max
  if (activityType === 'exam_analysis' && metadata?.examScore !== undefined) {
    // Exam scores are typically 0-100
    // Award 2.5x the exam score to reach max 250
    xp = Math.floor(metadata.examScore * 2.5);
  }

  // Certification XP - Special handling for functional/professional fluency
  if (activityType === 'certification' && metadata?.certificationScores) {
    const { reading, writing, speaking, listening } = metadata.certificationScores;
    
    // Check if all scores meet Functional Fluency threshold (≥53%)
    const allMeetFunctional = reading >= 53 && writing >= 53 && speaking >= 53 && listening >= 53;
    
    // Check if all scores meet Professional Fluency threshold (≥73%)
    const allMeetProfessional = reading >= 73 && writing >= 73 && speaking >= 73 && listening >= 73;
    
    if (allMeetProfessional) {
      xp = 1500; // Professional Fluency Certificate
    } else if (allMeetFunctional) {
      xp = 750;  // Functional Fluency Certificate
    } else {
      // Regular certification completion (if they don't meet thresholds)
      xp = 200;
    }
  }

  // Existing bonuses for legacy certifications (if no certificationScores provided)
  if (activityType === 'certification' && metadata?.score && !metadata?.certificationScores) {
    xp = 200; // Base
    if (metadata.score >= 90) xp += 100;
    else if (metadata.score >= 80) xp += 50;
    else if (metadata.score >= 70) xp += 25;
  }

  // Existing lesson difficulty bonuses
  if (activityType === 'lesson' && metadata?.difficulty) {
    if (metadata.difficulty === 'Hard') xp += 25;
    else if (metadata.difficulty === 'Medium') xp += 10;
  }

  // Existing voice duration bonuses
  if (activityType === 'voice' && metadata?.minutes) {
    xp += Math.floor(metadata.minutes / 5) * 10;
  }

  return xp;
};

/**
 * Get level tier name for display
 */
export const getLevelTier = (level: number): string => {
  if (level >= 50) return 'Master';
  if (level >= 30) return 'Expert';
  if (level >= 20) return 'Advanced';
  if (level >= 10) return 'Intermediate';
  return 'Beginner';
};

/**
 * Get level color theme
 */
export const getLevelColor = (level: number): string => {
  if (level >= 50) return 'from-purple-500 to-pink-500';
  if (level >= 30) return 'from-blue-500 to-cyan-500';
  if (level >= 20) return 'from-green-500 to-emerald-500';
  if (level >= 10) return 'from-yellow-500 to-orange-500';
  return 'from-gray-400 to-gray-500';
};
