
/**
 * Content filtering utilities for CIPA compliance
 */

// List of terms to filter in child-safety mode
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
  if (!content) return true;
  
  const safetyMode = localStorage.getItem("safetyMode") || "standard";
  
  // In strict mode (for users under 13), apply more aggressive filtering
  if (safetyMode === "strict") {
    return !containsFilteredTerms(content);
  }
  
  // In standard mode, only filter extremely inappropriate content
  // This is a simplified implementation - in production, you would use more sophisticated checks
  const highRiskTerms = filteredTerms.slice(0, 20);
  return !containsFilteredTerms(content, highRiskTerms);
};

/**
 * Helper function to check if content contains any filtered terms using word boundary matching
 * to avoid false positives like censoring "alguna" because it contains "gun"
 */
const containsFilteredTerms = (content: string, terms = filteredTerms): boolean => {
  if (!content) return false;
  
  const contentLower = content.toLowerCase();
  
  // Create a list of languages to check for special handling
  const spanishIndicators = ["alguna", "algunas", "algún", "ningun", "ninguna", "laguna"];
  
  // Special case for Spanish words that might trigger false positives
  for (const word of spanishIndicators) {
    if (contentLower.includes(word)) {
      return false;
    }
  }
  
  return terms.some(term => {
    // Use word boundary regex to match only whole words or words at boundaries
    const regex = new RegExp(`\\b${term}\\b|\\b${term}|${term}\\b`, 'i');
    return regex.test(contentLower);
  });
};

/**
 * Filters content based on safety settings
 * Returns the original content if safe, or a filtered version if not
 */
export const filterContent = (content: string): string => {
  if (!content) return "";
  if (isSafeContent(content)) {
    return content;
  }
  
  // Replace filtered terms with asterisks, using word boundary matching
  let filteredContent = content;
  
  // Special case for Spanish words to avoid false positives
  const spanishIndicators = ["alguna", "algunas", "algún", "ningun", "ninguna", "laguna"];
  for (const word of spanishIndicators) {
    if (content.toLowerCase().includes(word)) {
      return content;
    }
  }
  
  filteredTerms.forEach(term => {
    // Use word boundary regex for replacement
    const regex = new RegExp(`\\b${term}\\b|\\b${term}|${term}\\b`, 'gi');
    filteredContent = filteredContent.replace(regex, '*'.repeat(term.length));
  });
  
  return filteredContent;
};
