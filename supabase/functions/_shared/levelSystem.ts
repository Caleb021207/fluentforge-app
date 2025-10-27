export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  progressPercentage: number;
}

export const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export const calculateLevelFromXP = (xp: number): number => {
  let level = 1;
  while (getXPForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
};

export const getLevelInfo = (totalXP: number): LevelInfo => {
  const level = calculateLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const currentXP = totalXP - xpForCurrentLevel;
  const xpProgress = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (currentXP / xpProgress) * 100;

  return {
    level,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    progressPercentage,
  };
};

export const getXPReward = (
  activityType: string,
  metadata?: {
    score?: number;
    difficulty?: string;
    minutes?: number;
    complexity?: number;
    grammarAccuracy?: number;
    examScore?: number;
    messageLength?: number;
    vocabularyRichness?: number;
    certificationScores?: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
    };
  }
): number => {
  let baseXP = 0;

  switch (activityType) {
    case 'lesson':
      baseXP = 50;
      if (metadata?.score) {
        baseXP += Math.floor(metadata.score * 0.5);
      }
      break;

    case 'certification':
      baseXP = 200;
      if (metadata?.certificationScores) {
        const avgScore =
          (metadata.certificationScores.reading +
            metadata.certificationScores.writing +
            metadata.certificationScores.speaking +
            metadata.certificationScores.listening) /
          4;
        baseXP += Math.floor(avgScore * 2);
      }
      break;

    case 'voice':
      baseXP = 30;
      if (metadata?.minutes) {
        baseXP += Math.floor(metadata.minutes * 10);
      }
      break;

    case 'voice_message':
      baseXP = 10;
      if (metadata?.messageLength) {
        baseXP += Math.min(Math.floor(metadata.messageLength / 10), 15);
      }
      break;

    case 'text_message':
      baseXP = 5;
      if (metadata?.messageLength && metadata?.grammarAccuracy) {
        const lengthBonus = Math.min(Math.floor(metadata.messageLength / 20), 5);
        const grammarBonus = Math.floor((metadata.grammarAccuracy / 100) * 5);
        baseXP += lengthBonus + grammarBonus;
      }
      break;

    case 'pronunciation':
      baseXP = 20;
      if (metadata?.score) {
        baseXP += Math.floor(metadata.score * 0.3);
      }
      break;

    case 'conversation_analysis':
      baseXP = 50;
      if (metadata?.grammarAccuracy && metadata?.complexity) {
        const grammarBonus = Math.floor((metadata.grammarAccuracy / 100) * 30);
        const complexityBonus = Math.floor((metadata.complexity / 100) * 40);
        baseXP += grammarBonus + complexityBonus;
      }
      break;

    case 'exam_analysis':
      baseXP = 100;
      if (metadata?.examScore) {
        baseXP += Math.floor(metadata.examScore * 1.5);
      }
      break;

    case 'streak':
      baseXP = 10;
      break;

    case 'quest':
      baseXP = 75;
      break;

    case 'premium_voice':
      baseXP = 40;
      if (metadata?.minutes) {
        baseXP += Math.floor(metadata.minutes * 12);
      }
      break;

    case 'realtime_ai':
      baseXP = 45;
      if (metadata?.minutes) {
        baseXP += Math.floor(metadata.minutes * 15);
      }
      break;

    default:
      baseXP = 10;
  }

  // Apply difficulty multiplier
  if (metadata?.difficulty) {
    switch (metadata.difficulty.toLowerCase()) {
      case 'easy':
      case 'basic':
        baseXP = Math.floor(baseXP * 0.8);
        break;
      case 'hard':
      case 'advanced':
        baseXP = Math.floor(baseXP * 1.5);
        break;
      case 'medium':
      case 'intermediate':
      default:
        baseXP = Math.floor(baseXP * 1.0);
    }
  }

  return Math.max(1, baseXP);
};

export const getLevelTier = (level: number): string => {
  if (level < 5) return 'Beginner';
  if (level < 10) return 'Elementary';
  if (level < 20) return 'Intermediate';
  if (level < 30) return 'Advanced';
  if (level < 40) return 'Expert';
  if (level < 50) return 'Master';
  return 'Grandmaster';
};

export const getLevelColor = (level: number): string => {
  if (level < 5) return 'from-gray-400 to-gray-600';
  if (level < 10) return 'from-green-400 to-green-600';
  if (level < 20) return 'from-blue-400 to-blue-600';
  if (level < 30) return 'from-purple-400 to-purple-600';
  if (level < 40) return 'from-yellow-400 to-yellow-600';
  if (level < 50) return 'from-red-400 to-red-600';
  return 'from-pink-400 to-pink-600';
};
