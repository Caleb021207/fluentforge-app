
/**
 * Safety mode utilities
 */

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
 * Checks if strict safety mode is enabled
 */
export const isStrictModeEnabled = (): boolean => {
  return getSafetyMode() === 'strict';
};

/**
 * Automatically set the appropriate safety mode based on user age
 * Sets strict mode for users under 13, standard mode otherwise
 */
export const setAgeSafetyMode = (age: number): void => {
  if (age < 13) {
    setSafetyMode('strict');
  } else {
    setSafetyMode('standard');
  }
};
