
/**
 * Utility functions for content safety and CIPA/FERPA compliance
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
  if (!content) return true;
  
  const safetyMode = localStorage.getItem("safetyMode") || "standard";
  
  // In strict mode (for users under 13), apply more aggressive filtering
  if (safetyMode === "strict") {
    return !filteredTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
  }
  
  // In standard mode, only filter extremely inappropriate content
  // This is a simplified implementation - in production, you would use more sophisticated checks
  const highRiskTerms = filteredTerms.slice(0, 20);
  return !highRiskTerms.some(term => 
    content.toLowerCase().includes(term.toLowerCase())
  );
}

/**
 * Filters content based on safety settings
 * Returns the original content if safe, or a filtered version if not
 */
export const filterContent = (content: string): string => {
  if (!content) return "";
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

/**
 * FERPA Compliance Functions
 */

// List of educational data categories protected by FERPA
export const ferpaProtectedDataTypes = [
  "grades", 
  "assessments", 
  "attendance", 
  "disciplinary_records", 
  "health_records",
  "contact_information", 
  "family_information"
];

/**
 * Checks if a specific data type is protected under FERPA
 */
export const isFerpaProtectedData = (dataType: string): boolean => {
  return ferpaProtectedDataTypes.includes(dataType.toLowerCase());
};

/**
 * Gets the FERPA consent status for a user
 * Returns true if the user has provided FERPA consent
 */
export const getFerpaConsentStatus = (): boolean => {
  return localStorage.getItem("ferpaConsent") === "true";
};

/**
 * Sets the FERPA consent status for a user
 */
export const setFerpaConsentStatus = (hasConsent: boolean): void => {
  localStorage.setItem("ferpaConsent", hasConsent ? "true" : "false");
};

/**
 * Gets the parental consent status for data sharing
 * Used for users under 18 years of age
 */
export const getParentalDataConsentStatus = (): boolean => {
  return localStorage.getItem("parentalDataConsent") === "true";
};

/**
 * Sets the parental consent status for data sharing
 */
export const setParentalDataConsentStatus = (hasConsent: boolean): void => {
  localStorage.setItem("parentalDataConsent", hasConsent ? "true" : "false");
};

/**
 * Gets the user's FERPA directory information sharing preferences
 * Returns an object with boolean values for each directory information category
 */
export const getFerpaDirectoryPreferences = (): Record<string, boolean> => {
  const savedPrefs = localStorage.getItem("ferpaDirectoryPreferences");
  if (!savedPrefs) {
    // Default all to false (opt-out)
    return {
      name: false,
      email: false,
      language: false,
      progress: false,
      achievements: false
    };
  }
  
  try {
    return JSON.parse(savedPrefs);
  } catch (e) {
    console.error("Error parsing FERPA directory preferences:", e);
    return {
      name: false,
      email: false,
      language: false,
      progress: false,
      achievements: false
    };
  }
};

/**
 * Sets the user's FERPA directory information sharing preferences
 */
export const setFerpaDirectoryPreferences = (preferences: Record<string, boolean>): void => {
  localStorage.setItem("ferpaDirectoryPreferences", JSON.stringify(preferences));
};

/**
 * Logs a data access attempt for FERPA compliance auditing
 * In a real implementation, this would write to a secure database
 */
export const logDataAccess = (userId: string, dataType: string, accessedBy: string, purpose: string): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    userId,
    dataType,
    accessedBy,
    purpose,
    timestamp
  };
  
  // For now, just log to console, but in production this would write to a secure audit log
  console.log("FERPA Data Access Log:", logEntry);
  
  // In production: call an API to store this securely
  // supabase.from('ferpa_access_logs').insert(logEntry);
};

/**
 * Checks if user is allowed to access specific educational data
 * based on FERPA compliance rules and consent status
 */
export const canAccessEducationalData = (
  dataType: string, 
  userRole: 'student' | 'parent' | 'educator' | 'administrator' | 'third_party',
  studentId?: string, 
  requestorId?: string
): boolean => {
  // Get consent status - in production, this would come from a database
  const hasConsent = getFerpaConsentStatus();
  
  // Check if the data type is protected by FERPA
  const isProtectedData = isFerpaProtectedData(dataType);
  
  if (!isProtectedData) {
    return true; // Non-protected data can be accessed
  }
  
  // Apply FERPA access rules
  switch (userRole) {
    case 'student':
      // Students can access their own data
      return studentId === requestorId;
    
    case 'parent':
      // Parents can access if they have proper authorization
      // In production, you would check the parent-child relationship
      return hasConsent;
    
    case 'educator':
    case 'administrator':
      // Educators & administrators can access for legitimate educational interests
      // In production, you would check their specific authorization
      return true;
    
    case 'third_party':
      // Third parties can only access with explicit consent
      return hasConsent;
    
    default:
      return false;
  }
};
