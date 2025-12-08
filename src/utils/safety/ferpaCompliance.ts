
/**
 * FERPA compliance utilities
 * Note: Parental consent is now handled in-person with teachers/schools
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
};

/**
 * Checks if user is allowed to access specific educational data
 * based on FERPA compliance rules
 * Note: Consent is handled in-person, so we just check role-based access
 */
export const canAccessEducationalData = (
  dataType: string, 
  userRole: 'student' | 'parent' | 'educator' | 'administrator' | 'third_party',
  studentId?: string, 
  requestorId?: string
): boolean => {
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
      // Parents verified in-person by school
      return true;
    
    case 'educator':
    case 'administrator':
      // Educators & administrators can access for legitimate educational interests
      return true;
    
    case 'third_party':
      // Third parties need explicit consent (handled in-person)
      return false;
    
    default:
      return false;
  }
};
