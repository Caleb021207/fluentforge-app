
/**
 * Utility functions for content safety and CIPA compliance
 */

/**
 * List of terms to filter in child-safety mode
 * This is a basic implementation - in production, you would want a more comprehensive list
 * and possibly use an external API for content moderation
 */
const filteredTerms: string[] = [
  // Basic set of inappropriate terms to filter
  // In a real implementation, this would be much more comprehensive
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
