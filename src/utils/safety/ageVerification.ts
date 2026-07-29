/**
 * Age verification (COPPA).
 *
 * The under-13 decision is made SERVER-SIDE by the `verify-age` edge function
 * from the submitted birth year and stored on the profile
 * (`birth_year`, `is_minor`, `parental_consent_granted`, `safety_mode`).
 * Nothing here is authoritative — localStorage is only a UI cache so we don't
 * re-prompt on every render. A user clearing storage just gets re-prompted;
 * they cannot grant themselves adult status, because the profile trigger
 * blocks clients from writing those columns.
 */

import { fetchAgeGateStatus, submitAgeVerification, type AgeGateStatus } from "@/utils/serverWrites";

const CACHE_KEY = "ageGateStatus";

export type { AgeGateStatus };

/**
 * Reads the authoritative age-gate state from the server.
 */
export const getAgeGateStatus = async (): Promise<AgeGateStatus | null> => {
  const status = await fetchAgeGateStatus();
  if (status) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(status));
    } catch {
      /* storage unavailable — ignore, the server remains the source of truth */
    }
  }
  return status;
};

/**
 * True when the signed-in user has not yet completed server-side age verification.
 */
export const needsAgeVerification = async (): Promise<boolean> => {
  const status = await getAgeGateStatus();
  // Fail closed for signed-in users we can't read: prompt again rather than skip.
  return status ? status.needsVerification : false;
};

/**
 * Submits a birth year (and parental consent when applicable) for server-side
 * evaluation. Returns whether the user may use the service.
 */
export const verifyAge = async (birthYear: number, parentalConsent: boolean) => {
  const result = await submitAgeVerification(birthYear, parentalConsent);
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
  return result;
};

/**
 * Cached view of whether the user is a COPPA minor (<13). Server-derived.
 */
export const isUserChild = (): boolean => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? Boolean(JSON.parse(cached).isMinor) : false;
  } catch {
    return false;
  }
};

/**
 * Cached safety mode ('strict' for verified minors, 'standard' otherwise).
 */
export const getSafetyMode = (): "strict" | "standard" => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return JSON.parse(cached || "{}").safetyMode === "strict" ? "strict" : "standard";
  } catch {
    return "standard";
  }
};

export const clearAgeGateCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
};
