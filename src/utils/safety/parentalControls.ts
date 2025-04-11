/**
 * Parental controls utilities
 */

import { getSafetyMode, setSafetyMode as setGlobalSafetyMode } from './safetyModes';

/**
 * Gets the current safety mode
 * @deprecated Use getSafetyMode from './safetyModes' instead
 */
export const getParentalSafetyMode = (): 'strict' | 'standard' => {
  return (localStorage.getItem("safetyMode") as 'strict' | 'standard') || 'standard';
};

/**
 * Sets the safety mode
 * @deprecated Use setSafetyMode from './safetyModes' instead
 */
export const setParentalSafetyMode = (mode: 'strict' | 'standard'): void => {
  localStorage.getItem("parentalControlsLocked") !== "true" && localStorage.setItem("safetyMode", mode);
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
  localStorage.getItem("parentalControlsLocked") !== "true" && 
    localStorage.setItem("parentalDataConsent", hasConsent ? "true" : "false");
};
