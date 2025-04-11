
/**
 * FERPA compliance utilities
 */

import { DirectoryPreference } from "@/components/compliance/ferpa/DirectoryPreferencesSection";

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
 * Gets the user's FERPA directory information sharing preferences
 * Returns an object with boolean values for each directory information category
 */
export const getFerpaDirectoryPreferences = (): DirectoryPreference => {
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
    return JSON.parse(savedPrefs) as DirectoryPreference;
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
export const setFerpaDirectoryPreferences = (preferences: DirectoryPreference): void => {
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
