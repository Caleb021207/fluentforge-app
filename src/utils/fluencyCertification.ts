/**
 * Fluency Certification Utilities
 * 
 * Functional Fluency = ACTFL Intermediate Mid = B1 = 66-75%
 * Professional Fluency = ACTFL Advanced Low = B2 = 76-85%
 */

export type FluencyCertLevel = 'functional' | 'professional' | null;

export interface FluencyCertStatus {
  hasFunctional: boolean;
  hasProfessional: boolean;
  level: FluencyCertLevel;
}

/**
 * Convert CEFR level to fluency cert level
 */
export const cefrToFluencyCert = (cefrLevel: string): FluencyCertLevel => {
  const level = cefrLevel?.toUpperCase();
  
  if (level === 'C1' || level === 'C2') {
    return 'professional';
  }
  
  if (level === 'B2') {
    return 'professional';
  }
  
  if (level === 'B1') {
    return 'functional';
  }
  
  return null;
};

/**
 * Convert overall score to fluency cert level
 */
export const scoreToFluencyCert = (score: number): FluencyCertLevel => {
  if (score >= 76) {
    return 'professional';
  }
  
  if (score >= 66) {
    return 'functional';
  }
  
  return null;
};

/**
 * Check if analysis meets cert threshold
 */
export const checkCertAchievement = (
  cefrLevel: string | null, 
  overallScore: number | null
): FluencyCertLevel => {
  // Prioritize CEFR level if available
  if (cefrLevel) {
    const certFromCefr = cefrToFluencyCert(cefrLevel);
    if (certFromCefr) return certFromCefr;
  }
  
  // Fallback to score
  if (overallScore !== null && overallScore !== undefined) {
    return scoreToFluencyCert(overallScore);
  }
  
  return null;
};

/**
 * Get fluency cert status from analyses history (DEPRECATED - use getCurrentFluencyCertStatus)
 */
export const getFluencyCertStatus = (
  analyses: Array<{ cefr_level: string | null; overall_score: number | null }> | undefined
): FluencyCertStatus => {
  if (!analyses || analyses.length === 0) {
    return {
      hasFunctional: false,
      hasProfessional: false,
      level: null,
    };
  }
  
  let hasFunctional = false;
  let hasProfessional = false;
  
  for (const analysis of analyses) {
    const cert = checkCertAchievement(analysis.cefr_level, analysis.overall_score);
    
    if (cert === 'professional') {
      hasProfessional = true;
      hasFunctional = true; // Professional implies functional
    } else if (cert === 'functional') {
      hasFunctional = true;
    }
  }
  
  // Return highest level achieved
  const level: FluencyCertLevel = hasProfessional 
    ? 'professional' 
    : hasFunctional 
    ? 'functional' 
    : null;
  
  return {
    hasFunctional,
    hasProfessional,
    level,
  };
};

/**
 * Get fluency cert status based on CURRENT level (latest analysis only)
 */
export const getCurrentFluencyCertStatus = (
  analyses: Array<{ cefr_level: string | null; overall_score: number | null }> | undefined
): FluencyCertStatus => {
  if (!analyses || analyses.length === 0) {
    return {
      hasFunctional: false,
      hasProfessional: false,
      level: null,
    };
  }
  
  // Only check the most recent analysis (assumes array is sorted by date desc)
  const latestAnalysis = analyses[0];
  const level = checkCertAchievement(latestAnalysis.cefr_level, latestAnalysis.overall_score);
  
  return {
    hasFunctional: level === 'functional' || level === 'professional',
    hasProfessional: level === 'professional',
    level,
  };
};

/**
 * Get cert display name
 */
export const getCertDisplayName = (level: FluencyCertLevel): string => {
  if (level === 'professional') return 'Professionally Fluent';
  if (level === 'functional') return 'Functionally Fluent';
  return 'Not Yet Certified';
};

/**
 * Get cert display description
 */
export const getCertDisplayDescription = (level: FluencyCertLevel): string => {
  if (level === 'professional') return 'ACTFL Advanced Low (B2)';
  if (level === 'functional') return 'ACTFL Intermediate Mid (B1)';
  return 'Keep practicing to reach certification!';
};
