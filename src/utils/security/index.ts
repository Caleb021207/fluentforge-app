/**
 * Security utilities index - exports all security-related functions
 */

// Plain (non-cryptographic) client-side preference storage.
// The old encryptData/decryptData/encryptDataSecure/decryptDataSecure
// exports were encryption theater (hardcoded key in the bundle) and have
// been removed; see storage.ts for the honest replacement.
export { appStorage, createStorage } from './storage';

// Secure settings management
export {
  getSecureSetting,
  setSecureSetting,
  logSecurityEvent
} from './secureSettings';

// Security initialization
export {
  initializeSecureSettings,
  getSecurityConfig
} from './initializeSecureSettings';
