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
  activityType: 'lesson' | 'certification' | 'voice' | 'streak' | 'quest',
  metadata?: { score?: number; difficulty?: string; minutes?: number }
): number => {
  const baseRewards = {
    lesson: 50,
    certification: 200,
    voice: 30,
    streak: 25,
    quest: 100,
  };

  let xp = baseRewards[activityType];

  // Bonus XP for certifications based on score
  if (activityType === 'certification' && metadata?.score) {
    if (metadata.score >= 90) xp += 100;
    else if (metadata.score >= 80) xp += 50;
    else if (metadata.score >= 70) xp += 25;
  }

  // Bonus XP for lesson difficulty
  if (activityType === 'lesson' && metadata?.difficulty) {
    if (metadata.difficulty === 'Hard') xp += 25;
    else if (metadata.difficulty === 'Medium') xp += 10;
  }

  // Bonus XP for longer voice sessions
  if (activityType === 'voice' && metadata?.minutes) {
    xp += Math.floor(metadata.minutes / 5) * 10; // 10 XP per 5 minutes
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
