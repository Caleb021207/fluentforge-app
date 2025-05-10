
/**
 * Age verification utilities
 */

/**
 * Checks if the user needs to complete age verification
 * Now always returns false since we've removed age verification
 */
export const needsAgeVerification = (): boolean => {
  return false;
};

/**
 * Sets the age verification status
 */
export const setAgeVerified = (verified: boolean): void => {
  localStorage.setItem("ageVerified", verified ? "true" : "false");
};

/**
 * Gets the user's birth year from local storage
 */
export const getUserBirthYear = (): string | null => {
  return localStorage.getItem("userBirthYear");
};

/**
 * Sets the user's birth year in local storage
 */
export const setUserBirthYear = (year: string): void => {
  localStorage.setItem("userBirthYear", year);
};

/**
 * Calculates user's age based on birth year
 * Returns null if birth year is not set
 */
export const getUserAge = (): number | null => {
  const birthYear = getUserBirthYear();
  if (!birthYear) return null;
  
  const currentYear = new Date().getFullYear();
  return currentYear - parseInt(birthYear);
};

/**
 * Checks if user is considered a child under COPPA (under 13)
 */
export const isUserChild = (): boolean => {
  const age = getUserAge();
  return age !== null && age < 13;
};
