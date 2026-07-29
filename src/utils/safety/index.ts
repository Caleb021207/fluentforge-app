
/**
 * Safety utilities index file - re-exports all safety utilities
 */

// Content filtering
export { 
  isSafeContent, 
  filterContent 
} from './contentFilter';

// Age verification (server-side COPPA gate)
export {
  needsAgeVerification,
  getAgeGateStatus,
  verifyAge,
  isUserChild,
  getSafetyMode,
  clearAgeGateCache
} from './ageVerification';

// Parental controls
export { 
  getDailyTimeLimit,
  areParentalControlsLocked,
  setParentalControlsLock,
  getParentalDataConsentStatus,
  setParentalDataConsentStatus,
  // Legacy exports with renamed functions
  getParentalSafetyMode,
  setParentalSafetyMode
} from './parentalControls';

// FERPA compliance
export { 
  ferpaProtectedDataTypes,
  isFerpaProtectedData,
  logDataAccess,
  canAccessEducationalData
} from './ferpaCompliance';

// Safety modes
export {
  getSafetyMode,
  setSafetyMode,
  isStrictModeEnabled,
  setAgeSafetyMode
} from './safetyModes';
