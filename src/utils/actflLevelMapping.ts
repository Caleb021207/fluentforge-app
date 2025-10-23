// Utility functions for ACTFL level mapping and scoring

export const ACTFL_LEVELS = [
  'Novice Low',
  'Novice Mid', 
  'Novice High',
  'Intermediate Low',
  'Intermediate Mid',
  'Intermediate High',
  'Advanced Low',
  'Advanced Mid',
  'Advanced High',
  'Superior',
  'Distinguished'
];

// Convert percentage score to ACTFL level
export const getACTFLLevelFromScore = (score: number): string => {
  if (score <= 10) return 'Novice Low';
  if (score <= 25) return 'Novice Mid';
  if (score <= 35) return 'Novice High';
  if (score <= 45) return 'Intermediate Low';
  if (score <= 55) return 'Intermediate Mid';
  if (score <= 65) return 'Intermediate High';
  if (score <= 70) return 'Advanced Low';
  if (score <= 80) return 'Advanced Mid';
  if (score <= 90) return 'Advanced High';
  if (score <= 95) return 'Superior';
  return 'Distinguished';
};

// Get badge variant for ACTFL level
export const getACTFLBadgeVariant = (level: string) => {
  if (level.startsWith('Novice')) return 'outline';
  if (level.startsWith('Intermediate')) return 'default';
  if (level.startsWith('Advanced')) return 'secondary';
  return 'secondary'; // Superior/Distinguished
};

// Legacy CEFR to ACTFL mapping for backwards compatibility
export const CEFR_TO_ACTFL_MAP: Record<string, string> = {
  'A1': 'Novice Low',
  'A2': 'Novice High',
  'B1': 'Intermediate Mid',
  'B2': 'Intermediate High',
  'C1': 'Advanced Mid',
  'C2': 'Superior'
};

// Convert CEFR level to ACTFL (for migration)
export const convertCEFRToACTFL = (cefrLevel: string): string => {
  return CEFR_TO_ACTFL_MAP[cefrLevel] || cefrLevel;
};
