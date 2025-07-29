
/**
 * Security utilities index - exports all security-related functions
 */

// Data encryption for client-side storage
export {
  encryptData,
  decryptData,
  encryptDataSecure,
  decryptDataSecure,
  secureStorage
} from './dataEncryption';

// Secure settings management
export {
  getSecureSetting,
  setSecureSetting,
  checkRateLimit,
  logSecurityEvent
} from './secureSettings';

// Security initialization
export {
  initializeSecureSettings,
  getSecurityConfig
} from './initializeSecureSettings';
