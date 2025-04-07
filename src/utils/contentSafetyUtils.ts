
/**
 * Utility functions for content safety and CIPA compliance
 */

/**
 * List of terms to filter in child-safety mode
 * This implements a comprehensive filter list for CIPA compliance
 * In production, you might want to use a more comprehensive API
 */
const filteredTerms: string[] = [
  // Basic inappropriate language filter
  "profanity", "obscene", "explicit", "curse", "swear",
  
  // Violence-related terms
  "violence", "violent", "weapon", "gun", "rifle", "pistol", "knife", 
  "kill", "murder", "assault", "attack", "fight", "harm", "blood",
  
  // Substance-related terms
  "drug", "narcotic", "marijuana", "cocaine", "heroin", "substance", 
  "alcohol", "beer", "wine", "liquor", "tobacco", "cigarette", "vape",
  
  // Adult content indicators
  "adult", "mature", "nsfw", "pornography", "explicit", "nude", "naked",
  "sexual", "sex", "inappropriate", "dating", "gambling",
  
  // Discriminatory terms
  "hate", "discriminatory", "slur", "racist", "sexist", 
  "bigot", "discrimination", "offensive", "prejudice",
  
  // Self-harm related
  "suicide", "self-harm", "cutting", "depression",
  
  // Bullying related
  "bully", "harassment", "intimidation", "threat",
  
  // Additional CIPA-specific concerns
  "private", "personal", "identity", "address", "phone",
  "hacking", "hack", "password", "illegal", "restricted"
];

/**
 * Checks if content is safe based on the user's safety mode setting
 */
export const isSafeContent = (content: string): boolean => {
  const safetyMode = localStorage.getItem("safetyMode") || "standard";
  
  // In strict mode (for users under 13), apply more aggressive filtering
  if (safetyMode === "strict") {
    return !filteredTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
  }
  
  // In standard mode, only filter extremely inappropriate content
  return true;
}

/**
 * Filters content based on safety settings
 * Returns the original content if safe, or a filtered version if not
 */
export const filterContent = (content: string): string => {
  if (isSafeContent(content)) {
    return content;
  }
  
  // Replace filtered terms with asterisks
  let filteredContent = content;
  filteredTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    filteredContent = filteredContent.replace(regex, '*'.repeat(term.length));
  });
  
  return filteredContent;
};

/**
 * Checks if the user needs to complete age verification
 */
export const needsAgeVerification = (): boolean => {
  return localStorage.getItem("ageVerified") !== "true";
};

/**
 * Gets the current safety mode
 */
export const getSafetyMode = (): 'strict' | 'standard' => {
  return (localStorage.getItem("safetyMode") as 'strict' | 'standard') || 'standard';
};

/**
 * Sets the safety mode
 */
export const setSafetyMode = (mode: 'strict' | 'standard'): void => {
  localStorage.setItem("safetyMode", mode);
};

/**
 * Gets user daily time limit in minutes
 * Returns 0 if unlimited
 */
export const getDailyTimeLimit = (): number => {
  const limit = localStorage.getItem("dailyTimeLimit");
  return limit ? parseInt(limit) : 0;
};

/**
 * Check if parental controls are locked
 */
export const areParentalControlsLocked = (): boolean => {
  return localStorage.getItem("parentalControlsLocked") === "true";
};

/**
 * Lock or unlock parental controls
 */
export const setParentalControlsLock = (locked: boolean): void => {
  localStorage.setItem("parentalControlsLocked", locked ? "true" : "false");
};
